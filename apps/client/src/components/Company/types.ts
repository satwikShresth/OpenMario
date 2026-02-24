import type { z } from 'zod';
import type {
   CompanyDetailSchema,
   PositionListItemSchema,
} from '@openmario/contracts';
import type { CompanyDocument } from '@openmario/meilisearch';

export type CompanyListItem = CompanyDocument;
export type CompanyDetail = z.infer<typeof CompanyDetailSchema>;
export type PositionItem = z.infer<typeof PositionListItemSchema>;
export type SortBy =
   | 'company_name'
   | 'omega_score'
   | 'total_reviews'
   | 'avg_compensation'
   | 'pct_would_recommend'
   | 'avg_rating_overall';
