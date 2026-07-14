import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useEffectEvent, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { ImportPlanDialog, PlanGrid } from '@/components/PlanOfStudy'
import {
   decodePlan,
   fromCompactPlan,
   toCompactPlan,
   type PlanLinkAction,
   type PlanOfStudy,
   type PlannedCourse,
} from '@/lib/plan-of-study'
import { toaster } from '@/components/ui/toaster'
import { orpc } from '@/helpers'

const searchSchema = z.object({
   plan: z.string().optional(),
   action: z.enum(['create', 'update', 'replace']).optional(),
   name: z.string().optional(),
   id: z.string().optional(),
   default: z
      .union([z.literal('1'), z.literal('0'), z.literal('true'), z.literal('false')])
      .optional(),
})

export const Route = createFileRoute('/courses/plan/')({
   beforeLoad: () => ({ getLabel: () => 'Plan of Study' }),
   validateSearch: searchSchema,
   component: PlanOfStudyPage,
})

type PendingImport = {
   plan: PlanOfStudy
   action: PlanLinkAction
   name?: string
   id?: string
}

function PlanOfStudyPage() {
   const search = Route.useSearch()
   const navigate = useNavigate()
   const queryClient = useQueryClient()
   const [pending, setPending] = useState<PendingImport | null>(null)

   const clearParams = useEffectEvent(() => {
      void navigate({
         to: '.',
         search: {
            plan: undefined,
            action: undefined,
            name: undefined,
            id: undefined,
            default: undefined,
         },
         replace: true,
      })
   })

   useEffect(() => {
      if (!search.plan) return

      let cancelled = false

      ;(async () => {
         const decoded = decodePlan(search.plan!)
         if (!decoded) {
            toaster.create({
               title: 'Invalid plan link',
               description: 'Could not read the shared plan.',
               type: 'error',
            })
            clearParams()
            return
         }

         const hydrated = await hydrateCourseDetails(decoded, queryClient)
         if (cancelled) return

         setPending({
            plan: hydrated,
            action: (search.action ?? 'create') as PlanLinkAction,
            name: search.name,
            id: search.id,
         })
         clearParams()
      })()

      return () => {
         cancelled = true
      }
   }, [search.plan, search.action, search.name, search.id, search.default, queryClient])

   return (
      <>
         <PlanGrid />
         <ImportPlanDialog
            open={pending != null}
            plan={pending?.plan ?? null}
            action={pending?.action ?? 'create'}
            suggestedName={pending?.name}
            planId={pending?.id}
            onDismiss={() => setPending(null)}
         />
      </>
   )
}

async function hydrateCourseDetails(
   plan: ReturnType<typeof decodePlan> & object,
   queryClient: ReturnType<typeof useQueryClient>,
) {
   if (!plan) return plan
   const ids = new Set<string>()
   for (const year of plan.years) {
      for (const q of year.quarters) {
         for (const c of q.courses) {
            if (c.id && (!c.title || c.code === c.id.slice(0, 8))) ids.add(c.id)
         }
      }
   }
   if (ids.size === 0) return plan

   const resolved = new Map<string, PlannedCourse>()
   await Promise.all(
      [...ids].map(async id => {
         try {
            const res = await queryClient.fetchQuery(
               orpc.course.course.queryOptions({
                  input: { params: { course_id: id } },
               }),
            )
            const course = res?.data
            if (!course) return
            resolved.set(id, {
               id,
               code: `${course.subject_id} ${course.course_number}`,
               title: course.title ?? '',
               credits: course.credits != null ? Number(course.credits) : null,
            })
         } catch {
            // keep placeholder
         }
      }),
   )

   if (resolved.size === 0) return plan
   return fromCompactPlan(toCompactPlan(plan), id => resolved.get(id))
}
