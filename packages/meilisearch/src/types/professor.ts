export type ProfessorCourse = {
   code: string;
   title: string;
};

export type ProfessorDocument = {
   id: number;
   name: string;
   department: string | null;
   avg_rating: number | null;
   avg_difficulty: number | null;
   num_ratings: number | null;
   weighted_score: number | null;
   rmp_id: string | null;
   rmp_legacy_id: number | null;
   total_sections_taught: number;
   total_courses_taught: number;
   total_terms_active: number;
   most_recent_term: number | null;
   subjects_taught: string[] | null;
   instruction_methods: string[] | null;
   courses_taught: ProfessorCourse[];
};
