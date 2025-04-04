import { MeiliSearch } from 'meilisearch';
import {
   company,
   db,
   job_experience_levels,
   job_posting,
   job_posting_major,
   location,
   major,
   position,
} from '../../src/db/index.ts';
import { eq } from 'drizzle-orm';

export default async (meilisearch: MeiliSearch, index: string) => {
   const BATCH_SIZE = 500;
   let offset = 0;
   let totalIndexed = 0;
   let batchCount = 0;

   while (true) {
      // Fetch job postings in batches
      const jobPostingsRaw = await db
         .select({
            id: job_posting.id,
            job_type: job_posting.job_type,
            job_status: job_posting.job_status,
            coop_cycle: job_posting.coop_cycle,
            year: job_posting.year,
            job_length: job_posting.job_length,
            work_hours: job_posting.work_hours,
            openings: job_posting.openings,
            division_description: job_posting.division_description,
            position_description: job_posting.position_description,
            recommended_qualifications: job_posting.recommended_qualifications,
            minimum_gpa: job_posting.minimum_gpa,
            is_nonprofit: job_posting.is_nonprofit,
            exposure_hazardous_materials: job_posting.exposure_hazardous_materials,
            is_research_position: job_posting.is_research_position,
            is_third_party_employer: job_posting.is_third_party_employer,
            travel_required: job_posting.travel_required,
            transportation: job_posting.transportation,
            compensation_status: job_posting.compensation_status,
            compensation_details: job_posting.compensation_details,
            other_compensation: job_posting.other_compensation,
            created_at: job_posting.created_at,
            updated_at: job_posting.updated_at,
            position_id: position.id,
            position_name: position.name,
            company_id: company.id,
            company_name: company.name,
            location_id: location.id,
            location_city: location.city,
            location_state: location.state,
         })
         .from(job_posting)
         .innerJoin(position, eq(job_posting.position_id, position.id))
         .innerJoin(company, eq(position.company_id, company.id))
         .leftJoin(location, eq(job_posting.location_id, location.id))
         .limit(BATCH_SIZE)
         .offset(offset);

      // If no more records, break the loop
      if (jobPostingsRaw.length === 0) break;

      // Process each job posting to include majors and experience levels
      const jobPostingsWithMajorsPromises = jobPostingsRaw.map(async (posting) => {
         const majorsResult = await db
            .select({
               major_id: major.id,
               major_name: major.name,
            })
            .from(job_posting_major)
            .innerJoin(major, eq(job_posting_major.major_id, major.id))
            .where(eq(job_posting_major.job_posting_id, posting.id));

         const experience_levels = await db
            .select({
               levels: job_experience_levels.experience_level,
            })
            .from(job_experience_levels)
            .where(eq(job_experience_levels.job_posting_id, posting.id))
            .then((l) => l.map(({ levels }) => levels));

         return {
            ...posting,
            majors: majorsResult.map((m) => m.major_name),
            major_ids: majorsResult.map((m) => m.major_id),
            experience_levels,
         };
      });

      const jobPostings = await Promise.all(jobPostingsWithMajorsPromises);

      // Index the current batch
      await meilisearch.index(index).addDocuments(jobPostings);

      totalIndexed += jobPostings.length;
      batchCount++;
      offset += BATCH_SIZE;

      console.log(`Indexed batch ${batchCount} (${jobPostings.length} job postings)`);
   }

   console.log(`Completed indexing ${totalIndexed} job postings in ${batchCount} batches`);
};
