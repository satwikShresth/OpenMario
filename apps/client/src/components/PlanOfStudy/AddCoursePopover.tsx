import {
   Badge,
   Button,
   Field,
   Flex,
   HStack,
   Input,
   Popover,
   Portal,
   Spinner,
   Text,
   VStack,
} from '@chakra-ui/react'
import { Suspense, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Configure, InstantSearch, useInstantSearch } from 'react-instantsearch'
import { LuPlus } from 'react-icons/lu'
import { orpc, useSearchClient } from '@/helpers'
import { INDEX_NAMES } from '@openmario/meilisearch'
import {
   addCourseToQuarter,
   seasonsFromAvailabilities,
   type TermName,
} from '@/lib/plan-of-study'

type AddCoursePopoverProps = {
   yearIndex: number
   term: TermName
   existingCourseIds: string[]
   disabled?: boolean
}

function OfferingBadges({ courseId, targetTerm }: { courseId: string; targetTerm: TermName }) {
   const { data, isLoading } = useQuery(
      orpc.course.availabilities.queryOptions({
         input: { params: { course_id: courseId } },
         select: seasonsFromAvailabilities,
         staleTime: 60_000,
      }),
   )

   if (isLoading) {
      return (
         <Text fontSize='2xs' color='fg.muted'>
            Checking terms…
         </Text>
      )
   }

   if (!data || data.length === 0) {
      return (
         <Text fontSize='2xs' color='fg.muted'>
            Offering history unknown
         </Text>
      )
   }

   return (
      <HStack gap={1} flexWrap='wrap'>
         <Text fontSize='2xs' color='fg.muted'>
            Usually:
         </Text>
         {data.map(season => (
            <Badge
               key={season}
               size='xs'
               colorPalette={season === targetTerm ? 'green' : 'gray'}
               variant={season === targetTerm ? 'solid' : 'subtle'}
            >
               {season}
            </Badge>
         ))}
      </HStack>
   )
}

function CourseSearchBody({
   yearIndex,
   term,
   existingCourseIds,
   onAdded,
}: {
   yearIndex: number
   term: TermName
   existingCourseIds: string[]
   onAdded: () => void
}) {
   const [searchQuery, setSearchQuery] = useState('')
   const { results, status } = useInstantSearch()
   const courses = results.__isArtificial ? [] : results.hits
   const exclude =
      existingCourseIds.length === 0
         ? undefined
         : existingCourseIds.map(id => `id != "${id}"`).join(' AND ')

   const handleAdd = (hit: {
      id?: string
      course?: string
      title?: string
      credits?: number | string | null
   }) => {
      const id = hit.id
      if (!id || !hit.course) return
      const creditsRaw = hit.credits
      const credits =
         creditsRaw != null && Number.isFinite(Number(creditsRaw))
            ? Number(creditsRaw)
            : null
      addCourseToQuarter(yearIndex, term, {
         id,
         code: hit.course,
         title: hit.title ?? '',
         credits,
      })
      onAdded()
   }

   return (
      <>
         <Configure query={searchQuery} hitsPerPage={12} filters={exclude} facets={[]} />
         <VStack align='stretch' gap='3'>
            <Field.Root>
               <Field.Label>Search</Field.Label>
               <Input
                  placeholder='CS 260, Data Structures…'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  size='sm'
               />
            </Field.Root>
            {status === 'loading' && (
               <HStack justify='center' py='4'>
                  <Spinner size='sm' />
                  <Text textStyle='sm' color='fg.muted'>
                     Searching…
                  </Text>
               </HStack>
            )}
            {status === 'idle' && courses.length === 0 && searchQuery && (
               <Text textStyle='sm' color='fg.muted' textAlign='center' py='4'>
                  No courses found
               </Text>
            )}
            <Flex direction='column' gap='2' maxH='320px' overflowY='auto'>
               {courses.map((hit: any) => (
                  <VStack
                     key={hit.id}
                     align='stretch'
                     gap='1.5'
                     p='2.5'
                     borderWidth='1px'
                     borderColor='border.subtle'
                     borderRadius='md'
                     bg='bg.panel'
                     _hover={{ bg: 'bg.muted' }}
                  >
                     <HStack justify='space-between' align='start'>
                        <VStack align='start' gap='0' flex='1' minW='0'>
                           <Text textStyle='sm' fontWeight='semibold'>
                              {hit.course}
                           </Text>
                           <Text textStyle='xs' color='fg.muted' lineClamp={1}>
                              {hit.title}
                           </Text>
                        </VStack>
                        <Button
                           size='xs'
                           colorPalette='blue'
                           variant='subtle'
                           onClick={() => handleAdd(hit)}
                        >
                           <LuPlus />
                           Add
                        </Button>
                     </HStack>
                     {hit.id && <OfferingBadges courseId={hit.id} targetTerm={term} />}
                  </VStack>
               ))}
            </Flex>
         </VStack>
      </>
   )
}

function CourseSearchInstant({
   yearIndex,
   term,
   existingCourseIds,
   onAdded,
}: {
   yearIndex: number
   term: TermName
   existingCourseIds: string[]
   onAdded: () => void
}) {
   const { searchClient } = useSearchClient()

   return (
      <InstantSearch
         searchClient={searchClient}
         indexName={INDEX_NAMES.courses}
         future={{ preserveSharedStateOnUnmount: false }}
      >
         <CourseSearchBody
            yearIndex={yearIndex}
            term={term}
            existingCourseIds={existingCourseIds}
            onAdded={onAdded}
         />
      </InstantSearch>
   )
}

export function AddCoursePopover({
   yearIndex,
   term,
   existingCourseIds,
   disabled,
}: AddCoursePopoverProps) {
   const [open, setOpen] = useState(false)

   return (
      <Popover.Root open={open} onOpenChange={e => setOpen(e.open)}>
         <Popover.Trigger asChild>
            <Button
               size='xs'
               variant='ghost'
               disabled={disabled}
               w='full'
               justifyContent='start'
               color='fg.muted'
            >
               <LuPlus />
               Add course
            </Button>
         </Popover.Trigger>
         <Portal>
            <Popover.Positioner>
               <Popover.Content minW='320px' maxW='420px' maxH='480px'>
                  <Popover.Arrow />
                  <Popover.Header>
                     <Text fontWeight='semibold' fontSize='sm'>
                        Add to {term}
                     </Text>
                  </Popover.Header>
                  <Popover.Body>
                     {open ? (
                        <Suspense
                           fallback={
                              <HStack justify='center' py='6'>
                                 <Spinner size='sm' />
                              </HStack>
                           }
                        >
                           <CourseSearchInstant
                              yearIndex={yearIndex}
                              term={term}
                              existingCourseIds={existingCourseIds}
                              onAdded={() => setOpen(false)}
                           />
                        </Suspense>
                     ) : null}
                  </Popover.Body>
               </Popover.Content>
            </Popover.Positioner>
         </Portal>
      </Popover.Root>
   )
}
