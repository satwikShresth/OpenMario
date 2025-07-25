import { createFileRoute } from '@tanstack/react-router';
import { Container } from '@chakra-ui/react';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { getV1AuthSearchTokenOptions } from '@/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { Search } from '@/components/Search';

export const Route = createFileRoute('/_search')({
   component: () => {
      const refetchInterval = 1000 * 60 * 110;
      const { data } = useSuspenseQuery({
         ...getV1AuthSearchTokenOptions(),
         staleTime: refetchInterval - 1000, // 1 hour and 50 minutes in milliseconds
         gcTime: refetchInterval - 1000,
         refetchInterval, // 1 hour and 50 minutes in milliseconds
         refetchIntervalInBackground: true,
      });
      const { searchClient } = instantMeiliSearch(
         `${location.origin}/api/search`,
         () => data.token,
      );

      return (
         <Container>
            {/*@ts-ignore: shupp*/}
            <Search.Root searchClient={searchClient}>
               <Outlet />
            </Search.Root>
         </Container>
      );
   },
});
