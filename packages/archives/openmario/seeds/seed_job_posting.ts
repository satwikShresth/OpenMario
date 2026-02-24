import {
   company,
   job_experience_levels,
   job_posting,
   job_posting_major,
   location,
   major,
   position,
} from '../../../src/db/index.ts';
import { appendFileSync, writeFileSync } from 'node:fs';
import { db } from '../../../src/db/index.ts';
import { and, eq } from 'drizzle-orm';
import jobData from './assets/job_posting.json' with { type: 'json' };
import locationData from './assets/cleaned_location.json' with { type: 'json' };
import locationDataCleaned from './assets/ccleaned_location.json' with {
   type: 'json',
};
import cleanedMajorData from './assets/cleaned_majors_map.json' with {
   type: 'json',
};

const problematicAddressesFile = 'problematic_addresses.txt';
const problematicMajorsFile = 'problematic_majors.txt';
const BATCH_SIZE = 50; // Process jobs in batches of 50

function logProblematicAddress(employer, position, locationString) {
   const logEntry = `
Employer: ${employer}
Position: ${position}
Location String: ${locationString}
-----------------------------------------
`;

   appendFileSync(problematicAddressesFile, logEntry);
}

function logProblematicMajor(employer, position, majorString) {
   const logEntry = `
Employer: ${employer}
Position: ${position}
Major String: ${majorString}
-----------------------------------------
`;

   appendFileSync(problematicMajorsFile, logEntry);
}

// State map constant to avoid recalculating
const STATE_MAP = {
   'AL': 'Alabama',
   'AK': 'Alaska',
   'AZ': 'Arizona',
   'AR': 'Arkansas',
   'CA': 'California',
   'CO': 'Colorado',
   'CT': 'Connecticut',
   'DE': 'Delaware',
   'FL': 'Florida',
   'GA': 'Georgia',
   'HI': 'Hawaii',
   'ID': 'Idaho',
   'IL': 'Illinois',
   'IN': 'Indiana',
   'IA': 'Iowa',
   'KS': 'Kansas',
   'KY': 'Kentucky',
   'LA': 'Louisiana',
   'ME': 'Maine',
   'MD': 'Maryland',
   'MA': 'Massachusetts',
   'MI': 'Michigan',
   'MN': 'Minnesota',
   'MS': 'Mississippi',
   'MO': 'Missouri',
   'MT': 'Montana',
   'NE': 'Nebraska',
   'NV': 'Nevada',
   'NH': 'New Hampshire',
   'NJ': 'New Jersey',
   'NM': 'New Mexico',
   'NY': 'New York',
   'NC': 'North Carolina',
   'ND': 'North Dakota',
   'OH': 'Ohio',
   'OK': 'Oklahoma',
   'OR': 'Oregon',
   'PA': 'Pennsylvania',
   'RI': 'Rhode Island',
   'SC': 'South Carolina',
   'SD': 'South Dakota',
   'TN': 'Tennessee',
   'TX': 'Texas',
   'UT': 'Utah',
   'VT': 'Vermont',
   'VA': 'Virginia',
   'WA': 'Washington',
   'WV': 'West Virginia',
   'WI': 'Wisconsin',
   'WY': 'Wyoming',
   'DC': 'District of Columbia',
};

// Helper function to get state name from state code
function getStateName(stateCode) {
   return STATE_MAP[stateCode.toUpperCase()] || 'Unknown';
}

// Parse job duration to extract cycle
function parseCycle(duration) {
   if (duration.includes('Fall/Winter')) return 'Fall/Winter';
   if (duration.includes('Winter/Spring')) return 'Winter/Spring';
   if (duration.includes('Spring/Summer')) return 'Spring/Summer';
   if (duration.includes('Summer/Fall')) return 'Summer/Fall';
   return 'Fall/Winter'; // Default
}

// Parse job duration to extract year
function parseYear(duration) {
   // Extract year from a string like "Spring/Summer (March 2023 - Sept 2023)"
   const match = duration.match(/\d{4}/);
   if (match) {
      return parseInt(match[0]);
   }
   return new Date().getFullYear(); // Default to current year
}

// Cache for companies to reduce DB lookups
const companyCache = new Map();

// Helper function to find or create a company and return its ID
async function findOrCreateCompany(companyName) {
   // Check cache first
   if (companyCache.has(companyName)) {
      return companyCache.get(companyName);
   }

   // Insert with onConflictDoNothing and return the ID
   const result = await db.insert(company)
      .values({ name: companyName })
      .onConflictDoUpdate({
         target: company.name,
         set: { name: companyName },
      })
      .returning({ id: company.id });

   let companyId;
   if (result.length > 0) {
      companyId = result[0].id;
   } else {
      // If no result is returned, query the existing record
      const existing = await db.select({ id: company.id })
         .from(company)
         .where(eq(company.name, companyName))
         .limit(1);

      companyId = existing[0].id;
   }

   // Store in cache
   companyCache.set(companyName, companyId);

   return companyId;
}

