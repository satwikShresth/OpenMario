import {
   Box,
   createListCollection,
   HStack,
   Portal,
   Select,
   Stack,
   Text,
   VStack,
} from '@chakra-ui/react'
import { useDroppable } from '@dnd-kit/core'
import { CourseChip } from './CourseChip'
import { AddCoursePopover } from './AddCoursePopover'
import { quarterDropId, usePlanDrag, type QuarterDropData } from './PlanCourseDnd'
import {
   COOP_REMAINING_CREDITS,
   COOP_RESERVED_CREDITS,
   courseCredits,
   isOverSoftCreditLimit,
   quarterLoadCredits,
   setQuarterMode,
   softCreditCap,
   type Quarter,
   type QuarterMode,
   type TermName,
} from '@/lib/plan-of-study'

const TERM_ACCENT: Record<TermName, string> = {
   Fall: 'orange',
   Winter: 'cyan',
   Spring: 'green',
   Summer: 'yellow',
}

const modeCollection = createListCollection({
   items: [
      { label: 'Courses', value: 'courses' },
      { label: 'Break', value: 'break' },
      { label: 'Co-op', value: 'coop' },
   ] satisfies Array<{ label: string; value: QuarterMode }>,
})

type QuarterCellProps = {
   quarter: Quarter
   yearIndex: number
   displayYear: number
   academicYear: number
}

export function QuarterCell({
   quarter,
   yearIndex,
   displayYear,
   academicYear,
}: QuarterCellProps) {
   const overLimit = isOverSoftCreditLimit(quarter)
   const load = quarterLoadCredits(quarter)
   const coursesOnly = courseCredits(quarter)
   const cap = softCreditCap(quarter.mode)
   const accent = TERM_ACCENT[quarter.term]
   const { usualTerms } = usePlanDrag()

   const canDrop = quarter.mode !== 'break'
   const usualMatch = usualTerms != null && usualTerms.includes(quarter.term)

   const { setNodeRef, isOver } = useDroppable({
      id: quarterDropId(yearIndex, quarter.term),
      disabled: !canDrop,
      data: {
         type: 'quarter',
         yearIndex,
         term: quarter.term,
         mode: quarter.mode,
      } satisfies QuarterDropData,
   })

   return (
      <Stack
         ref={setNodeRef}
         gap='3'
         p='4'
         minH='10.5rem'
         minW='0'
         bg={overLimit ? 'bg.warning' : 'bg.panel'}
         outlineWidth={usualMatch || (isOver && canDrop) ? '2px' : '0'}
         outlineStyle='solid'
         outlineColor={usualMatch ? 'green.solid' : 'border.emphasized'}
         outlineOffset='-2px'
         transition='outline-color 120ms ease, outline-width 120ms ease'
      >
         <Stack gap='2'>
            <HStack justify='space-between' align='baseline' gap='2'>
               <HStack gap='2' minW='0'>
                  <Box
                     w='1.5'
                     h='1.5'
                     borderRadius='full'
                     bg={`${accent}.solid`}
                     flexShrink={0}
                     aria-hidden
                  />
                  <Text textStyle='sm' fontWeight='semibold' truncate>
                     {quarter.term}
                  </Text>
                  <Text textStyle='xs' color='fg.muted'>
                     {displayYear}
                  </Text>
               </HStack>
               <Text
                  textStyle='2xs'
                  color={overLimit ? 'fg.warning' : 'fg.muted'}
                  fontWeight={overLimit ? 'semibold' : 'normal'}
                  whiteSpace='nowrap'
               >
                  {load}/{cap} cr
               </Text>
            </HStack>

            <Select.Root
               size='xs'
               width='full'
               collection={modeCollection}
               value={[quarter.mode]}
               onValueChange={({ value }) => {
                  const next = value[0] as QuarterMode | undefined
                  if (next) setQuarterMode(yearIndex, quarter.term, next)
               }}
               positioning={{ sameWidth: true }}
            >
               <Select.HiddenSelect aria-label={`${quarter.term} mode`} />
               <Select.Control>
                  <Select.Trigger>
                     <Select.ValueText placeholder='Mode' />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                     <Select.Indicator />
                  </Select.IndicatorGroup>
               </Select.Control>
               <Portal>
                  <Select.Positioner>
                     <Select.Content>
                        {modeCollection.items.map(item => (
                           <Select.Item item={item} key={item.value}>
                              {item.label}
                              <Select.ItemIndicator />
                           </Select.Item>
                        ))}
                     </Select.Content>
                  </Select.Positioner>
               </Portal>
            </Select.Root>
         </Stack>

         {quarter.mode === 'break' ? (
            <Text textStyle='xs' color='fg.muted' py='6' textAlign='center'>
               Break — no courses
            </Text>
         ) : (
            <Stack gap='2' flex='1'>
               {quarter.mode === 'coop' && (
                  <Text textStyle='2xs' color='fg.muted'>
                     Co-op holds {COOP_RESERVED_CREDITS} cr · {COOP_REMAINING_CREDITS} left (
                     {coursesOnly} used)
                  </Text>
               )}

               <VStack align='stretch' gap='1.5' flex='1'>
                  {quarter.courses.map(course => (
                     <CourseChip
                        key={course.id}
                        course={course}
                        term={quarter.term}
                        academicYear={academicYear}
                        yearIndex={yearIndex}
                     />
                  ))}
               </VStack>

               <AddCoursePopover
                  yearIndex={yearIndex}
                  term={quarter.term}
                  existingCourseIds={quarter.courses.map(c => c.id)}
               />
            </Stack>
         )}
      </Stack>
   )
}
