import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import type { ProfessorProfile, Section } from './types';

export type ProfessorDetailState = {
   prof: ProfessorProfile | undefined;
   allSections: Section[];
   upcomingSections: Section[];
   pastSections: Section[];
   isLoading: boolean;
};

export const professorDetailStore = new Store<ProfessorDetailState>({
   prof: undefined,
   allSections: [],
   upcomingSections: [],
   pastSections: [],
   isLoading: true,
});

export const useProfessorDetail = <T>(selector: (s: ProfessorDetailState) => T): T =>
   useStore(professorDetailStore, selector);
