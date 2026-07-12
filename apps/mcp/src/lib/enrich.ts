import {
   courseUrl,
   professorUrl,
   companyUrl,
   positionUrl,
   salarySearchUrl
} from './links';

type AnyRecord = Record<string, unknown>;

const UUID_RE = /^[0-9a-f-]{36}$/i;
/** Instructor/professor PKs are integers on OpenMario. */
const PROF_ID_RE = /^\d+$/;

function isUuid(id: string) {
   return UUID_RE.test(id);
}

function isProfessorId(id: string) {
   return PROF_ID_RE.test(id);
}

export function withCourseLinks<T extends AnyRecord>(row: T): T & {
   openmario_url?: string;
} {
   const courseId = String(row.course_id ?? row.id ?? '');
   if (!courseId || !isUuid(courseId)) return row;
   return { ...row, openmario_url: courseUrl(courseId) };
}

export function withSectionLinks<T extends AnyRecord>(hit: T): T & {
   openmario_url?: string;
   openmario_course_url?: string;
   instructors?: unknown;
} {
   const courseId = hit.course_id != null ? String(hit.course_id) : '';
   const instructors = Array.isArray(hit.instructors)
      ? hit.instructors.map((i: AnyRecord) => {
           const id = i.id != null ? String(i.id) : '';
           return id && isProfessorId(id)
              ? { ...i, openmario_url: professorUrl(id) }
              : i;
        })
      : hit.instructors;

   if (!courseId || !isUuid(courseId)) {
      return { ...hit, instructors };
   }
   return {
      ...hit,
      instructors,
      openmario_url: courseUrl(courseId),
      openmario_course_url: courseUrl(courseId)
   };
}

export function withProfessorLinks<T extends AnyRecord>(row: T): T & {
   openmario_url?: string;
} {
   const id = String(row.id ?? row.professor_id ?? row.instructor_id ?? '');
   if (!id || !isProfessorId(id)) return row;
   return { ...row, openmario_url: professorUrl(id) };
}

export function withCompanyLinks<T extends AnyRecord>(row: T): T & {
   openmario_url?: string;
} {
   const id = String(row.company_id ?? row.id ?? '');
   if (!id || !isUuid(id)) return row;
   return { ...row, openmario_url: companyUrl(id) };
}

export function withPositionLinks<T extends AnyRecord>(
   row: T,
   companyId?: string
): T & { openmario_url?: string } {
   const cid = String(companyId ?? row.company_id ?? '');
   const pid = String(row.position_id ?? row.id ?? '');
   if (!cid || !pid || !isUuid(cid) || !isUuid(pid)) {
      return row;
   }
   return { ...row, openmario_url: positionUrl(cid, pid) };
}

export function withSalaryLinks<T extends AnyRecord>(hit: T): T & {
   openmario_company_url?: string;
   openmario_position_url?: string;
   openmario_salary_search_url?: string;
} {
   const companyId =
      hit.company_id != null ? String(hit.company_id) : undefined;
   const positionId =
      hit.position_id != null ? String(hit.position_id) : undefined;
   const companyName =
      hit.company_name != null
         ? String(hit.company_name)
         : hit.company != null
           ? String(hit.company)
           : '';
   const positionName =
      hit.position_name != null
         ? String(hit.position_name)
         : hit.position != null
           ? String(hit.position)
           : '';

   const out: T & {
      openmario_company_url?: string;
      openmario_position_url?: string;
      openmario_salary_search_url?: string;
   } = { ...hit };

   if (companyId && isUuid(companyId)) {
      out.openmario_company_url = companyUrl(companyId);
   }
   if (companyId && positionId && isUuid(companyId) && isUuid(positionId)) {
      out.openmario_position_url = positionUrl(companyId, positionId);
   }

   const searchQ = [companyName, positionName].filter(Boolean).join(' ').trim();
   if (searchQ) {
      out.openmario_salary_search_url = salarySearchUrl(searchQ);
   } else if (companyName) {
      out.openmario_salary_search_url = salarySearchUrl(companyName);
   }

   return out;
}

export function mapHits<T extends AnyRecord>(
   hits: T[],
   enrich: (hit: T) => T
): T[] {
   return hits.map(enrich);
}