// Cache for positions to reduce DB lookups
const positionCache = new Map();

// Helper function to find or create a position
async function findOrCreatePosition(positionName, companyId) {
   // Create a cache key combining position name and company ID
   const cacheKey = `${positionName}:${companyId}`;

   // Check cache first
   if (positionCache.has(cacheKey)) {
      return positionCache.get(cacheKey);
   }

   // Insert with onConflictDoNothing and return the ID
   const result = await db.insert(position)
      .values({
         name: positionName,
         company_id: companyId,
      })
      .onConflictDoUpdate({
         target: [position.company_id, position.name],
         set: {
            name: positionName,
            company_id: companyId,
         },
      })
      .returning({ id: position.id });

   let positionId;
   if (result.length > 0) {
      positionId = result[0].id;
   } else {
      // If no result is returned, query the existing record
      const existing = await db.select({ id: position.id })
         .from(position)
         .where(and(
            eq(position.name, positionName),
            eq(position.company_id, companyId),
         ))
         .limit(1);

      positionId = existing[0].id;
   }

   // Store in cache
   positionCache.set(cacheKey, positionId);

   return positionId;
}

// Cache for locations to reduce DB lookups
const locationCache = new Map();

// Helper function to find or create a location
async function findOrCreateLocation(city, state, stateCode) {
   // Create a cache key combining city, state, and state code
   const cacheKey = `${city}:${state}:${stateCode}`;

   // Check cache first
   if (locationCache.has(cacheKey)) {
      return locationCache.get(cacheKey);
   }

   // Insert with onConflictDoNothing and return the ID
   const result = await db.insert(location)
      .values({
         city,
         state,
         state_code: stateCode,
      })
      .onConflictDoUpdate({
         target: [location.city, location.state, location.state_code],
         set: {
            city,
            state,
            state_code: stateCode,
         },
      })
      .returning({ id: location.id });

   let locationId;
   if (result.length > 0) {
      locationId = result[0].id;
   } else {
      // If no result is returned, query the existing record
      const existing = await db.select({ id: location.id })
         .from(location)
         .where(and(
            eq(location.city, city),
            eq(location.state, state),
            eq(location.state_code, stateCode),
         ))
         .limit(1);

      locationId = existing[0].id;
   }

   // Store in cache
   locationCache.set(cacheKey, locationId);

   return locationId;
}

// Cache for majors to reduce DB lookups
const majorCache = new Map();

// Helper function to find or create a major
async function findOrCreateMajor(majorName, programLevel) {
   // Check cache first
   if (majorCache.has(majorName)) {
      return majorCache.get(majorName);
   }

   // Insert with onConflictDoNothing and return the ID
   const result = await db.insert(major)
      .values({
         name: majorName,
         program_level: programLevel,
      })
      .onConflictDoUpdate({
         target: major.name,
         set: {
            name: majorName,
            program_level: programLevel,
         },
      })
      .returning({ id: major.id });

   let majorId;
   if (result.length > 0) {
      majorId = result[0].id;
   } else {
      // If no result is returned, query the existing record
      const existing = await db.select({ id: major.id })
         .from(major)
         .where(eq(major.name, majorName))
         .limit(1);

      majorId = existing[0].id;
   }

   // Store in cache
   majorCache.set(majorName, majorId);

   return majorId;
}

