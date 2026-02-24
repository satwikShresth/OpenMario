export type SectionInstructor = {
   id: number;
   name: string;
   department: string | null;
   avg_rating: number | null;
   avg_difficulty: number | null;
   num_ratings: number | null;
   rmp_id: string | null;
   weighted_score: number | null;
};

export type SectionDocument = {
   crn: number;
   section: string;
   course_number: string;
   instruction_type: string | null;
   instruction_method: string | null;
   credits: number | null;
   max_enroll: number | null;
   start_time: string | null;
   end_time: string | null;
   days: string[];
   term: string;
   course: string;
   title: string;
   description: string | null;
   restrictions: string | null;
   repeat_status: string | null;
   writing_intensive: boolean;
   subject_id: string;
   subject_name: string;
   college_id: string;
   college_name: string;
   course_id: string;
   instructors: SectionInstructor[];
};
