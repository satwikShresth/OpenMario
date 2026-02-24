import { Root } from './Root';
import { PageHeader } from './PageHeader';
import { Toolbar } from './Toolbar';
import { ProfessorCard } from './Card';
import { List } from './List';
import { InfiniteScrollSentinel } from './InfiniteScrollSentinel';
import { ProfessorBreadcrumb } from './Breadcrumb';
import { Header } from './Header';
import { StatsGrid } from './StatsGrid';
import { SubjectBadges } from './SubjectBadges';
import { Charts } from './Charts';
import { InstructionMethods } from './InstructionMethods';
import { SectionsTab } from './SectionsTab';

export const Professor = {
   Root,
   PageHeader,
   Toolbar,
   Card: ProfessorCard,
   List,
   InfiniteScrollSentinel,
   Breadcrumb: ProfessorBreadcrumb,
   Header,
   StatsGrid,
   SubjectBadges,
   Charts,
   InstructionMethods,
   SectionsTab,
};

export * from './types';
export { professorListStore } from './listStore';
export { professorDetailStore } from './detailStore';
