import { createFileRoute } from '@tanstack/react-router';
import { Container } from '@chakra-ui/react';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { Search } from '@/components/Search';
import { env } from '@env';
import { orpc } from '@/helpers';
import { Suspense } from 'react';

export const Route = createFileRoute('/_search')({
   component: () => {
      const refetchInterval = 1000 * 60 * 10;
      const { data } = useSuspenseQuery(orpc.auth.getSearchToken.queryOptions({
         staleTime: refetchInterval - 1000, // 1 hour and 50 minutes in milliseconds
         gcTime: refetchInterval - 1000,
         refetchInterval, // 1 hour and 50 minutes in milliseconds
         refetchIntervalInBackground: true,

      }));

      const { searchClient } = instantMeiliSearch(
         env.VITE_MEILI_HOST,
         () => data.token,
      );

      return (
         <Suspense>
            <Container>
               {/*@ts-ignore: shupp*/}
               <Search.Root searchClient={searchClient}>
                  <Outlet />
               </Search.Root>
            </Container>
         </Suspense>
      );
   },
});
