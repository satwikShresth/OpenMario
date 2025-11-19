import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { favorites } from '@/db/schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

// Query key factory
const favoritesKeys = {
   all: ['favorites'] as const,
   list: () => [...favoritesKeys.all, 'list'] as const
};

// Prepared statements
const prepared = {
   getAll: db
      .select({ crn: favorites.crn })
      .from(favorites)
      .prepare('favorites_get_all'),

   add: db
      .insert(favorites)
      .values({ crn: sql.placeholder('crn') })
      .onConflictDoNothing()
      .prepare('favorites_add'),

   remove: db
      .delete(favorites)
      .where(eq(favorites.crn, sql.placeholder('crn')))
      .prepare('favorites_remove'),

   exists: db
      .select()
      .from(favorites)
      .where(eq(favorites.crn, sql.placeholder('crn')))
      .limit(1)
      .prepare('favorites_exists'),

   clear: db
      .delete(favorites)
      .prepare('favorites_clear')
};

// Database operations
const favoritesDb = {
   getAll: async () => {
      const result = await prepared.getAll.execute();
      return result.map(r => r.crn);
   },

   add: async (crn: string) => {
      await prepared.add.execute({ crn });
   },

   remove: async (crn: string) => {
      await prepared.remove.execute({ crn });
   },

   exists: async (crn: string) => {
      const result = await prepared.exists.execute({ crn });
      return result.length > 0;
   },

   clear: async () => {
      await prepared.clear.execute();
   }
};

type FavoritesStoreHook = {
   addFavorite: (crn: number) => Promise<void>;
   removeFavorite: (crn: number) => Promise<void>;
   toggleFavorite: (crn: number) => Promise<void>;
   isFavorite: (crn: number) => boolean;
   clearAllFavorites: () => Promise<void>;
   getAllFavorites: () => string[];
   isLoading: boolean;
   favoritesSet: Set<string>;
};

function useFavoriteStore(): FavoritesStoreHook {
   const queryClient = useQueryClient();

   // Query to fetch all favorites
   // No caching needed - IndexedDB is our persistent cache
   const { data: favoritesList = [], isLoading } = useQuery({
      queryKey: favoritesKeys.list(),
      queryFn: favoritesDb.getAll,
      gcTime: 0, // Don't keep in memory after component unmounts
      staleTime: 0 // Always fresh from IndexedDB
   });

   // Memoized Set for fast lookups
   const favoritesSet = useMemo(() => new Set(favoritesList), [favoritesList]);

   // Add favorite mutation
   const addMutation = useMutation({
      mutationFn: (crn: string) => favoritesDb.add(crn),
      onMutate: async crn => {
         // Cancel outgoing refetches
         await queryClient.cancelQueries({ queryKey: favoritesKeys.list() });

         // Snapshot previous value
         const previousFavorites = queryClient.getQueryData<string[]>(
            favoritesKeys.list()
         );

         // Optimistically update
         queryClient.setQueryData<string[]>(
            favoritesKeys.list(),
            (old = []) => {
               if (old.includes(crn)) return old;
               return [...old, crn];
            }
         );

         return { previousFavorites };
      },
      onError: (_err, _crn, context) => {
         // Rollback on error
         if (context?.previousFavorites) {
            queryClient.setQueryData(
               favoritesKeys.list(),
               context.previousFavorites
            );
         }
      },
      onSettled: () => {
         // Refetch after mutation
         queryClient.invalidateQueries({ queryKey: favoritesKeys.list() });
      }
   });

   // Remove favorite mutation
   const removeMutation = useMutation({
      mutationFn: (crn: string) => favoritesDb.remove(crn),
      onMutate: async crn => {
         await queryClient.cancelQueries({ queryKey: favoritesKeys.list() });

         const previousFavorites = queryClient.getQueryData<string[]>(
            favoritesKeys.list()
         );

         queryClient.setQueryData<string[]>(favoritesKeys.list(), (old = []) =>
            old.filter(c => c !== crn)
         );

         return { previousFavorites };
      },
      onError: (_err, _crn, context) => {
         if (context?.previousFavorites) {
            queryClient.setQueryData(
               favoritesKeys.list(),
               context.previousFavorites
            );
         }
      },
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: favoritesKeys.list() });
      }
   });

   // Clear all favorites mutation
   const clearMutation = useMutation({
      mutationFn: favoritesDb.clear,
      onMutate: async () => {
         await queryClient.cancelQueries({ queryKey: favoritesKeys.list() });

         const previousFavorites = queryClient.getQueryData<string[]>(
            favoritesKeys.list()
         );

         queryClient.setQueryData<string[]>(favoritesKeys.list(), []);

         return { previousFavorites };
      },
      onError: (_err, _variables, context) => {
         if (context?.previousFavorites) {
            queryClient.setQueryData(
               favoritesKeys.list(),
               context.previousFavorites
            );
         }
      },
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: favoritesKeys.list() });
      }
   });

   return {
      addFavorite: async (crn: number) => {
         await addMutation.mutateAsync(crn.toString());
      },

      removeFavorite: async (crn: number) => {
         await removeMutation.mutateAsync(crn.toString());
      },

      toggleFavorite: async (crn: number) => {
         const crnStr = crn.toString();
         if (favoritesSet.has(crnStr)) {
            await removeMutation.mutateAsync(crnStr);
         } else {
            await addMutation.mutateAsync(crnStr);
         }
      },

      isFavorite: (crn: number) => {
         return favoritesSet.has(crn.toString());
      },

      clearAllFavorites: async () => {
         await clearMutation.mutateAsync();
      },

      getAllFavorites: () => {
         return favoritesList;
      },

      isLoading,
      favoritesSet
   };
}

export { useFavoriteStore, favoritesKeys };
export type { FavoritesStoreHook };
