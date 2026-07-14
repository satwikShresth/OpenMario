import { env } from '@env'
import type { SectionDocument } from '@openmario/meilisearch'
import { toDrexelTermId } from '@/components/Search/Courses/helpers'
import {
   deletePlanEvent,
   deletePlanEventsByCrn,
   deleteSection,
   insertPlanEvent,
   upsertCourse,
   upsertSection,
   upsertTerm,
} from '@/db/mutations'
import { planEventsStore } from '@/db/stores/plan-events'
import { sectionsStore } from '@/db/stores/sections'
import type { QuarterSchedulePayload, UnavailableBlock } from './encode'

export type ScheduleImportSectionHit = Pick<
   SectionDocument,
   | 'crn'
   | 'course_id'
   | 'course'
   | 'title'
   | 'credits'
   | 'days'
   | 'start_time'
   | 'end_time'
   | 'instruction_method'
   | 'instruction_type'
>

export type ScheduleImportResult = {
   termId: string
   added: number
   skipped: number
   missing: number[]
   unavailableAdded: number
}

function getTermMonth(term: string): number {
   switch (term) {
      case 'Spring':
         return 0
      case 'Summer':
         return 4
      case 'Fall':
         return 8
      case 'Winter':
         return 11
      default:
         return 0
   }
}

async function fetchSectionsByCrn(
   token: string,
   term: string,
   year: number,
   crns: number[],
): Promise<ScheduleImportSectionHit[]> {
   if (crns.length === 0) return []
   const drexelTerm = toDrexelTermId(term, year)
   const host = env.VITE_MEILI_HOST.replace(/\/$/, '')
   const res = await fetch(`${host}/indexes/sections/search`, {
      method: 'POST',
      headers: {
         Authorization: `Bearer ${token}`,
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         q: '',
         filter: `term = "${drexelTerm}" AND crn IN [${crns.join(', ')}]`,
         limit: crns.length,
      }),
   })
   if (!res.ok) {
      throw new Error(`Meilisearch sections lookup failed (${res.status})`)
   }
   const json = (await res.json()) as { hits?: ScheduleImportSectionHit[] }
   return json.hits ?? []
}

async function clearTermPlanned(termId: string) {
   const sectionCrns = [...sectionsStore.state.values()]
      .filter(s => s.term_id === termId && s.status === 'planned')
      .map(s => s.crn)
   for (const crn of sectionCrns) {
      await deletePlanEventsByCrn(crn)
      await deleteSection(crn)
   }
   const eventIds = [...planEventsStore.state.values()]
      .filter(e => e.term_id === termId)
      .map(e => e.id)
   for (const id of eventIds) {
      await deletePlanEvent(id)
   }
}

async function addSectionToTerm(
   termId: string,
   term: string,
   year: number,
   section: ScheduleImportSectionHit,
): Promise<'added' | 'skipped'> {
   const crn = String(section.crn)
   const existing = sectionsStore.state.get(crn)
   if (existing?.status === 'planned' && existing.term_id === termId) {
      return 'skipped'
   }

   await upsertCourse({
      id: section.course_id,
      course: section.course,
      title: section.title,
      credits: section.credits ?? null,
      completed: false,
   })
   await upsertSection({
      crn,
      term_id: termId,
      course_id: section.course_id,
      status: 'planned',
      liked: false,
   })

   const isOnlineAsync =
      section.instruction_method === 'Online' && section.instruction_type === 'Asynchronous'
   const hasSchedule = !!(
      section.days?.length &&
      section.start_time &&
      section.end_time
   )
   if (isOnlineAsync || !hasSchedule) return 'added'

   const dayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
   }
   const [startHours, startMinutes] = section.start_time!.split(':').map(Number)
   const [endHours, endMinutes] = section.end_time!.split(':').map(Number)
   const referenceWeekStart = new Date(year, getTermMonth(term), 1)

   await Promise.all(
      section.days!.map(dayName => {
         const targetDayOfWeek = dayMap[dayName]
         if (targetDayOfWeek == null) return Promise.resolve()
         const eventDate = new Date(referenceWeekStart)
         while (eventDate.getDay() !== targetDayOfWeek) {
            eventDate.setDate(eventDate.getDate() + 1)
         }
         const eventStart = new Date(eventDate)
         eventStart.setHours(startHours!, startMinutes!, 0, 0)
         const eventEnd = new Date(eventDate)
         eventEnd.setHours(endHours!, endMinutes!, 0, 0)
         return insertPlanEvent({
            type: 'course',
            title: `${section.course}: ${section.title}`,
            start: eventStart.toISOString(),
            end: eventEnd.toISOString(),
            term_id: termId,
            crn,
         })
      }),
   )
   return 'added'
}

async function addUnavailable(
   termId: string,
   term: string,
   year: number,
   block: UnavailableBlock,
) {
   const [startHours, startMinutes] = block.start.split(':').map(Number)
   const [endHours, endMinutes] = block.end.split(':').map(Number)
   const referenceWeekStart = new Date(year, getTermMonth(term), 1)
   const eventDate = new Date(referenceWeekStart)
   while (eventDate.getDay() !== block.day) {
      eventDate.setDate(eventDate.getDate() + 1)
   }
   const eventStart = new Date(eventDate)
   eventStart.setHours(startHours!, startMinutes!, 0, 0)
   const eventEnd = new Date(eventDate)
   eventEnd.setHours(endHours!, endMinutes!, 0, 0)
   await insertPlanEvent({
      type: 'unavailable',
      title: block.title || 'Unavailable',
      start: eventStart.toISOString(),
      end: eventEnd.toISOString(),
      term_id: termId,
   })
}

export async function applyQuarterScheduleImport(opts: {
   payload: QuarterSchedulePayload
   searchToken: string
}): Promise<ScheduleImportResult> {
   const { payload, searchToken } = opts
   const termId = await upsertTerm(payload.term, payload.year)

   if (payload.action === 'replace') {
      await clearTermPlanned(termId)
   }

   const hits = await fetchSectionsByCrn(
      searchToken,
      payload.term,
      payload.year,
      payload.crns,
   )
   const byCrn = new Map(hits.map(h => [h.crn, h]))

   let added = 0
   let skipped = 0
   const missing: number[] = []

   for (const crn of payload.crns) {
      const hit = byCrn.get(crn)
      if (!hit) {
         missing.push(crn)
         continue
      }
      const result = await addSectionToTerm(termId, payload.term, payload.year, hit)
      if (result === 'added') added += 1
      else skipped += 1
   }

   let unavailableAdded = 0
   for (const block of payload.unavailable) {
      await addUnavailable(termId, payload.term, payload.year, block)
      unavailableAdded += 1
   }

   return { termId, added, skipped, missing, unavailableAdded }
}
