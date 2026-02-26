import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import type { InstantMeiliSearchInstance, OverridableMeiliSearchSearchParameters } from '@meilisearch/instant-meilisearch';
import { useSuspenseQuery } from '@tanstack/react-query';
import { env } from '@env';
import { orpc } from './rpc';

const REFETCH_INTERVAL = 1000 * 60 * 10;

export function useSearchClient(): {
   searchClient: InstantMeiliSearchInstance;
   setMeiliSearchParams: (params: OverridableMeiliSearchSearchParameters) => void;
} {
   const { data } = useSuspenseQuery(
      orpc.auth.getSearchToken.queryOptions({
         staleTime: REFETCH_INTERVAL - 1000,
         gcTime: REFETCH_INTERVAL - 1000,
         refetchInterval: REFETCH_INTERVAL,
         refetchIntervalInBackground: true,
      })
   );

   return instantMeiliSearch(
      env.VITE_MEILI_HOST,
      () => (data as { token: string }).token
   );
}
