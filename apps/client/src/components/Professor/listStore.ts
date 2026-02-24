import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import type { ProfessorListItem } from './types';

export type ProfessorListState = {
   professors: ProfessorListItem[];
   totalCount: number;
   isLoading: boolean;
   isFetchingNextPage: boolean;
   hasNextPage: boolean;
   fetchNextPage: () => void;
};

export const professorListStore = new Store<ProfessorListState>({
   professors: [],
   totalCount: 0,
   isLoading: true,
   isFetchingNextPage: false,
   hasNextPage: false,
   fetchNextPage: () => {},
});

export const useProfessorList = <T>(selector: (s: ProfessorListState) => T): T =>
   useStore(professorListStore, selector);
