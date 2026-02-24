import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import type { CompanyListItem } from './types';

export type CompanyListState = {
   companies: CompanyListItem[];
   totalCount: number;
   isLoading: boolean;
   isFetchingNextPage: boolean;
   hasNextPage: boolean;
   fetchNextPage: () => void;
};

export const companyListStore = new Store<CompanyListState>({
   companies: [],
   totalCount: 0,
   isLoading: true,
   isFetchingNextPage: false,
   hasNextPage: false,
   fetchNextPage: () => {},
});

export const useCompanyList = <T>(selector: (s: CompanyListState) => T): T =>
   useStore(companyListStore, selector);
