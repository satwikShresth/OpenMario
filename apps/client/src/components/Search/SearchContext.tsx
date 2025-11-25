import type { OverridableMeiliSearchSearchParameters } from '@meilisearch/instant-meilisearch';
import { createContext, useContext, type ReactNode } from 'react';

type SearchContextType = {
  setMeiliSearchParams: (params: OverridableMeiliSearchSearchParameters) => void;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({
  setMeiliSearchParams,
  children
}: {
  setMeiliSearchParams: (params: any) => void;
  children: ReactNode;
}) => {
  return (
    <SearchContext.Provider value={{ setMeiliSearchParams }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};

