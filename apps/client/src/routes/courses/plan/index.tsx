import {
   Badge,
   Box,
   Button,
   Card,
   Dialog,
   Flex,
   Grid,
   HStack,
   Icon,
   NativeSelect,
   Portal,
   Separator,
   Text,
   VStack,
} from '@chakra-ui/react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { Courses } from '@/components/Courses'
import { termsStore, useAllTerms } from '@/db/stores/terms'
import { sectionsStore } from '@/db/stores/sections'
import { coursesStore } from '@/db/stores/courses'
import { useState } from 'react'
import { CalendarPlusIcon, ChevronRightIcon, BookOpenIcon, GraduationCapIcon } from '@/components/icons'

const TERM_ORDER = ['Fall', 'Winter', 'Spring', 'Summer'] as const
type TermName = typeof TERM_ORDER[number]

const TERM_COLORS: Record<string, string> = {
   Fall: 'orange',
   Winter: 'cyan',
   Spring: 'green',
   Summer: 'yellow',
}

export const Route = createFileRoute('/courses/plan/')({
   component: PlanIndexPage,
})

function NewPlanButton() {
   const navigate = useNavigate()
   const [open, setOpen] = useState(false)
   const [selectedTermId, setSelectedTermId] = useState<string>('')

   const allTerms = useAllTerms()

   const sortedTerms = [...allTerms].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      return TERM_ORDER.indexOf(a.term as TermName) - TERM_ORDER.indexOf(b.term as TermName)
   })

   const currentId = selectedTermId || sortedTerms[0]?.id || ''

   const handleCreate = () => {
      if (!currentId) return
      setOpen(false)
      navigate({ to: '/courses/plan/$term_id', params: { term_id: currentId } })
   }

   return (
      <Dialog.Root open={open} onOpenChange={e => setOpen(e.open)}>
         <Dialog.Trigger asChild>
            <Button colorPalette='blue' size='sm'>
               <Icon as={CalendarPlusIcon} />
               New Plan
            </Button>
         </Dialog.Trigger>

         <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
               <Dialog.Content maxW='sm'>
                  <Dialog.Header>
                     <Dialog.Title>New Course Plan</Dialog.Title>
                  </Dialog.Header>

                  <Dialog.Body>
                     <VStack align='stretch' gap={4}>
                        <Text fontSize='sm' color='fg.muted'>
                           Select a term to create a plan for.
                        </Text>
                        <NativeSelect.Root size='md'>
                           <NativeSelect.Field
                              value={currentId}
                              onChange={e => setSelectedTermId(e.target.value)}
                              borderRadius='lg'
                           >
                              {sortedTerms.length === 0 && (
                                 <option value=''>Loading terms…</option>
                              )}
                              {sortedTerms.map(t => (
                                 <option key={t.id} value={t.id}>{t.term} {t.year}</option>
                              ))}
                           </NativeSelect.Field>
                           <NativeSelect.Indicator />
                        </NativeSelect.Root>
                     </VStack>
                  </Dialog.Body>

                  <Dialog.Footer>
                     <Dialog.ActionTrigger asChild>
                        <Button variant='outline' size='sm'>Cancel</Button>
                     </Dialog.ActionTrigger>
                     <Button
                        colorPalette='blue'
                        size='sm'
                        onClick={handleCreate}
                        disabled={!currentId}
                     >
                        Open Plan
                        <Icon as={ChevronRightIcon} />
                     </Button>
                  </Dialog.Footer>

                  <Dialog.CloseTrigger />
               </Dialog.Content>
            </Dialog.Positioner>
         </Portal>
      </Dialog.Root>
   )
}

type PlanSummary = {
   termId: string; term: string; year: number; courseCount: number; totalCredits: number
}

