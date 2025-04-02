import { useSuspenseQuery } from "@tanstack/react-query";
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { getAuthSearchTokenOptions } from "#client/react-query.gen";
import { useMemo } from "react";

export function useSearchClient() {
  const refetchInterval = 1000 * 60 * 110;
  const { data } = useSuspenseQuery({
    ...getAuthSearchTokenOptions(),
    staleTime: refetchInterval - 1000, // 1 hour and 50 minutes in milliseconds
    gcTime: refetchInterval - 1000,
    refetchInterval, // 1 hour and 50 minutes in milliseconds
    refetchIntervalInBackground: true,
  });

  const searchClient = useMemo(() => {
    return instantMeiliSearch(
      `${window.location.host}/api/search`,
      () => data.token,
    );
  }, [data.token]);

  return searchClient;
}
