import { createEmptyPlan, parsePlanOfStudy } from './schema'
import type { PlanLibrary, PlanOfStudy, StoredPlan } from './types'

const STORAGE_KEY = 'openmario:plan-of-study-v2'
const LEGACY_KEY = 'openmario:plan-of-study'

function newId() {
   return crypto.randomUUID()
}

export function createStoredPlan(
   plan: PlanOfStudy = createEmptyPlan(),
   opts?: { name?: string; isDefault?: boolean; id?: string },
): StoredPlan {
   return {
      id: opts?.id ?? newId(),
      name: opts?.name?.trim() || 'My Plan',
      isDefault: opts?.isDefault ?? false,
      updatedAt: new Date().toISOString(),
      plan,
   }
}

export function createDefaultLibrary(): PlanLibrary {
   const plan = createStoredPlan(createEmptyPlan(), {
      name: 'My Plan',
      isDefault: true,
   })
   return { version: 2, plans: [plan] }
}

function migrateLegacy(): PlanLibrary | null {
   try {
      const raw = localStorage.getItem(LEGACY_KEY)
      if (!raw) return null
      const parsed = parsePlanOfStudy(JSON.parse(raw))
      if (!parsed) return null
      const library = {
         version: 2 as const,
         plans: [
            createStoredPlan(parsed, { name: 'My Plan', isDefault: true }),
         ],
      }
      localStorage.removeItem(LEGACY_KEY)
      return library
   } catch {
      return null
   }
}

export function loadLibraryFromStorage(): PlanLibrary {
   try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
         const data = JSON.parse(raw) as PlanLibrary
         if (data?.version === 2 && Array.isArray(data.plans) && data.plans.length > 0) {
            const plans = data.plans
               .map(p => {
                  const plan = parsePlanOfStudy(p.plan)
                  if (!plan) return null
                  return {
                     id: p.id || newId(),
                     name: p.name || 'Untitled',
                     isDefault: !!p.isDefault,
                     updatedAt: p.updatedAt || new Date().toISOString(),
                     plan,
                  } satisfies StoredPlan
               })
               .filter((p): p is StoredPlan => p != null)
            if (plans.length === 0) return createDefaultLibrary()
            if (!plans.some(p => p.isDefault)) plans[0]!.isDefault = true
            return { version: 2, plans }
         }
      }
      const migrated = migrateLegacy()
      if (migrated) {
         saveLibraryToStorage(migrated)
         return migrated
      }
   } catch {
      // fall through
   }
   return createDefaultLibrary()
}

export function saveLibraryToStorage(library: PlanLibrary): void {
   try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library))
   } catch {
      // ignore
   }
}

export function getDefaultPlan(library: PlanLibrary): StoredPlan {
   return library.plans.find(p => p.isDefault) ?? library.plans[0]!
}
