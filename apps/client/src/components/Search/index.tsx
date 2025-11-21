import type { ReactNode } from 'react';
import type { InstantMeiliSearchInstance } from '@meilisearch/instant-meilisearch';
import { InstantSearch } from 'react-instantsearch';
import { history } from 'instantsearch.js/es/lib/routers';
import Courses from './Courses';
import { parse, stringify } from 'jsurl2';
import { parseSearchWith, stringifySearchWith } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';

type SearchProps = { searchClient: InstantMeiliSearchInstance; children?: ReactNode };
export const Search = {
   Root: ({ searchClient, children }: SearchProps) => {
      const navigate = useNavigate();
      return (
         <InstantSearch
            //@ts-ignore: shupp
            searchClient={searchClient}
            future={{ preserveSharedStateOnUnmount: true }}
            routing={{
               router: history({
                  createURL: ({ routeState, location }) =>
                     location.origin +
                     location.pathname +
                     stringifySearchWith(stringify)(routeState),
                  parseURL: ({ location }) => {
                     console.log('parseUrl', parseSearchWith(parse)(location.search));
                     return parseSearchWith(parse)(location.search);
                  },
                  push: (url) => {
                     const location = new URL(url);
                     navigate({
                        //@ts-ignore: shupp
                        search: parseSearchWith(parse)(location.search),
                        replace: true,
                        resetScroll: false,
                        reloadDocument: false,
                     });
                  },
                  cleanUrlOnDispose: false,
               }),
               stateMapping: {
                  stateToRoute: (uiState: any) => {
                     const indexUiState = uiState['sections'];
                     indexUiState?.configure && delete indexUiState?.configure;
                     indexUiState?.sortBy || delete indexUiState?.sortBy;
                     console.log(indexUiState);
                     return { ...indexUiState };
                  },
                  routeToState: (routeState) => {
                     return {
                        ['sections']: {
                           ...routeState,
                        },
                     };
                  },
               },
            }}
         >
            {children}
         </InstantSearch>
      );
   },
   Courses,
};

export * from './refinements';
export * from './Stats';
