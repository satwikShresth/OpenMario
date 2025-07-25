import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createZustandContext } from 'zustand-context';

// Define the favorites store structure
type FavoritesStore = {
   index: string;
   favorites: Record<string, string[]>;
   addFavorite: (id: string) => void;
   removeFavorite: (id: string) => void;
   toggleFavorite: (id: string) => void;
   isFavorite: (id: string) => boolean;
   clearAllFavorites: () => void;
   getAllFavorites: () => string[];
   setIndex: (index: string) => void;
};

export const [FavoritesProvider, useFavoritesStore] = createZustandContext(
   (initialState: { index: string }) =>
      create<FavoritesStore>()(
         persist(
            immer((set, get) => ({
               index: initialState.index,
               favorites: {},

               setIndex: (index) =>
                  set((state) => {
                     state.index = index;
                  }),

               addFavorite: (id) =>
                  set((state) => {
                     const { index } = state;

                     // Initialize array if it doesn't exist
                     if (!state.favorites[index]) {
                        state.favorites[index] = [];
                     }

                     // Add favorite if not already present
                     if (!state.favorites[index].includes(id)) {
                        state.favorites[index].push(id);
                     }
                  }),

               removeFavorite: (id) =>
                  set((state) => {
                     const { index } = state;

                     // Skip if array doesn't exist
                     if (!state.favorites[index]) {
                        return;
                     }

                     // Remove the favorite
                     state.favorites[index] = state.favorites[index].filter(
                        (favoriteId) => favoriteId !== id,
                     );
                  }),

               toggleFavorite: (id) =>
                  set((state) => {
                     const { index } = state;

                     // Initialize array if it doesn't exist
                     if (!state.favorites[index]) {
                        state.favorites[index] = [];
                     }

                     const currentFavorites = state.favorites[index];
                     const existingIndex = currentFavorites.indexOf(id);

                     if (existingIndex >= 0) {
                        // Remove if exists
                        currentFavorites.splice(existingIndex, 1);
                     } else {
                        // Add if doesn't exist
                        currentFavorites.push(id);
                     }
                  }),

               isFavorite: (id) => {
                  const { index, favorites } = get();
                  return favorites[index]?.includes(id) ?? false;
               },

               getAllFavorites: () => {
                  const { index, favorites } = get();
                  return favorites[index] ?? [];
               },

               clearAllFavorites: () =>
                  set((state) => {
                     const { index } = state;
                     state.favorites[index] = [];
                  }),
            })),
            {
               name: 'favorites-storage',
               storage: createJSONStorage(() => localStorage),
               // Only persist the favorites data
               partialize: (state) => ({
                  favorites: state.favorites,
               }),
               version: 1,
            },
         ),
      ),
);
