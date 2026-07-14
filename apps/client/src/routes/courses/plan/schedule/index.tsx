import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
   Box,
   Button,
   createListCollection,
   Field,
   HStack,
   Portal,
   Select,
   Stack,
   Text,
} from '@chakra-ui/react'
import { z } from 'zod'
import { upsertTerm } from '@/db/mutations'
import { useAllTerms } from '@/db/stores/terms'
import { orpc } from '@/helpers'
import {
   applyQuarterScheduleImport,
   decodeQuarterSchedule,
} from '@/lib/quarter-schedule'
import { toaster } from '@/components/ui/toaster'

const TERMS = ['Fall', 'Winter', 'Spring', 'Summer'] as const
type TermName = (typeof TERMS)[number]

const searchSchema = z.object({
   schedule: z.string().optional(),
})

export const Route = createFileRoute('/courses/plan/schedule/')({
   validateSearch: searchSchema,
   component: SchedulePickerPage,
})

function guessCurrentTerm(): { term: TermName; year: number } {
   const now = new Date()
   const month = now.getMonth()
   const year = now.getFullYear()

   if (month >= 8 && month <= 10) return { term: 'Fall', year }
   if (month === 11) return { term: 'Winter', year: year + 1 }
   if (month <= 1) return { term: 'Winter', year }
   if (month <= 4) return { term: 'Spring', year }
   return { term: 'Summer', year }
}

function yearOptions(center: number) {
   return Array.from({ length: 7 }, (_, i) => center - 3 + i)
}

