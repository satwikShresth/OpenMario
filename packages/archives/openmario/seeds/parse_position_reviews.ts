import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'node-html-parser';

const POSITIONS_DIR = join(process.env.HOME!, 'Projects', 'drexel-scraper', 'src', 'output', 'positions');
const MAPPING_PATH = join(process.env.HOME!, 'Projects', 'drexel-scraper', 'src', 'position_job_id_mapping.json');
const OUTPUT_PATH = join(process.env.HOME!, 'Projects', 'drexel-scraper', 'src', 'position_reviews.json');

// Build job_id -> position_id lookup from the mapping file
const mappingRaw: { position_id: string; job_id?: string; job_ids: string[] }[] =
   JSON.parse(readFileSync(MAPPING_PATH, 'utf-8'));

const jobIdToPositionId = new Map<string, string>();
for (const entry of mappingRaw) {
   for (const jid of entry.job_ids) {
      jobIdToPositionId.set(jid, entry.position_id);
   }
}
console.log(`Loaded ${jobIdToPositionId.size} job_id → position_id mappings`);

// --- Parsing helpers ---

function getText(cell: any): string {
   return cell?.text?.replace(/\s+/g, ' ').trim() ?? '';
}

function notReported(val: string): boolean {
   return val === '' || val.toLowerCase().includes('not reported') || val === '--';
}

/**
 * For a checkbox-style table row where columns have headers and the selected
 * column contains `X` (strongtext), return the 0-based index of the selected column.
 * Returns null if no X is found.
 */
function getCheckedColumnIndex(row: any): number | null {
   const cells = row.querySelectorAll('td');
   for (let i = 0; i < cells.length; i++) {
      if (cells[i].querySelector('.strongtext')?.text?.trim() === 'X') {
         return i;
      }
   }
   return null;
}

/** Parse "Yes"/"No" text from a cell, returns null if neither */
function parseYesNo(text: string): boolean | null {
   const t = text.trim().toLowerCase();
   if (t === 'yes') return true;
   if (t === 'no') return false;
   return null;
}

/**
 * Satisfaction scale: columns are [label, Very Satisfied, Satisfied, Dissatisfied, Very Dissatisfied, spacer]
 * checkedIdx 1 → 4, 2 → 3, 3 → 2, 4 → 1
 */
function satisfactionScore(checkedIdx: number | null): number | null {
   if (checkedIdx === null) return null;
   const map: Record<number, number> = { 1: 4, 2: 3, 3: 2, 4: 1 };
   return map[checkedIdx] ?? null;
}

/**
 * Competency scale: columns are [label, 4-Four, 3-Three, 2-Two, 1-One, Unable to Rate]
 * checkedIdx 1 → 4, 2 → 3, 3 → 2, 4 → 1, 5 → null (unable)
 */
function competencyScore(checkedIdx: number | null): number | null {
   if (checkedIdx === null) return null;
   const map: Record<number, number | null> = { 1: 4, 2: 3, 3: 2, 4: 1, 5: null };
   return map[checkedIdx] !== undefined ? map[checkedIdx] : null;
}

/**
 * Coop sequence: columns are [label, Only Co-op, First Co-op, Second Co-op, Third Co-op, spacer]
 * checkedIdx 1 → Only, 2 → First, 3 → Second, 4 → Third
 */
function parseCoopSequence(checkedIdx: number | null): string | null {
   if (checkedIdx === null) return null;
   const map: Record<number, string> = { 1: 'Only', 2: 'First', 3: 'Second', 4: 'Third' };
   return map[checkedIdx] ?? null;
}

/**
 * Extract year from terms like "Spring/Summer (March 2023 - Sept 2023)" → 2023
 * or "Fall/Winter (Sept 2021 - March 2022)" → 2022 (end year)
 */
function parseYear(terms: string): number | null {
   const years = [...terms.matchAll(/\b(20\d{2})\b/g)].map(m => parseInt(m[1]));
   if (years.length === 0) return null;
   return Math.max(...years);
}

