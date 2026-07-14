import { Store, useStore } from '@tanstack/react-store'
import { createEmptyPlan, defaultStartFallYear, emptyYear } from './schema'
import {
   createDefaultLibrary,
   createStoredPlan,
   getDefaultPlan,
   loadLibraryFromStorage,
   saveLibraryToStorage,
} from './storage'
import { canRemoveYear } from './helpers'
import type {
   PlanLibrary,
   PlanLinkAction,
   PlanOfStudy,
   PlannedCourse,
   QuarterMode,
   StoredPlan,
   TermName,
} from './types'

function initialLibrary(): PlanLibrary {
   if (typeof window === 'undefined') return createDefaultLibrary()
   return loadLibraryFromStorage()
}

export const planLibraryStore = new Store<PlanLibrary>(initialLibrary())

function commit(next: PlanLibrary) {
   const plans = next.plans.map(p => ({ ...p }))
   if (plans.length === 0) {
      const lib = createDefaultLibrary()
      planLibraryStore.setState(() => lib)
      saveLibraryToStorage(lib)
      return
   }
   const defaults = plans.filter(p => p.isDefault)
   if (defaults.length === 0) plans[0]!.isDefault = true
   if (defaults.length > 1) {
      let seen = false
      for (const p of plans) {
         if (p.isDefault) {
            if (seen) p.isDefault = false
            else seen = true
         }
      }
   }
   const library = { version: 2 as const, plans }
   planLibraryStore.setState(() => library)
   saveLibraryToStorage(library)
}

function updateActive(mutator: (plan: PlanOfStudy) => PlanOfStudy) {
   const lib = planLibraryStore.state
   const active = getDefaultPlan(lib)
   commit({
      version: 2,
      plans: lib.plans.map(p =>
         p.id === active.id
            ? {
                 ...p,
                 updatedAt: new Date().toISOString(),
                 plan: mutator(p.plan),
              }
            : p,
      ),
   })
}

export function usePlanLibrary(): PlanLibrary {
   return useStore(planLibraryStore, s => s)
}

export function useActivePlan(): StoredPlan {
   return useStore(planLibraryStore, s => getDefaultPlan(s))
}

export function usePlanOfStudy(): PlanOfStudy {
   return useStore(planLibraryStore, s => getDefaultPlan(s).plan)
}

export function setActivePlanAsDefault(id: string) {
   const lib = planLibraryStore.state
   commit({
      version: 2,
      plans: lib.plans.map(p => ({ ...p, isDefault: p.id === id })),
   })
}

export function createPlan(opts?: { name?: string; plan?: PlanOfStudy; makeDefault?: boolean }) {
   const lib = planLibraryStore.state
   const makeDefault = opts?.makeDefault ?? false
   const stored = createStoredPlan(opts?.plan ?? createEmptyPlan(), {
      name: opts?.name,
      isDefault: makeDefault || lib.plans.length === 0,
   })
   const plans = makeDefault
      ? [...lib.plans.map(p => ({ ...p, isDefault: false })), stored]
      : [...lib.plans, stored]
   commit({ version: 2, plans })
   return stored
}

export function renamePlan(id: string, name: string) {
   const trimmed = name.trim() || 'Untitled'
   const lib = planLibraryStore.state
   commit({
      version: 2,
      plans: lib.plans.map(p =>
         p.id === id
            ? { ...p, name: trimmed, updatedAt: new Date().toISOString() }
            : p,
      ),
   })
}

export function deletePlan(id: string) {
   const lib = planLibraryStore.state
   if (lib.plans.length <= 1) return
   const remaining = lib.plans.filter(p => p.id !== id)
   if (!remaining.some(p => p.isDefault) && remaining[0]) {
      remaining[0].isDefault = true
   }
   commit({ version: 2, plans: remaining })
}

export function replacePlanContents(id: string, plan: PlanOfStudy, name?: string) {
   const lib = planLibraryStore.state
   commit({
      version: 2,
      plans: lib.plans.map(p =>
         p.id === id
            ? {
                 ...p,
                 name: name?.trim() || p.name,
                 updatedAt: new Date().toISOString(),
                 plan,
              }
            : p,
      ),
   })
}

export function applyPlanFromLink(opts: {
   plan: PlanOfStudy
   action: PlanLinkAction
   name?: string
   id?: string
   setDefault?: boolean
}): { result: 'created' | 'updated' | 'replaced'; planId: string } {
   const { plan, action, name, id, setDefault } = opts
   const lib = planLibraryStore.state

   if (action === 'update' || action === 'replace') {
      const target =
         (id ? lib.plans.find(p => p.id === id) : null) ??
         (id ? null : getDefaultPlan(lib))
      if (target) {
         const nextPlan = action === 'update' ? mergePlans(target.plan, plan) : plan
         replacePlanContents(target.id, nextPlan, name)
         if (setDefault) setActivePlanAsDefault(target.id)
         return {
            result: action === 'update' ? 'updated' : 'replaced',
            planId: target.id,
         }
      }
   }

   const stored = createPlan({
      name: name || 'Imported Plan',
      plan,
      makeDefault: setDefault ?? true,
   })
   return { result: 'created', planId: stored.id }
}