function SchedulePickerPage() {
   const navigate = useNavigate()
   const queryClient = useQueryClient()
   const search = Route.useSearch()
   const terms = useAllTerms()
   const guessed = useMemo(() => guessCurrentTerm(), [])

   const activePreferred = useMemo(() => {
      return [...terms]
         .filter(t => t.is_active)
         .sort((a, b) => b.year - a.year)[0]
   }, [terms])

   const [term, setTerm] = useState<TermName>(
      () => (activePreferred?.term as TermName) ?? guessed.term,
   )
   const [year, setYear] = useState(
      () => activePreferred?.year ?? guessed.year,
   )
   const [busy, setBusy] = useState(false)
   const [importing, setImporting] = useState(false)
   const [error, setError] = useState<string | null>(null)

   const clearScheduleParam = useEffectEvent(() => {
      void navigate({
         to: '.',
         search: { schedule: undefined },
         replace: true,
      })
   })

   useEffect(() => {
      if (!search.schedule) return
      let cancelled = false

      const run = async () => {
         setImporting(true)
         setError(null)
         try {
            const payload = decodeQuarterSchedule(search.schedule!)
            const { token } = await queryClient.fetchQuery(
               orpc.auth.getSearchToken.queryOptions({
                  staleTime: 60_000,
               }),
            )
            const result = await applyQuarterScheduleImport({
               payload,
               searchToken: token,
            })
            if (cancelled) return

            const parts = [
               `${result.added} section${result.added === 1 ? '' : 's'} added`,
            ]
            if (result.skipped) parts.push(`${result.skipped} already present`)
            if (result.unavailableAdded) {
               parts.push(
                  `${result.unavailableAdded} unavailable block${result.unavailableAdded === 1 ? '' : 's'}`,
               )
            }
            toaster.create({
               title: `${payload.term} ${payload.year} schedule imported`,
               description:
                  result.missing.length > 0
                     ? `${parts.join(' · ')}. Missing CRNs: ${result.missing.join(', ')}`
                     : parts.join(' · '),
               type: result.missing.length > 0 ? 'warning' : 'success',
            })
            clearScheduleParam()
            await navigate({
               to: '/courses/plan/schedule/$term_id',
               params: { term_id: result.termId },
               search: { search: undefined },
               replace: true,
            })
         } catch (e) {
            if (cancelled) return
            setError(e instanceof Error ? e.message : 'Could not import schedule link')
            setImporting(false)
            clearScheduleParam()
         }
      }

      void run()
      return () => {
         cancelled = true
      }
   }, [search.schedule, queryClient, navigate, clearScheduleParam])

   const termCollection = useMemo(
      () =>
         createListCollection({
            items: TERMS.map(t => ({ label: t, value: t })),
         }),
      [],
   )

   const yearCollection = useMemo(
      () =>
         createListCollection({
            items: yearOptions(guessed.year).map(y => ({
               label: String(y),
               value: String(y),
            })),
         }),
      [guessed.year],
   )

   const openSchedule = async () => {
      setBusy(true)
      setError(null)
      try {
         const termId = await upsertTerm(term, year)
         await navigate({
            to: '/courses/plan/schedule/$term_id',
            params: { term_id: termId },
            search: { search: undefined },
         })
      } catch {
         setError('Could not open that quarter')
         setBusy(false)
      }
   }

   if (importing || search.schedule) {
      return (
         <Box w='full' maxW='lg' mx='auto' py={{ base: 4, md: 8 }}>
            <Text fontWeight='medium'>Importing quarter schedule…</Text>
            <Text textStyle='sm' color='fg.muted' mt={1}>
               Resolving sections and adding them to your local calendar.
            </Text>
         </Box>
      )
   }

   return (
      <Box w='full' maxW='lg' mx='auto' py={{ base: 4, md: 8 }}>
         <Stack gap={6}>
            <Stack gap={1}>
               <Text fontWeight='semibold' fontSize='lg'>
                  Choose a quarter
               </Text>
               <Text textStyle='sm' color='fg.muted'>
                  Pick which term to build section schedules and your weekly calendar for.
                  Or open a share link from MCP to import CRNs automatically.
               </Text>
            </Stack>

            <HStack gap={4} align='end' flexWrap='wrap'>
               <Field.Root flex='1' minW='9rem'>
                  <Field.Label>Term</Field.Label>
                  <Select.Root
                     size='md'
                     collection={termCollection}
                     value={[term]}
                     onValueChange={({ value }) => {
                        const next = value[0] as TermName | undefined
                        if (next) setTerm(next)
                     }}
                     positioning={{ sameWidth: true }}
                  >
                     <Select.HiddenSelect />
                     <Select.Control>
                        <Select.Trigger>
                           <Select.ValueText placeholder='Term' />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                           <Select.Indicator />
                        </Select.IndicatorGroup>
                     </Select.Control>
                     <Portal>
                        <Select.Positioner>
                           <Select.Content>
                              {termCollection.items.map(item => (
                                 <Select.Item item={item} key={item.value}>
                                    {item.label}
                                    <Select.ItemIndicator />
                                 </Select.Item>
                              ))}
                           </Select.Content>
                        </Select.Positioner>
                     </Portal>
                  </Select.Root>
               </Field.Root>

               <Field.Root flex='1' minW='7rem'>
                  <Field.Label>Year</Field.Label>
                  <Select.Root
                     size='md'
                     collection={yearCollection}
                     value={[String(year)]}
                     onValueChange={({ value }) => {
                        const next = value[0]
                        if (next) setYear(Number(next))
                     }}
                     positioning={{ sameWidth: true }}
                  >
                     <Select.HiddenSelect />
                     <Select.Control>
                        <Select.Trigger>
                           <Select.ValueText placeholder='Year' />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                           <Select.Indicator />
                        </Select.IndicatorGroup>
                     </Select.Control>
                     <Portal>
                        <Select.Positioner>
                           <Select.Content>
                              {yearCollection.items.map(item => (
                                 <Select.Item item={item} key={item.value}>
                                    {item.label}
                                    <Select.ItemIndicator />
                                 </Select.Item>
                              ))}
                           </Select.Content>
                        </Select.Positioner>
                     </Portal>
                  </Select.Root>
               </Field.Root>
            </HStack>

            {error && (
               <Text textStyle='sm' color='fg.error'>
                  {error}
               </Text>
            )}

            <Button
               colorPalette='blue'
               alignSelf='start'
               loading={busy}
               onClick={() => void openSchedule()}
            >
               Open {term} {year} schedule
            </Button>
         </Stack>
      </Box>
   )
}
