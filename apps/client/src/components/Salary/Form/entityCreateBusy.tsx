import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type EntityCreateBusy = {
   busy: boolean
   label: string | null
   begin: (label: string) => void
   end: () => void
}

const EntityCreateBusyContext = createContext<EntityCreateBusy | null>(null)

export function EntityCreateBusyProvider({ children }: { children: ReactNode }) {
   const [count, setCount] = useState(0)
   const [label, setLabel] = useState<string | null>(null)

   const value = useMemo<EntityCreateBusy>(
      () => ({
         busy: count > 0,
         label,
         begin: next => {
            setLabel(next)
            setCount(c => c + 1)
         },
         end: () => {
            setCount(c => Math.max(0, c - 1))
            setLabel(null)
         },
      }),
      [count, label],
   )

   return (
      <EntityCreateBusyContext.Provider value={value}>
         {children}
      </EntityCreateBusyContext.Provider>
   )
}

export function useEntityCreateBusy() {
   const ctx = useContext(EntityCreateBusyContext)
   if (!ctx) {
      return {
         busy: false,
         label: null,
         begin: (_: string) => {},
         end: () => {},
      } satisfies EntityCreateBusy
   }
   return ctx
}
