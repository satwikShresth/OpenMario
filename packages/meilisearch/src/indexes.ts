import type { MeiliSearch } from 'meilisearch';
import type { SectionDocument } from './types/section';
import type { CompanyDocument } from './types/company';
import type { ProfessorDocument } from './types/professor';
import type { SubmissionDocument } from './types/submission';

export const INDEX_NAMES = {
   sections: 'sections',
   companies: 'companies',
   professors: 'professors',
   submissions: 'submissions',
   job_postings: 'job_postings'
} as const;

export type IndexName = (typeof INDEX_NAMES)[keyof typeof INDEX_NAMES];

export const sectionsIndex = (client: MeiliSearch) =>
   client.index<SectionDocument>(INDEX_NAMES.sections);

export const companiesIndex = (client: MeiliSearch) =>
   client.index<CompanyDocument>(INDEX_NAMES.companies);

export const professorsIndex = (client: MeiliSearch) =>
   client.index<ProfessorDocument>(INDEX_NAMES.professors);

export const submissionsIndex = (client: MeiliSearch) =>
   client.index<SubmissionDocument>(INDEX_NAMES.submissions);
