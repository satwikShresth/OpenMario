const BASE =
   process.env.CLIENT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
   'https://openmario.com';

export const courseUrl = (courseId: string | number) =>
   `${BASE}/courses/explore/${courseId}`;

export const professorUrl = (professorId: string | number) =>
   `${BASE}/professors/${professorId}`;

export const companyUrl = (companyId: string | number) =>
   `${BASE}/companies/${companyId}`;

export const positionUrl = (
   companyId: string | number,
   positionId: string | number
) => `${BASE}/companies/${companyId}/${positionId}`;

export const salarySearchUrl = (query: string) =>
   `${BASE}/salary?search=${encodeURIComponent(query)}`;

export type PlanOfStudyLinkOptions = {
   planEncoded: string
   action?: 'create' | 'update' | 'replace'
   name?: string
   id?: string
   setDefault?: boolean
}

export const planOfStudyUrl = (opts: PlanOfStudyLinkOptions) => {
   const params = new URLSearchParams()
   params.set('plan', opts.planEncoded)
   params.set('action', opts.action ?? 'create')
   if (opts.name) params.set('name', opts.name)
   if (opts.id) params.set('id', opts.id)
   if (opts.setDefault !== false) params.set('default', '1')
   return `${BASE}/courses/plan?${params.toString()}`
}

export type SalaryReportLinkOptions = {
   salariesEncoded: string
   idx?: number
}

export const salaryReportUrl = (opts: SalaryReportLinkOptions) => {
   const params = new URLSearchParams()
   params.set('salaries', opts.salariesEncoded)
   if (opts.idx != null && opts.idx > 0) params.set('idx', String(opts.idx))
   return `${BASE}/salary/report?${params.toString()}`
}

export const LINKING_INSTRUCTIONS = `CRITICAL — On EVERY answer, hyperlink courses, professors, companies, positions, AND salaries using real IDs from tool results (never invent IDs). Prefer the openmario_url / openmario_*_url fields returned by tools.

URL templates:
- Course (UUID): https://openmario.com/courses/explore/{course_id}
- Professor (integer id): https://openmario.com/professors/{professor_id}
- Company (UUID): https://openmario.com/companies/{company_id}
- Position (UUIDs): https://openmario.com/companies/{company_id}/{position_id}
- Salary browse: https://openmario.com/salary?search={urlencoded company or position name}
- Plan of Study share: use generate_plan_of_study_link → openmario_plan_url (always present that URL as a markdown link the user can click)
- Salary report share: use generate_salary_report_link → openmario_salary_url (user reviews/submits in browser one-by-one)

When citing a salary/wage, ALWAYS link:
1. the company name → company URL
2. the position/title → position URL (when company_id + position_id exist)
3. the $ rate (or "salary") → either the position URL or openmario_salary_search_url

Example: [Comcast Technology Auditor Co-op](https://openmario.com/companies/.../...) at [COMCAST](https://openmario.com/companies/...) — [$31/hr](https://openmario.com/salary?search=Comcast%20Technology%20Auditor)

Never list a bare course code, professor, company, position, or wage without a markdown link.`;

/** Appended to every successful tool payload so models see the rule on each call. */
export const TOOL_LINKING_FOOTER = `
---
Answer formatting: Whenever you mention any course, professor, company, position, salary, or plan-of-study link from this result, use the openmario_*_url fields as markdown links. Never leave those entities unlinked.`;
