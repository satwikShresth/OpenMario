import { createContext, useContext, useRef } from 'react'
import { createStore, useStore } from 'zustand'


type Store = {
  user: any;
  setUser: (user: any) => void;
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