/**
 * Map terms string to coop_cycle enum value.
 * Handles both "Spring/Summer (...)" and older single-season "Spring (...)" formats.
 */
function parseCoopCycle(terms: string): string | null {
   if (/fall\/winter/i.test(terms)) return 'Fall/Winter';
   if (/winter\/spring/i.test(terms)) return 'Winter/Spring';
   if (/spring\/summer/i.test(terms)) return 'Spring/Summer';
   if (/summer\/fall/i.test(terms)) return 'Summer/Fall';
   // Older single-season format: "Spring (April ... - June ...)"
   if (/^spring/i.test(terms)) return 'Spring/Summer';
   if (/^summer/i.test(terms)) return 'Summer/Fall';
   if (/^fall/i.test(terms)) return 'Fall/Winter';
   if (/^winter/i.test(terms)) return 'Winter/Spring';
   return null;
}

// --- Main parser ---

function parseReviewFile(html: string, jobId: string, reviewIndex: number): any | null {
   const root = parse(html);

   // --- Header: Terms of Employment ---
   // Scan all datadisplaytable rows — avoids case-sensitivity issues with SUMMARY attr
   const allRows = root.querySelectorAll('table.datadisplaytable tr');

   let termsOfEmployment = '';
   for (const row of allRows) {
      const label = getText(row.querySelector('.ddlabel'));
      const val = getText(row.querySelector('.dddefault'));
      if (/terms? of employment/i.test(label)) {
         termsOfEmployment = val;
         break;
      }
   }

   const coopCycle = parseCoopCycle(termsOfEmployment);
   const year = parseYear(termsOfEmployment);
   if (!coopCycle || !year) return null; // can't insert without these

   // --- Archive consent ---
   let releasedToArchive: boolean | null = null;
   for (const row of allRows) {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
         const q = getText(cells[0]);
         if (/release your ES&P/i.test(q) || /release your es.*p/i.test(q)) {
            releasedToArchive = parseYesNo(getText(cells[1]));
            break;
         }
      }
   }
   // We include all reviews regardless of consent flag (data is already public/scraped)

   // --- Employment info ---
   let coopSequence: string | null = null;
   let department: string | null = null;
   let daysPerWeek: number | null = null;
   let shiftWork: boolean | null = null;
   let overtimeRequired: boolean | null = null;
   let publicTransit: boolean | null = null;
   let housingAssistance: boolean | null = null;

   for (const row of allRows) {
      const cells = row.querySelectorAll('td');
      if (cells.length === 0) continue;
      const firstText = getText(cells[0]);

      // "This was my:" — checkbox row with 5 data cols
      if (/this was my/i.test(firstText) && cells.length >= 5) {
         coopSequence = parseCoopSequence(getCheckedColumnIndex(row));
         continue;
      }

      if (cells.length >= 2) {
         const val = getText(cells[1]);

         if (/department in which you were employed/i.test(firstText)) {
            department = notReported(val) ? null : val;
         } else if (/number of days worked per week/i.test(firstText)) {
            const n = parseInt(val);
            daysPerWeek = isNaN(n) ? null : n;
         } else if (/was shift work required/i.test(firstText)) {
            shiftWork = parseYesNo(val);
         } else if (/was overtime required/i.test(firstText)) {
            overtimeRequired = parseYesNo(val);
         } else if (/public transportation available for commuting/i.test(firstText)) {
            publicTransit = parseYesNo(val);
         } else if (/did your employer assist you in securing housing/i.test(firstText)) {
            housingAssistance = parseYesNo(val);
         }
      }
   }

   // --- Co-op Job Evaluation (satisfaction ratings) ---
   // The satisfaction section has a header row + 6 data rows
   // Each data row: [question label, Very Satisfied col, Satisfied col, Dissatisfied col, Very Dissatisfied col, spacer]
   let ratingCollaboration: number | null = null;
   let ratingWorkVariety: number | null = null;
   let ratingRelationships: number | null = null;
   let ratingSupervisorAccess: number | null = null;
   let ratingTraining: number | null = null;
   let ratingOverall: number | null = null;
   let wouldRecommend: boolean | null = null;
   let descriptionAccurate: boolean | null = null;
   let bestFeatures: string | null = null;
   let challenges: string | null = null;
   let resumeDescription: string | null = null;

   // Find rows that contain the satisfaction scale header to locate the section
   for (const row of allRows) {
      const cells = row.querySelectorAll('td');
      if (cells.length === 0) continue;

      const labelText = getText(cells[0]);
      const isCheckboxRow = cells.length >= 5;

      if (isCheckboxRow && /collaborate with colleagues/i.test(labelText)) {
         ratingCollaboration = satisfactionScore(getCheckedColumnIndex(row));
      } else if (isCheckboxRow && /quantity and variety of work/i.test(labelText)) {
         ratingWorkVariety = satisfactionScore(getCheckedColumnIndex(row));
      } else if (isCheckboxRow && /meaningful professional relationships/i.test(labelText)) {
         ratingRelationships = satisfactionScore(getCheckedColumnIndex(row));
      } else if (isCheckboxRow && /access you had to your supervisor/i.test(labelText)) {
         ratingSupervisorAccess = satisfactionScore(getCheckedColumnIndex(row));
      } else if (isCheckboxRow && /training provided by the employer/i.test(labelText)) {
         ratingTraining = satisfactionScore(getCheckedColumnIndex(row));
      } else if (isCheckboxRow && /overall job satisfaction/i.test(labelText)) {
         ratingOverall = satisfactionScore(getCheckedColumnIndex(row));
      } else if (cells.length >= 2 && /would you recommend this position/i.test(labelText)) {
         wouldRecommend = parseYesNo(getText(cells[1]));
      } else if (cells.length >= 2 && /job description was accurate/i.test(labelText)) {
         descriptionAccurate = parseYesNo(getText(cells[1]));
      } else if (cells.length >= 2 && /best features of your position/i.test(labelText)) {
         const v = getText(cells[1]);
         bestFeatures = notReported(v) ? null : v;
      } else if (cells.length >= 2 && /challenges.*drawbacks/i.test(labelText)) {
         const v = getText(cells[1]);
         challenges = notReported(v) ? null : v;
      } else if (cells.length >= 2 && /describe your co-op position as you would on your resume/i.test(labelText)) {
         const v = getText(cells[1]);
         resumeDescription = notReported(v) ? null : v;
      }
   }

   // --- Career Competencies ---
   // Each competency row: [label, 4-Four, 3-Three, 2-Two, 1-One, Unable to Rate]
   let compWrittenComm: number | null = null;
   let compVerbalComm: number | null = null;
   let compCommStyle: number | null = null;
   let compOriginalIdeas: number | null = null;
   let compProblemSolving: number | null = null;
   let compInfoEvaluation: number | null = null;
   let compDataDecisions: number | null = null;
   let compEthicalStandards: number | null = null;
   let compTechnologyUse: number | null = null;
   let compGoalSetting: number | null = null;
   let compDiversity: number | null = null;
   let compWorkHabits: number | null = null;
   let compProactive: number | null = null;

   for (const row of allRows) {
      const cells = row.querySelectorAll('td');
      if (cells.length < 5) continue;
      const label = getText(cells[0]);

      if (/written communication/i.test(label)) {
         compWrittenComm = competencyScore(getCheckedColumnIndex(row));
      } else if (/verbal communication/i.test(label)) {
         compVerbalComm = competencyScore(getCheckedColumnIndex(row));
      } else if (/adjusting communication style/i.test(label)) {
         compCommStyle = competencyScore(getCheckedColumnIndex(row));
      } else if (/contributing original and relevant/i.test(label)) {
         compOriginalIdeas = competencyScore(getCheckedColumnIndex(row));
      } else if (/critically analyzing and solving/i.test(label)) {
         compProblemSolving = competencyScore(getCheckedColumnIndex(row));
      } else if (/accessing and evaluating relevant/i.test(label)) {
         compInfoEvaluation = competencyScore(getCheckedColumnIndex(row));
      } else if (/making well-reasoned.*data-supported/i.test(label)) {
         compDataDecisions = competencyScore(getCheckedColumnIndex(row));
      } else if (/upholding ethical standards/i.test(label)) {
         compEthicalStandards = competencyScore(getCheckedColumnIndex(row));
      } else if (/making appropriate use of technology/i.test(label)) {
         compTechnologyUse = competencyScore(getCheckedColumnIndex(row));
      } else if (/setting goals and monitoring/i.test(label)) {
         compGoalSetting = competencyScore(getCheckedColumnIndex(row));
      } else if (/working effectively with people who have diverse/i.test(label)) {
         compDiversity = competencyScore(getCheckedColumnIndex(row));
      } else if (/maintaining effective work habits/i.test(label)) {
         compWorkHabits = competencyScore(getCheckedColumnIndex(row));
      } else if (/proactively addressing issues/i.test(label)) {
         compProactive = competencyScore(getCheckedColumnIndex(row));
      }
   }

   return {
      job_id: jobId,
      review_index: reviewIndex,
      coop_cycle: coopCycle,
      year,
      coop_sequence: coopSequence,
      department,
      days_per_week: daysPerWeek,
      shift_work_required: shiftWork,
      overtime_required: overtimeRequired,
      public_transit_available: publicTransit,
      employer_housing_assistance: housingAssistance,
      rating_collaboration: ratingCollaboration,
      rating_work_variety: ratingWorkVariety,
      rating_relationships: ratingRelationships,
      rating_supervisor_access: ratingSupervisorAccess,
      rating_training: ratingTraining,
      rating_overall: ratingOverall,
      would_recommend: wouldRecommend,
      description_accurate: descriptionAccurate,
      best_features: bestFeatures,
      challenges,
      resume_description: resumeDescription,
      comp_written_comm: compWrittenComm,
      comp_verbal_comm: compVerbalComm,
      comp_comm_style: compCommStyle,
      comp_original_ideas: compOriginalIdeas,
      comp_problem_solving: compProblemSolving,
      comp_info_evaluation: compInfoEvaluation,
      comp_data_decisions: compDataDecisions,
      comp_ethical_standards: compEthicalStandards,
      comp_technology_use: compTechnologyUse,
      comp_goal_setting: compGoalSetting,
      comp_diversity: compDiversity,
      comp_work_habits: compWorkHabits,
      comp_proactive: compProactive
   };
}

