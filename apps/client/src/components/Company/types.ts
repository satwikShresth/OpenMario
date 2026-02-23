export type CompanyListItem = {
   company_id: string;
   company_name: string;
   total_reviews: number;
   positions_reviewed: number;
   avg_rating_overall: number | null;
   omega_score: number | null;
   satisfaction_score: number | null;
   trust_score: number | null;
   integrity_score: number | null;
   growth_score: number | null;
   work_life_score: number | null;
};

export type CompanyDetail = {
   company_name: string;
   total_reviews: number;
   positions_reviewed: number;
   pct_would_recommend: number | null;
   omega_score: number | null;
   avg_rating_overall: number | null;
   avg_days_per_week: number | null;
   pct_overtime_required: number | null;
   satisfaction_score: number | null;
   trust_score: number | null;
   integrity_score: number | null;
   growth_score: number | null;
   work_life_score: number | null;
   avg_rating_collaboration: number | null;
   avg_rating_work_variety: number | null;
   avg_rating_relationships: number | null;
   avg_rating_supervisor_access: number | null;
   avg_rating_training: number | null;
};

export type PositionItem = {
   position_id: string;
   position_name: string;
   omega_score: number | null;
   total_reviews: number;
   avg_compensation: number | null;
   most_recent_posting_year: number | null;
};

export type SortBy = 'omega_score' | 'total_reviews' | 'avg_rating_overall' | 'company_name';
