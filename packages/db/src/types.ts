import type {
   meiliCompaniesIdx,
   meiliProfessorsIdx,
   meiliSectionsIdx
} from './schema/views/meili';

export type CompanyRow = typeof meiliCompaniesIdx.$inferSelect;
export type InstructorRow = typeof meiliProfessorsIdx.$inferSelect;
export type SectionRow = typeof meiliSectionsIdx.$inferSelect;
