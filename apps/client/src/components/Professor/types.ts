export type Section = {
   section_crn: number;
   term_id: number;
   subject_code: string;
   course_number: string;
   course_title: string;
   section_code: string;
   instruction_method: string | null;
   instruction_type: string | null;
};

export type ProfessorProfile = {
   instructor_id: number;
   instructor_name: string;
   department: string | null;
   avg_rating: number | null;
   avg_difficulty: number | null;
   num_ratings: number | null;
   rmp_id: string | null;
   total_sections_taught: number;
   total_courses_taught: number;
   total_terms_active: number;
   most_recent_term: number | null;
   subjects_taught: string[] | null;
   instruction_methods: string[] | null;
};

export type ProfessorListItem = {
   instructor_id: number;
   instructor_name: string;
   department: string | null;
   avg_rating: number | null;
   avg_difficulty: number | null;
   num_ratings: number | null;
   total_sections_taught: number;
   total_courses_taught: number;
   subjects_taught: string[] | null;
};

export type SortBy = 'avg_rating' | 'avg_difficulty' | 'num_ratings' | 'total_sections_taught' | 'instructor_name';

export const currentTermId = (): number => {
   const now = new Date();
   const year = now.getFullYear();
   const month = now.getMonth() + 1;
   let term: number;
   if (month <= 3) term = 15;
   else if (month <= 6) term = 25;
   else if (month <= 9) term = 35;
   else term = 45;
   return year * 100 + term;
};

export const termLabel = (termId: number) => {
   const year = Math.floor(termId / 100);
   const code = termId % 100;
   const seasonMap: Record<number, string> = { 15: 'Fall', 25: 'Winter', 35: 'Spring', 45: 'Summer' };
   return `${seasonMap[code] ?? 'Unknown'} ${year}`;
};
