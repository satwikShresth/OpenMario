import type { z } from 'zod';
import type {
   CompanyListItemSchema,
   CompanyDetailSchema,
   PositionListItemSchema,
   CompanyListQuerySchema,
} from '@openmario/contracts';

export type CompanyListItem = z.infer<typeof CompanyListItemSchema>;
export type CompanyDetail = z.infer<typeof CompanyDetailSchema>;
export type PositionItem = z.infer<typeof PositionListItemSchema>;
export type SortBy = z.infer<typeof CompanyListQuerySchema>['sort_by'];
