import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createZustandContext } from "zustand-context";
import { type ReactNode } from "react";

// Define the favorites store structure
type FavoritesStore = {
  index: string;
  favorites: Record<string, Set<string>>;
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
        (set, get) => ({
          index: initialState.index,
          favorites: {},
          setIndex: (index) => set({ index }),
          addFavorite: (id) =>
            set((state) => {
              const { index } = state;
              const newFavorites = { ...state.favorites };

              if (!newFavorites[index]) {
                newFavorites[index] = new Set<string>();
              }

              // Add the favorite
              newFavorites[index].add(id);

              return { favorites: newFavorites };
            }),
          removeFavorite: (id) =>
            set((state) => {
              const { index } = state;
              const newFavorites = { ...state.favorites };

              // Skip if set doesn't exist
              if (!newFavorites[index]) {
                return { favorites: newFavorites };
              }

              // Remove the favorite
              newFavorites[index].delete(id);

              return { favorites: newFavorites };
            }),
          toggleFavorite: (id) =>
            set((state) => {
              const { index } = state;
              const newFavorites = { ...state.favorites };

              // Initialize set if it doesn't exist
              if (!newFavorites[index]) {
                newFavorites[index] = new Set<string>();
              }

              // Toggle the favorite
              if (newFavorites[index].has(id)) {
                newFavorites[index].delete(id);
              } else {
                newFavorites[index].add(id);
              }

              return { favorites: newFavorites };
            }),
          isFavorite: (id) => {
            const { index, favorites } = get();
            // Safely check if the value exists and is a Set
            const favoriteSet = favorites[index];
            if (favoriteSet && typeof favoriteSet.has === "function") {
              return favoriteSet.has(id);
            }
            // If it's an array (after rehydration but before proper conversion)
            if (Array.isArray(favoriteSet)) {
              return favoriteSet.includes(id);
            }
            return false;
          },
          getAllFavorites: () => {
            const { index, favorites } = get();
            const favoriteSet = favorites[index];

            // If it's a Set, convert to array
            if (favoriteSet && typeof favoriteSet.forEach === "function") {
              return Array.from(favoriteSet);
            }
            // If it's already an array
            if (Array.isArray(favoriteSet)) {
              return favoriteSet;
            }
            return [];
          },
          clearAllFavorites: () =>
            set((state) => {
              const { index } = state;
              const newFavorites = { ...state.favorites };

              // Initialize or clear set
              newFavorites[index] = new Set();

              return { favorites: newFavorites };
            }),
        }),
        {
          name: "favorites-storage",
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => {
            const serializedFavorites = {};

            // Convert all Sets to arrays for each index
            Object.entries(state.favorites).forEach(([index, favSet]) => {
              // Check if it's a Set before trying to convert
              if (favSet && typeof favSet.forEach === "function") {
                serializedFavorites[index] = Array.from(favSet);
              } else if (Array.isArray(favSet)) {
                serializedFavorites[index] = favSet;
              } else {
                serializedFavorites[index] = [];
              }
            });

            return {
              favorites: serializedFavorites,
            };
          },
          onRehydrateStorage: () => (state) => {
            if (state && state.favorites) {
              // Create a new favorites object to hold the rehydrated sets
              const rehydratedFavorites = {};

              // For each index in the serialized favorites
              Object.entries(state.favorites).forEach(([index, value]) => {
                // Convert array to Set
                if (Array.isArray(value)) {
                  rehydratedFavorites[index] = new Set(value);
                } else {
                  // If for some reason it's not an array, create an empty Set
                  rehydratedFavorites[index] = new Set();
                }
              });

              // Update the state with properly converted Sets
              state.favorites = rehydratedFavorites;
            } else {
              // Initialize with empty object if favorites is missing
              state.favorites = {};
            }

            console.log("Rehydrated state:", state);
          },
          version: 1,
        },
      ),
    ),
);
