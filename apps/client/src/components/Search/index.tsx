import type { ReactNode } from 'react';
import type { InstantMeiliSearchInstance, OverridableMeiliSearchSearchParameters } from '@meilisearch/instant-meilisearch';
import { InstantSearch } from 'react-instantsearch';
import { history } from 'instantsearch.js/es/lib/routers';
import Courses from './Courses';
import { parse, stringify } from 'jsurl2';
import { parseSearchWith, stringifySearchWith } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { SearchProvider } from './SearchContext';

type SearchProps = {
   searchClient: InstantMeiliSearchInstance;
   setMeiliSearchParams: (params: OverridableMeiliSearchSearchParameters) => void;
   children?: ReactNode;
};

export const Search = {
   Root: ({ searchClient, setMeiliSearchParams, children }: SearchProps) => {
      const navigate = useNavigate();
      return (
         <SearchProvider setMeiliSearchParams={setMeiliSearchParams}>
            <InstantSearch
               //@ts-ignore: shupp
               searchClient={searchClient}
               future={{ preserveSharedStateOnUnmount: true }}

               routing={{
                  router: history({
                     writeDelay: 500,
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
         </SearchProvider>
      );
   },
   Courses,
};

export * from './refinements';
export * from './Stats';
export * from './SearchContext';
