import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import React from "react";

/**
 * A user record with authentication details
 */
export type JWTUser = {
  user_id?: number;
  username?: string;
};

type UserStore = {
  user: JWTUser | null;
  setUser: (user: JWTUser) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-auth-storage",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export const useUserHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = React.useState(false);

  React.useEffect(() => {
    const unsubFinishHydration = useUserStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    setHasHydrated(useUserStore.persist.hasHydrated());

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hasHydrated;
};
