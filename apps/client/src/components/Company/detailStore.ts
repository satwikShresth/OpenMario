import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import type { CompanyDetail, PositionItem } from './types';

export type CompanyDetailState = {
   company: CompanyDetail | null;
   positions: PositionItem[];
   company_id: string;
   isLoading: boolean;
};

export const companyDetailStore = new Store<CompanyDetailState>({
   company: null,
   positions: [],
   company_id: '',
   isLoading: true,
});

export const useCompanyDetail = <T>(selector: (s: CompanyDetailState) => T): T =>
   useStore(companyDetailStore, selector);
