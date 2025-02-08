import { createContext, useContext, useRef } from 'react'
import { createStore, useStore } from 'zustand'

/**
 * A book record with all its properties
 */
export type JWTUser = {
  user_id?: number;
  username?: string;
};

type Store = {
  user?: JWTUser | null;
  setUser: (user: JWTUser) => void;
  clearUser: () => void;
}

export const StoreContext = createContext(null)

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef(null);

  if (!storeRef.current) {
    storeRef.current = createStore<Store>((set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null })
    }))
  }

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  )
}

export const useUserStore = () => {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('Missing StoreProvider')
  }
  return useStore(store)
}