// --- Walk all positions ---

const jobDirs = readdirSync(POSITIONS_DIR, { withFileTypes: true })
   .filter(d => d.isDirectory())
   .map(d => d.name);

console.log(`Found ${jobDirs.length} position directories`);

const reviews: any[] = [];
let parsed = 0;
let skipped = 0;
let noMapping = 0;

for (const jobId of jobDirs) {
   const positionId = jobIdToPositionId.get(jobId);
   if (!positionId) {
      noMapping++;
      continue;
   }

   const reviewDir = join(POSITIONS_DIR, jobId, '1');
   if (!existsSync(reviewDir)) continue;

   const reviewFiles = readdirSync(reviewDir)
      .filter(f => f.endsWith('.html'))
      .sort((a, b) => parseInt(a) - parseInt(b));

   for (const file of reviewFiles) {
      const reviewIndex = parseInt(file.replace('.html', ''));
      const html = readFileSync(join(reviewDir, file), 'utf-8');

      const record = parseReviewFile(html, jobId, reviewIndex);
      if (!record) {
         skipped++;
         continue;
      }

      reviews.push({ position_id: positionId, ...record });
      parsed++;
   }
}

console.log(`Parsed:     ${parsed} reviews`);
console.log(`Skipped:    ${skipped} (missing coop_cycle/year)`);
console.log(`No mapping: ${noMapping} job directories`);

writeFileSync(OUTPUT_PATH, JSON.stringify(reviews, null, 2), 'utf-8');
console.log(`\nOutput written to: ${OUTPUT_PATH}`);

process.exit(0);
