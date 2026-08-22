import {
   Box,
   Button,
   Flex,
   Heading,
   HStack,
   Tabs,
   Text,
   VStack,
} from '@chakra-ui/react'
import { Suspense, useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { CourseDocument } from '@openmario/meilisearch'
import { INDEX_NAMES } from '@openmario/meilisearch'
import { BS_CS, type CourseRef } from '@/lib/major-map'
import { useSearchClient } from '@/helpers'
import { toaster } from '@/components/ui/toaster'
import { MajorMapGraph } from './MajorMapGraph'
import { MajorMapTree } from './MajorMapTree'

async function resolveCourseId(
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   searchClient: { search: (...args: any[]) => Promise<any> },
   code: string,
): Promise<string | null> {
   const q = code.trim()
   if (!q) return null

   const { results } = await searchClient.search([
      {
         indexName: INDEX_NAMES.courses,
         params: {
            query: q,
            hitsPerPage: 8,
         },
      },
   ])

   const hits = (results?.[0] as { hits?: CourseDocument[] } | undefined)?.hits ?? []
   const exact = hits.find(h => h.course?.toUpperCase() === q.toUpperCase())
   return exact?.id ?? hits[0]?.id ?? null
}

function MajorMapBody() {
   const program = BS_CS
   const navigate = useNavigate()
   const { searchClient } = useSearchClient()
   const [notesOpen, setNotesOpen] = useState(false)
   const [resolving, setResolving] = useState(false)
   const [path, setPath] = useState<string[]>([])
   const [view, setView] = useState('graph')

   const onCourseClick = useCallback(
      async (course: CourseRef) => {
         setResolving(true)
         try {
            const id = await resolveCourseId(searchClient, course.code)
            if (!id) {
               toaster.create({
                  title: 'Course not in catalog index',
                  description: `${course.code} — ${course.title}`,
                  type: 'info',
               })
               return
            }
            await navigate({
               to: '/courses/explore/$course_id',
               params: { course_id: id },
            })
         } catch {
            toaster.create({
               title: 'Could not open course',
               description: course.code,
               type: 'error',
            })
         } finally {
            setResolving(false)
         }
      },
      [navigate, searchClient],
   )

   return (
      <Flex direction='column' gap={3} h='full' minH={0} p={{ base: 3, md: 4 }}>
         <Flex
            direction={{ base: 'column', md: 'row' }}
            justify='space-between'
            align={{ base: 'stretch', md: 'start' }}
            gap={3}
            flexShrink={0}
         >
            <VStack align='start' gap={1}>
               <Text
                  fontSize='xs'
                  color='fg.muted'
                  fontWeight='medium'
                  textTransform='uppercase'
                  letterSpacing='wider'
               >
                  Major Map
               </Text>
               <Heading size='lg' lineHeight='short'>
                  {program.degree} in {program.name}
               </Heading>
               <HStack gap={3} fontSize='sm' color='fg.muted'>
                  <Text fontWeight='medium' color='fg'>
                     {program.totalCredits} credits
                  </Text>
                  <Text>·</Text>
                  <Text>Graph or tree · log progress · pick sequences</Text>
                  {resolving && <Text color='teal.fg'>Opening…</Text>}
               </HStack>
            </VStack>

            <HStack gap={2} alignSelf={{ base: 'stretch', md: 'start' }}>
               {view === 'graph' && path.length > 0 && (
                  <Button size='sm' variant='ghost' onClick={() => setPath([])}>
                     Overview
                  </Button>
               )}
               <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setNotesOpen(o => !o)}
               >
                  {notesOpen ? 'Hide notes' : 'Catalog notes'}
               </Button>
            </HStack>
         </Flex>

         {notesOpen && (
            <Box
               borderWidth='thin'
               borderRadius='md'
               bg='bg.subtle'
               px={4}
               py={3}
               flexShrink={0}
            >
               <VStack align='stretch' gap={1.5}>
                  {(program.footnotes ?? []).map(note => (
                     <Text key={note} fontSize='sm' color='fg.muted'>
                        • {note}
                     </Text>
                  ))}
               </VStack>
            </Box>
         )}

         <Tabs.Root
            value={view}
            onValueChange={e => setView(e.value)}
            variant='line'
            display='flex'
            flexDirection='column'
            flex={1}
            minH={0}
            lazyMount
         >
            <Tabs.List flexShrink={0}>
               <Tabs.Trigger value='graph'>Graph</Tabs.Trigger>
               <Tabs.Trigger value='tree'>Tree</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value='graph' flex={1} minH={0} display='flex' pt={3}>
               <MajorMapGraph
                  program={program}
                  path={path}
                  onPathChange={setPath}
                  onCourseClick={onCourseClick}
               />
            </Tabs.Content>

            <Tabs.Content value='tree' flex={1} minH={0} display='flex' pt={3}>
               <MajorMapTree program={program} onCourseClick={onCourseClick} />
            </Tabs.Content>
         </Tabs.Root>
      </Flex>
   )
}

export function MajorMapPage() {
   return (
      <Suspense
         fallback={
            <Box p={6}>
               <Text color='fg.muted'>Loading major map…</Text>
            </Box>
         }
      >
         <MajorMapBody />
      </Suspense>
   )
}
