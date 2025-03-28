import { company, position, job_posting, location, major, job_posting_major } from "../../../src/db/index.ts";
import { db } from "../../../src/db/index.ts";
import { eq } from "drizzle-orm";
import { MeiliSearch } from 'meilisearch';

export default async () => {
  const meilisearch = new MeiliSearch({
    host: 'http://localhost:7700',
    apiKey: 'A8L0x9-E2qolp6X2_zOY3NUo4i92Juex-UZb9OzilTs=',
  });
  
  const index = await meilisearch.createIndex('job_postings', { primaryKey: 'id' });
  
  await meilisearch.index('job_postings').updateSearchableAttributes([
    'position_name',
    'company_name',
    'location_city',
    'location_state',
    'division_description',
    'position_description',
    'recommended_qualifications',
    'majors',
    'job_type',
    'compensation_status',
    'coop_cycle'
  ]);
  
  // Configure filterable attributes
  await meilisearch.index('job_postings').updateFilterableAttributes([
    'company_id',
    'position_id',
    'location_id',
    'job_type',
    'job_status',
    'coop_cycle',
    'year',
    'job_length',
    'work_hours',
    'minimum_gpa',
    'is_nonprofit',
    'is_research_position',
    'citizenship_restriction',
    'compensation_status',
    'major_ids',
    'experience_levels'
  ]);
  
  // Configure sortable attributes
  await meilisearch.index('job_postings').updateSortableAttributes([
    'created_at',
    'updated_at',
    'year',
    'job_length',
    'minimum_gpa',
    'work_hours'
  ]);

  // Fetch job postings with related data
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
      recommended_qualifications: job_posting.recommended_qualifications, // Fixed typo here
      minimum_gpa: job_posting.minimum_gpa,
      is_nonprofit: job_posting.is_nonprofit,
      exposure_hazardous_materials: job_posting.exposure_hazardous_materials, // Fixed field name
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
      location_state: location.state
    })
    .from(job_posting)
    .innerJoin(position, eq(job_posting.position_id, position.id))
    .innerJoin(company, eq(position.company_id, company.id))
    .leftJoin(location, eq(job_posting.location_id, location.id));
    
  // Add majors to each job posting
  const jobPostingsWithMajorsPromises = jobPostingsRaw.map(async (posting) => {
    const majorsResult = await db
      .select({
        major_id: major.id,
        major_name: major.name
      })
      .from(job_posting_major)
      .innerJoin(major, eq(job_posting_major.major_id, major.id))
      .where(eq(job_posting_major.job_posting_id, posting.id));
    
    const majors = majorsResult.map(m => m.major_name);
    const major_ids = majorsResult.map(m => m.major_id);
    
    return {
      ...posting,
      majors,
      major_ids
    };
  });
  
  // Wait for all promises to resolve
  const jobPostings = await Promise.all(jobPostingsWithMajorsPromises);
  
  // Index the job postings in MeiliSearch
  await meilisearch.index('job_postings').addDocuments(jobPostings);
  
  console.log("Indexed job postings:", jobPostings);
}
