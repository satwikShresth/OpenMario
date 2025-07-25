import type { ReactNode } from 'react';
import type { InstantMeiliSearchInstance } from '@meilisearch/instant-meilisearch';
import { InstantSearch } from 'react-instantsearch';
import Courses from './Courses';

type SearchProps = { searchClient: InstantMeiliSearchInstance; children?: ReactNode };
export const Search = {
   Root: ({ searchClient, children }: SearchProps) => {
      return (
         <InstantSearch
            //@ts-ignore: shupp
            searchClient={searchClient}
            future={{ preserveSharedStateOnUnmount: true }}
         >
            {children}
         </InstantSearch>
      );
   },
   Courses,
};

export * from './Store';
export * from './refinements';
export * from './Stats';
