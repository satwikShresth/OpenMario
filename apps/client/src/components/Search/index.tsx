import type { ReactNode } from 'react';
import type { InstantMeiliSearchInstance, OverridableMeiliSearchSearchParameters } from '@meilisearch/instant-meilisearch';
import { InstantSearch } from 'react-instantsearch';
import Courses from './Courses';
import { SearchProvider } from './SearchContext';

type SearchProps = {
   searchClient: InstantMeiliSearchInstance;
   setMeiliSearchParams: (params: OverridableMeiliSearchSearchParameters) => void;
   children?: ReactNode;
};

export const Search = {
   Root: ({ searchClient, setMeiliSearchParams, children }: SearchProps) => (
      <SearchProvider setMeiliSearchParams={setMeiliSearchParams}>
         {/* @ts-ignore: shupp */}
         <InstantSearch
            searchClient={searchClient}
            future={{ preserveSharedStateOnUnmount: true }}
         >
            {children}
         </InstantSearch>
      </SearchProvider>
   ),
   Courses,
};

export * from './refinements';
export * from './Stats';
export * from './SearchContext';