function PlanCard({ plan }: { plan: PlanSummary }) {
   const termColor = TERM_COLORS[plan.term] ?? 'gray'

   return (
      <Link
         to='/courses/plan/$term_id'
         params={{ term_id: plan.termId }}
         style={{ textDecoration: 'none', display: 'flex', height: '100%' }}
      >
         <Card.Root
            variant='outline'
            borderRadius='xl'
            cursor='pointer'
            w='full'
            h='full'
            _hover={{ shadow: 'md', borderColor: `${termColor}.400` }}
            transition='all 0.15s'
            overflow='hidden'
         >
            <Box h='3px' bg={`${termColor}.400`} flexShrink={0} />
            <Card.Body py={5} px={5}>
               <VStack align='stretch' gap={4}>
                  <Flex justify='space-between' align='flex-start'>
                     <VStack align='flex-start' gap={1}>
                        <Badge colorPalette={termColor} variant='subtle' px={2.5} py={0.5} fontSize='xs'>
                           {plan.term}
                        </Badge>
                        <Text fontWeight='bold' fontSize='2xl' lineHeight='1.1'>
                           {plan.year}
                        </Text>
                     </VStack>
                     <Icon as={ChevronRightIcon} color='fg.muted' boxSize={4} mt={1} />
                  </Flex>

                  <Grid templateColumns='1fr 1fr' gap={3}>
                     <VStack align='flex-start' gap={0.5}>
                        <HStack gap={1}>
                           <Icon as={BookOpenIcon} boxSize={3} color='fg.muted' />
                           <Text fontSize='2xs' color='fg.muted' textTransform='uppercase' letterSpacing='wider'>
                              Courses
                           </Text>
                        </HStack>
                        <Text fontWeight='semibold' fontSize='xl'>{plan.courseCount}</Text>
                     </VStack>
                     <VStack align='flex-start' gap={0.5}>
                        <HStack gap={1}>
                           <Icon as={GraduationCapIcon} boxSize={3} color='fg.muted' />
                           <Text fontSize='2xs' color='fg.muted' textTransform='uppercase' letterSpacing='wider'>
                              Credits
                           </Text>
                        </HStack>
                        <Text fontWeight='semibold' fontSize='xl'>{plan.totalCredits}</Text>
                     </VStack>
                  </Grid>
               </VStack>
            </Card.Body>
         </Card.Root>
      </Link>
   )
}

function PlanIndexPage() {
   const allSections = useStore(sectionsStore)
   const allCourses = useStore(coursesStore)
   const allTerms = useStore(termsStore)

   const deduped = new Map<string, PlanSummary>()
   const seenCourses = new Map<string, Set<string>>()

   for (const s of allSections.values()) {
      if (!s.term_id) continue
      const term = allTerms.get(s.term_id)
      if (!term) continue
      if (!deduped.has(s.term_id)) {
         deduped.set(s.term_id, { termId: s.term_id, term: term.term, year: term.year, courseCount: 0, totalCredits: 0 })
         seenCourses.set(s.term_id, new Set())
      }
      const plan = deduped.get(s.term_id)!
      const seen = seenCourses.get(s.term_id)!
      const course = allCourses.get(s.course_id)
      if (course && !seen.has(course.id)) {
         seen.add(course.id)
         plan.courseCount += 1
         plan.totalCredits += Number(course.credits) || 0
      }
   }

   const plans = Array.from(deduped.values()).sort((a, b) =>
      b.year !== a.year
         ? b.year - a.year
         : TERM_ORDER.indexOf(a.term as TermName) - TERM_ORDER.indexOf(b.term as TermName)
   )

   const totalCredits = plans.reduce((sum, p) => sum + (Number(p.totalCredits) || 0), 0)

   return (
      <Courses.Root>
         <Flex justify='space-between' align='center' wrap='wrap' gap={3}>
            <Courses.PageHeader title='Course Plans' />
            <HStack gap={3}>
               {plans.length > 0 && (
                  <>
                     <Text fontSize='sm' color='fg.muted'>
                        {plans.length} {plans.length === 1 ? 'plan' : 'plans'}
                     </Text>
                     <Text fontSize='sm' color='fg.muted'>·</Text>
                     <Text fontSize='sm' color='fg.muted'>
                        {totalCredits} credits planned
                     </Text>
                  </>
               )}
               <NewPlanButton />
            </HStack>
         </Flex>

         <Separator />

         <Grid
            templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }}
            gap={4}
         >
            {plans.map(plan => (
               <PlanCard key={plan.termId} plan={plan} />
            ))}
         </Grid>

         {plans.length === 0 && (
            <Text fontSize='sm' color='fg.muted' mt={1}>
               No plans yet — create your first one above.
            </Text>
         )}
      </Courses.Root>
   )
}
