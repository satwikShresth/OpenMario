import type { ReactNode } from 'react';
import type { InstantMeiliSearchInstance } from '@meilisearch/instant-meilisearch';
import { InstantSearch } from 'react-instantsearch';
import { history } from 'instantsearch.js/es/lib/routers';
import Courses from './Courses';
import { parse } from 'jsurl2';
import { useRouter } from '@tanstack/react-router';
import { parseSearchWith } from '@tanstack/react-router';

type SearchProps = { searchClient: InstantMeiliSearchInstance; children?: ReactNode };
export const Search = {
   Root: ({ searchClient, children }: SearchProps) => {
      const router = useRouter();
      return (
         <InstantSearch
            //@ts-ignore: shupp
            searchClient={searchClient}
            future={{ preserveSharedStateOnUnmount: true }}
            routing={{
               router: history({
                  createURL: ({ routeState, location }) => {
                     const loc = router.parseLocation(location);
                     const newLoc = router.buildLocation({ search: routeState, state: loc.state });
                     return location.origin + newLoc.href;
                  },
                  parseURL: ({ location }) => {
                     return parseSearchWith(parse)(location.search);
                  },
                  push: (url) => {
                     const location = new URL(url);

                     router.navigate({
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
                  stateToRoute: (uiState) => {
                     const indexUiState = uiState['sections'];
                     indexUiState?.configure && delete indexUiState?.configure;
                     indexUiState?.sortBy || delete indexUiState?.sortBy;
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

export * from './Store';
export * from './refinements';
export * from './Stats';
