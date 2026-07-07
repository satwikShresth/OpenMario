export interface Instructor {
   id: number;
   name: string;
   rmp_id: string | null;
   rmp_legacy_id: number | null;
   avg_rating: number | null;
   department: string | null;
   num_ratings: number | null;
   avg_difficulty: number | null;
   weighted_score: number | null;
}

export interface Section {
   crn: number;
   section: string;
   course_id: string;
   instruction_type: string;
   instruction_method: string;
   credits: number;
   start_time: string;
   end_time: string;
   days: string[];
   term: string;
   course: string;
   title: string;
   description: string;
   subject_id: string;
   subject_name: string;
   college_id: string;
   college_name: string;
   instructors: Instructor[];
}