function mergePlans(existing: PlanOfStudy, incoming: PlanOfStudy): PlanOfStudy {
   const yearCount = Math.max(existing.years.length, incoming.years.length)
   const years = Array.from({ length: yearCount }, (_, yi) => {
      const a = existing.years[yi]
      const b = incoming.years[yi]
      if (!a) return b!
      if (!b) return a
      return {
         fallYear: b.fallYear || a.fallYear,
         quarters: b.quarters.map((q, qi) => {
            const prev = a.quarters[qi]!
            if (q.mode !== 'courses' || q.courses.length > 0) return q
            return prev
         }),
      }
   })
   return { years }
}

export function setPlanOfStudy(plan: PlanOfStudy) {
   updateActive(() => plan)
}

export function setYearFallYear(yearIndex: number, fallYear: number) {
   updateActive(prev => ({
      years: prev.years.map((year, yi) =>
         yi === yearIndex ? { ...year, fallYear } : year,
      ),
   }))
}

export function addYear() {
   updateActive(prev => {
      if (prev.years.length >= 12) return prev
      const last = prev.years[prev.years.length - 1]
      const nextFall = (last?.fallYear ?? defaultStartFallYear()) + 1
      return { years: [...prev.years, emptyYear(nextFall)] }
   })
}

export function removeYearAt(yearIndex: number) {
   updateActive(prev => {
      if (prev.years.length <= 1) return prev
      const target = prev.years[yearIndex]
      if (!target || !canRemoveYear(target)) return prev
      return { years: prev.years.filter((_, i) => i !== yearIndex) }
   })
}

export function setQuarterMode(yearIndex: number, term: TermName, mode: QuarterMode) {
   updateActive(prev => ({
      years: prev.years.map((year, yi) => {
         if (yi !== yearIndex) return year
         return {
            ...year,
            quarters: year.quarters.map(q => {
               if (q.term !== term) return q
               if (mode === 'break') return { ...q, mode, courses: [] }
               return { ...q, mode }
            }),
         }
      }),
   }))
}

export function addCourseToQuarter(yearIndex: number, term: TermName, course: PlannedCourse) {
   updateActive(prev => ({
      years: prev.years.map((year, yi) => {
         if (yi !== yearIndex) return year
         return {
            ...year,
            quarters: year.quarters.map(q => {
               if (q.term !== term) return q
               if (q.mode === 'break') return q
               if (q.courses.some(c => c.id === course.id)) return q
               return { ...q, courses: [...q.courses, course] }
            }),
         }
      }),
   }))
}

export function removeCourseFromQuarter(yearIndex: number, term: TermName, courseId: string) {
   updateActive(prev => ({
      years: prev.years.map((year, yi) => {
         if (yi !== yearIndex) return year
         return {
            ...year,
            quarters: year.quarters.map(q => {
               if (q.term !== term) return q
               return { ...q, courses: q.courses.filter(c => c.id !== courseId) }
            }),
         }
      }),
   }))
}

export function moveCourseToQuarter(
   fromYearIndex: number,
   fromTerm: TermName,
   toYearIndex: number,
   toTerm: TermName,
   courseId: string,
) {
   if (fromYearIndex === toYearIndex && fromTerm === toTerm) return

   updateActive(prev => {
      const sourceQuarter = prev.years[fromYearIndex]?.quarters.find(q => q.term === fromTerm)
      const course = sourceQuarter?.courses.find(c => c.id === courseId)
      if (!course) return prev

      const targetQuarter = prev.years[toYearIndex]?.quarters.find(q => q.term === toTerm)
      if (!targetQuarter || targetQuarter.mode === 'break') return prev

      return {
         years: prev.years.map((year, yi) => ({
            ...year,
            quarters: year.quarters.map(q => {
               if (yi === fromYearIndex && q.term === fromTerm) {
                  return { ...q, courses: q.courses.filter(c => c.id !== courseId) }
               }
               if (yi === toYearIndex && q.term === toTerm) {
                  if (q.courses.some(c => c.id === courseId)) return q
                  return { ...q, courses: [...q.courses, course] }
               }
               return q
            }),
         })),
      }
   })
}

export const planOfStudyStore = {
   get state() {
      return getDefaultPlan(planLibraryStore.state).plan
   },
}
