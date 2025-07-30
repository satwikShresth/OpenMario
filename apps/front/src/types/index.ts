export interface Instructor {
  id: number;
  name: string;
  rmp_id: number;
  avg_rating: number;
  department: string;
  num_ratings: number;
  avg_difficulty: number;
  weighted_score: number;
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
