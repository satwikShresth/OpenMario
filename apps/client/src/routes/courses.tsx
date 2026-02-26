import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Index } from 'react-instantsearch';
import { Search } from '@/components/Search';
import { useSearchClient } from '@/helpers';
import { Suspense } from 'react';

export const Route = createFileRoute('/courses')({
   component: CoursesLayout,
});

function CoursesLayout() {
   const { searchClient, setMeiliSearchParams } = useSearchClient();

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
