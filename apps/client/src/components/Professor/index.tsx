import { Root } from './Root';
import { PageHeader } from './PageHeader';
import { ProfessorCard } from './Card';
import { Cards } from './Cards';
import { ProfessorBreadcrumb } from './Breadcrumb';
import { Header } from './Header';
import { StatsGrid } from './StatsGrid';
import { SubjectBadges } from './SubjectBadges';
import { Charts } from './Charts';
import { InstructionMethods } from './InstructionMethods';
import { SectionsTab } from './SectionsTab';
import { Filters } from './Filters';

export const Professor = {
   Root,
   PageHeader,
   Card: ProfessorCard,
   Cards,
   Breadcrumb: ProfessorBreadcrumb,
   Header,
   StatsGrid,
   SubjectBadges,
   Charts,
   InstructionMethods,
   SectionsTab,
   Filters,
};

export * from './types';
export { professorDetailStore } from './detailStore';
