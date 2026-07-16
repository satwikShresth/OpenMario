/**
 * Updates instructor RMP (Rate My Professor) data in the database.
 *
 * Usage:
 *   bun run update-rmp
 */

import { eq } from 'drizzle-orm';
import {
   connectDb,
   instructor,
   isPlaceholderInstructor
} from '@openmario/db';
import { env } from '@env';
import { searchSchools, getProfessorRating } from '../rmp';

const db = connectDb(env.DATABASE_URL);

const RMP_SCHOOL_NAME = env.RMP_SCHOOL_NAME;
const RMP_DELAY_MS = env.RMP_DELAY_MS;

function sleep(ms: number): Promise<void> {
   return new Promise(resolve => setTimeout(resolve, ms));
}

async function resolveSchoolId(schoolName: string): Promise<string | null> {
   const edges = await searchSchools(schoolName);
   if (!edges || edges.length === 0) {
      console.error(`[scraper] No school found for "${schoolName}"`);
      return null;
   }
   const match = edges.find(e =>
      e.node.name.toLowerCase().includes(schoolName.toLowerCase())
   );
   const node = match?.node ?? edges[0]!.node;
   console.log(`[scraper] Using school: ${node.name} (id: ${node.id})`);
   return node.id;
}

async function clearPlaceholderRmp(inst: typeof instructor.$inferSelect): Promise<void> {
   if (
      inst.rmp_id == null &&
      inst.rmp_legacy_id == null &&
      inst.avg_rating == null &&
      inst.avg_difficulty == null &&
      inst.num_ratings == null
   ) {
      return;
   }

   await db
      .update(instructor)
      .set({
         avg_rating: null,
         avg_difficulty: null,
         num_ratings: null,
         rmp_id: null,
         rmp_legacy_id: null
      })
      .where(eq(instructor.id, inst.id));

   console.log(`[scraper] Cleared RMP data for placeholder instructor: ${inst.name}`);
}

async function main() {
   const schoolId = await resolveSchoolId(RMP_SCHOOL_NAME);
   if (!schoolId) {
      process.exit(1);
   }

   const instructors = await db.select().from(instructor);
   console.log(`[scraper] Found ${instructors.length} instructors to update`);

   let updated = 0;
   let skipped = 0;
   let failed = 0;
   let placeholders = 0;

   for (const inst of instructors) {
      if (isPlaceholderInstructor(inst.name)) {
         await clearPlaceholderRmp(inst);
         placeholders++;
         continue;
      }

      await sleep(RMP_DELAY_MS);

      const rating = await getProfessorRating(inst.name, schoolId);

      if (!rating) {
         console.warn(`[scraper] No RMP match for: ${inst.name}`);
         failed++;
         continue;
      }

      if (rating.numRatings === 0) {
         skipped++;
         continue;
      }

      await db
         .update(instructor)
         .set({
            avg_rating: String(rating.avgRating.toFixed(1)),
            avg_difficulty: String(rating.avgDifficulty.toFixed(1)),
            num_ratings: rating.numRatings,
            rmp_id: rating.rmpId,
            rmp_legacy_id: rating.rmpLegacyId,
            department: rating.department || inst.department
         })
         .where(eq(instructor.id, inst.id));

      updated++;
      console.log(
         `[scraper] Updated ${inst.name}: rating=${rating.avgRating} difficulty=${rating.avgDifficulty} n=${rating.numRatings}`
      );
   }

   console.log(
      `[scraper] Done. Updated=${updated} skipped=${skipped} failed=${failed} placeholders=${placeholders}`
   );
}

main().catch(err => {
   console.error('[scraper] Fatal error:', err);
   process.exit(1);
});
