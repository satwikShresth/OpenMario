import { createFileRoute, Outlet } from '@tanstack/react-router';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Index } from 'react-instantsearch';
import { Search } from '@/components/Search';
import { env } from '@env';
import { orpc } from '@/helpers';
import { Suspense } from 'react';

export const Route = createFileRoute('/courses')({
   component: CoursesLayout,
});

function CoursesLayout() {
   const refetchInterval = 1000 * 60 * 10;
   const { data } = useSuspenseQuery(
      orpc.auth.getSearchToken.queryOptions({
         staleTime: refetchInterval - 1000,
         gcTime: refetchInterval - 1000,
         refetchInterval,
         refetchIntervalInBackground: true,
      })
   );

   const { searchClient, setMeiliSearchParams } = instantMeiliSearch(
      env.VITE_MEILI_HOST,
      () => (data as { token: string }).token
   );

   return (
      <Suspense>
         <Search.Root setMeiliSearchParams={setMeiliSearchParams} searchClient={searchClient}>
            <Index indexName='sections'>
               <Outlet />
            </Index>
         </Search.Root>
      </Suspense>
   );
}