// Process a single job posting
async function processJob(job) {
   try {
      // 1. Find or create company
      const companyId = await findOrCreateCompany(job.Employer);

      // 2. Find or create position
      const positionId = await findOrCreatePosition(job.Position, companyId);

      // 3. Get location from locationData or use Unknown
      const locationString = job.Location.Address;
      let locationId = null;

      if (locationData[locationString]) {
         // Location exists in the cleaned location data
         const stateCity = locationData[locationString];
         const value = stateCity in locationDataCleaned
            ? locationDataCleaned[stateCity]
            : stateCity;

         const [city, stateCode] = value.split(', ');
         const state = getStateName(stateCode);

         locationId = await findOrCreateLocation(city, state, stateCode);
      } else {
         // Location not found in locationData, log as problematic
         logProblematicAddress(job.Employer, job.Position, locationString);
      }

      // 4. Create job posting
      const jobPostingResult = await db.insert(job_posting)
         .values({
            position_id: positionId,
            location_id: locationId,
            job_type: job["Job's Type"],
            job_status: job["Job's Status"],
            coop_cycle: parseCycle(job["Job's Duration"]),
            year: parseYear(job["Job's Duration"]),
            job_length: parseInt(job["Job's Length"].split(' ')[0]) || 2,
            work_hours: parseInt(job.Compensation['Hours Per Week']) || 40,
            openings: parseInt(job['Number of Openings']) || 1,
            division_description: job['Division/Location/Company Description'],
            position_description: job['Position Description'],
            recommended_qualifications: job.Qualifications['Recommended Qualifications'],
            minimum_gpa: job['Minimum GPA'] !== '- None -' ? parseFloat(job['Minimum GPA']) : null,
            is_nonprofit: !!job['Non-Profit Co.'],
            exposure_hazardous_materials: !!job['Exposure to hazardous materials'],
            is_research_position: !!job['Research Position'] &&
               ['yes', 'true'].includes(job['Research Position'].toLowerCase()),
            is_third_party_employer: !!job['Third-party employer'] &&
               ['yes', 'true'].includes(job['Third-party employer'].toLowerCase()),
            travel_required: !!job.Location['Travel Required'] &&
               ['yes', 'true'].includes(
                  job.Location['Travel Required'].toLowerCase(),
               ),
            citizenship_restriction: job['Citizenship Restriction'],
            pre_employment_screening: job['Pre-Employment Screening'],
            transportation: job.Location['Transportation'],
            compensation_status: job.Compensation['Status'],
            compensation_details: job.Compensation['Details'],
            other_compensation: job.Compensation['Other'],
         })
         .returning({ id: job_posting.id })
         .onConflictDoNothing();

      if (!jobPostingResult || jobPostingResult.length === 0) {
         return; // Skip if job posting wasn't created
      }

      const jobPostingId = jobPostingResult[0].id;

      // 5. Add experience levels
      if (job.Qualifications['Experience Levels']) {
         const experienceLevelsToInsert = [];

         for (
            const [level, description] of Object.entries(
               job.Qualifications['Experience Levels'],
            )
         ) {
            experienceLevelsToInsert.push({
               job_posting_id: jobPostingId,
               experience_level: level,
               description,
            });
         }

         // Batch insert experience levels
         if (experienceLevelsToInsert.length > 0) {
            await db.insert(job_experience_levels)
               .values(experienceLevelsToInsert)
               .onConflictDoNothing();
         }
      }

      // 6. Add majors if available
      if (job.Qualifications['Majors Sought']) {
         const majorsToInsert = [];
         const majorStrings = job.Qualifications['Majors Sought'];

         for (const majorString of majorStrings) {
            if (cleanedMajorData[majorString]) {
               const majorName = cleanedMajorData[majorString];
               const majorId = await findOrCreateMajor(majorName, 'Undergraduate');

               majorsToInsert.push({
                  job_posting_id: jobPostingId,
                  major_id: majorId,
               });
            } else {
               // Major not found in cleanedMajorData, log as problematic
               logProblematicMajor(job.Employer, job.Position, majorString);
            }
         }

         // Batch insert majors
         if (majorsToInsert.length > 0) {
            await db.insert(job_posting_major)
               .values(majorsToInsert)
               .onConflictDoNothing();
         }
      }

      return `Successfully added job: ${job.Position} at ${job.Employer}`;
   } catch (error) {
      return `Error processing job ${job.Position} at ${job.Employer}: ${error.message}`;
   }
}

// Process a batch of jobs
async function processBatch(batch, batchIndex) {
   console.log(`Processing batch ${batchIndex + 1} (${batch.length} jobs)...`);

   const results = await Promise.all(batch.map((job) => processJob(job)));

   // Log results in a memory-efficient way
   for (const result of results) {
      if (result) console.log(result);
   }

   // Clear any pending timeouts or intervals to prevent memory leaks
   globalThis.gc && globalThis.gc();

   return `Batch ${batchIndex + 1} completed`;
}

// Main seeding function
async function seedDatabase() {
   console.log('Starting database seeding...');
   console.log(`Total jobs to process: ${jobData.length}`);

   // Clear the problematic files before starting
   writeFileSync(
      problematicAddressesFile,
      '# Problematic Addresses for Manual Review\n\n',
   );
   writeFileSync(
      problematicMajorsFile,
      '# Problematic Majors for Manual Review\n\n',
   );
   console.log(`Created tracking files for problematic data`);

   // Split the data into batches
   const batches = [];
   for (let i = 0; i < jobData.length; i += BATCH_SIZE) {
      batches.push(jobData.slice(i, i + BATCH_SIZE));
   }

   console.log(
      `Split data into ${batches.length} batches of approximately ${BATCH_SIZE} jobs each`,
   );

   // Process batches sequentially to avoid overwhelming memory
   for (let i = 0; i < batches.length; i++) {
      const batchResult = await processBatch(batches[i], i);
      console.log(batchResult);

      // Clear caches periodically to prevent memory bloat
      if (i % 5 === 4) {
         console.log('Clearing caches to free memory...');
         companyCache.clear();
         positionCache.clear();
         locationCache.clear();
         majorCache.clear();

         // Force garbage collection if available
         globalThis.gc && globalThis.gc();
      }
   }

   console.log('Database seeding completed');

   // Final cleanup
   companyCache.clear();
   positionCache.clear();
   locationCache.clear();
   majorCache.clear();
}

// Execute the seeding function
export default seedDatabase;
