import {
   Badge,
   Box,
   Button,
   Checkmark,
   createListCollection,
   createTreeCollection,
   HStack,
   Portal,
   Select,
   Text,
   TreeView,
   VStack,
} from '@chakra-ui/react'
import { useMemo, type ReactNode } from 'react'
import { LuBookOpen, LuFolder, LuLayers, LuListTree } from 'react-icons/lu'
import {
   findSequenceGroups,
   getCourseProgress,
   getSequenceProgress,
   isCourseOutsideSelectedSequence,
   LETTER_GRADES,
   programToTreeNodes,
   selectSequence,
   setCourseGrade,
   toggleCourseCompleted,
   useMajorMapProgress,
   type CourseRef,
   type LetterGrade,
   type MajorProgram,
   type MajorTreeNode,
} from '@/lib/major-map'

const gradeCollection = createListCollection({
   items: [
      { label: 'No grade', value: '' },
      ...LETTER_GRADES.map(g => ({ label: g, value: g })),
   ],
})

type MajorMapTreeProps = {
   program: MajorProgram
   onCourseClick: (course: CourseRef) => void
}

function TreeNodeCheckbox({
   checked,
   onToggle,
   muted,
}: {
   checked: boolean
   onToggle: () => void
   muted?: boolean
}) {
   return (
      <TreeView.NodeCheckbox
         aria-label={checked ? 'Mark as not taken' : 'Mark as taken'}
         opacity={muted ? 0.45 : 1}
         onClick={e => {
            e.stopPropagation()
            onToggle()
         }}
      >
         <Checkmark
            bg={{
               base: 'bg',
               _checked: 'teal.solid',
               _indeterminate: 'teal.solid',
            }}
            size='sm'
            checked={checked}
         />
      </TreeView.NodeCheckbox>
   )
}

function CourseGradeSelect({
   programId,
   program,
   course,
   grade,
}: {
   programId: string
   program: MajorProgram
   course: CourseRef
   grade: LetterGrade | null | undefined
}) {
   return (
      <Select.Root
         collection={gradeCollection}
         size='xs'
         width='5.5rem'
         value={[grade ?? '']}
         onValueChange={e => {
            const next = e.value[0] ?? ''
            setCourseGrade(
               programId,
               course,
               next === '' ? null : (next as LetterGrade),
               program,
            )
         }}
         onClick={e => e.stopPropagation()}
         onPointerDown={e => e.stopPropagation()}
      >
         <Select.HiddenSelect />
         <Select.Control>
            <Select.Trigger>
               <Select.ValueText placeholder='Grade' />
            </Select.Trigger>
         </Select.Control>
         <Portal>
            <Select.Positioner>
               <Select.Content>
                  {gradeCollection.items.map(item => (
                     <Select.Item key={item.value || 'none'} item={item}>
                        {item.label}
                        <Select.ItemIndicator />
                     </Select.Item>
                  ))}
               </Select.Content>
            </Select.Positioner>
         </Portal>
      </Select.Root>
   )
}

function CourseRow({
   node,
   program,
   onCourseClick,
}: {
   node: MajorTreeNode
   program: MajorProgram
   onCourseClick: (course: CourseRef) => void
}) {
   const progress = useMajorMapProgress(program.id)
   const course = node.course!
   const entry = getCourseProgress(progress, course.code)
   const completed = entry?.status === 'completed'
   const outside = isCourseOutsideSelectedSequence(progress, program, course.code)

   return (
      <TreeView.Item onDoubleClick={() => onCourseClick(course)} opacity={outside ? 0.45 : 1}>
         <TreeNodeCheckbox
            checked={completed}
            muted={outside}
            onToggle={() => toggleCourseCompleted(program.id, course, program)}
         />
         <LuBookOpen size={14} />
         <TreeView.ItemText flex='1' minW={0}>
            <HStack gap={2} justify='space-between' w='full' minW={0}>
               <VStack align='start' gap={0} minW={0} flex={1}>
                  <Text
                     fontSize='sm'
                     fontWeight='medium'
                     textDecoration={completed ? 'line-through' : undefined}
                     color={completed ? 'fg.muted' : 'fg'}
                     truncate
                  >
                     {course.code}
                     {course.credits != null ? ` · ${course.credits} cr` : ''}
                  </Text>
                  <Text fontSize='xs' color='fg.muted' truncate w='full'>
                     {course.title}
                     {outside ? ' · other sequence' : ''}
                  </Text>
               </VStack>
               {completed && (
                  <CourseGradeSelect
                     programId={program.id}
                     program={program}
                     course={course}
                     grade={entry?.grade}
                  />
               )}
            </HStack>
         </TreeView.ItemText>
      </TreeView.Item>
   )
}

function BranchLabel({
   node,
   program,
}: {
   node: MajorTreeNode
   program: MajorProgram
}) {
   const progress = useMajorMapProgress(program.id)
   const groups = useMemo(() => findSequenceGroups(program), [program])

   let Icon = LuFolder
   if (node.kind === 'choice') Icon = LuLayers
   if (node.kind === 'sequence' || node.kind === 'sequence-option') Icon = LuListTree

   let badge: ReactNode = null

   if (node.kind === 'sequence') {
      const group = groups.find(g => g.parentId === node.id)
      if (group) {
         const seq = getSequenceProgress(progress, group)
         badge = seq.selected ? (
            <Badge
               size='sm'
               colorPalette={seq.isComplete ? 'green' : 'teal'}
               variant='subtle'
            >
               {seq.isComplete
                  ? 'Sequence complete'
                  : `${seq.completedCount}/${seq.totalCount} in ${seq.selected.title}`}
            </Badge>
         ) : (
            <Badge size='sm' colorPalette='orange' variant='subtle'>
               Pick one sequence
            </Badge>
         )
      }
   }

   if (node.kind === 'sequence-option' && node.sequenceParentId) {
      const group = groups.find(g => g.parentId === node.sequenceParentId)
      const selectedId = group
         ? progress.selectedSequences[group.parentId]
         : null
      const isSelected = selectedId === node.id
      const seqProgress = group ? getSequenceProgress(progress, group) : null

      badge = (
         <HStack gap={1} onClick={e => e.stopPropagation()}>
            {isSelected ? (
               <>
                  <Badge
                     size='sm'
                     colorPalette={seqProgress?.isComplete ? 'green' : 'teal'}
                     variant='solid'
                  >
                     {seqProgress?.isComplete
                        ? 'Done'
                        : `${seqProgress?.completedCount ?? 0}/${seqProgress?.totalCount ?? 0}`}
                  </Badge>
                  <Button
                     size='2xs'
                     variant='ghost'
                     onClick={() => selectSequence(program.id, node.sequenceParentId!, null)}
                  >
                     Clear
                  </Button>
               </>
            ) : (
               <Button
                  size='2xs'
                  variant='outline'
                  colorPalette='teal'
                  onClick={() =>
                     selectSequence(program.id, node.sequenceParentId!, node.id)
                  }
               >
                  Choose
               </Button>
            )}
         </HStack>
      )
   }

   return (
      <TreeView.BranchControl opacity={
         node.kind === 'sequence-option' &&
         node.sequenceParentId &&
         progress.selectedSequences[node.sequenceParentId] &&
         progress.selectedSequences[node.sequenceParentId] !== node.id
            ? 0.5
            : 1
      }>
         <Icon size={14} />
         <TreeView.BranchText flex='1' minW={0}>
            <HStack gap={2} minW={0} flexWrap='wrap'>
               <Text fontSize='sm' fontWeight='medium' truncate>
                  {node.name}
               </Text>
               {node.summary && (
                  <Text
                     fontSize='xs'
                     color='fg.muted'
                     display={{ base: 'none', lg: 'block' }}
                     truncate
                  >
                     {node.summary}
                  </Text>
               )}
               {badge}
            </HStack>
         </TreeView.BranchText>
         <TreeView.BranchIndicator />
      </TreeView.BranchControl>
   )
}

export function MajorMapTree({ program, onCourseClick }: MajorMapTreeProps) {
   const progress = useMajorMapProgress(program.id)

   const collection = useMemo(
      () =>
         createTreeCollection<MajorTreeNode>({
            nodeToValue: node => node.id,
            nodeToString: node => node.name,
            rootNode: {
               id: 'ROOT',
               name: '',
               kind: 'program',
               children: programToTreeNodes(program),
            },
         }),
      [program],
   )

   const completedCount = Object.values(progress.courses).filter(
      c => c.status === 'completed',
   ).length

   const defaultExpanded = useMemo(
      () => program.blocks.map(b => b.id),
      [program.blocks],
   )

   return (
      <VStack align='stretch' gap={3} flex={1} minH={0}>
         <HStack justify='space-between' flexWrap='wrap' gap={2}>
            <Text fontSize='sm' color='fg.muted'>
               Check courses you&apos;ve taken · sequences require finishing every course in the
               path you choose · double-click to open Explore
            </Text>
            <Badge colorPalette='teal' variant='subtle'>
               {completedCount} logged
            </Badge>
         </HStack>

         <Box
            flex={1}
            minH={0}
            overflow='auto'
            borderWidth='thin'
            borderRadius='lg'
            bg='bg'
            px={3}
            py={3}
         >
            <TreeView.Root
               collection={collection}
               colorPalette='teal'
               size='sm'
               variant='subtle'
               animateContent
               defaultExpandedValue={defaultExpanded}
            >
               <TreeView.Label srOnly>Major requirements</TreeView.Label>
               <TreeView.Tree>
                  <TreeView.Node<MajorTreeNode>
                     indentGuide={<TreeView.BranchIndentGuide />}
                     render={({ node, nodeState }) => {
                        if (nodeState.isBranch) {
                           return <BranchLabel node={node} program={program} />
                        }
                        if (node.kind === 'course' && node.course) {
                           return (
                              <CourseRow
                                 node={node}
                                 program={program}
                                 onCourseClick={onCourseClick}
                              />
                           )
                        }
                        return (
                           <TreeView.Item>
                              <TreeView.ItemText color='fg.muted' fontSize='sm'>
                                 {node.name}
                              </TreeView.ItemText>
                           </TreeView.Item>
                        )
                     }}
                  />
               </TreeView.Tree>
            </TreeView.Root>
         </Box>
      </VStack>
   )
}
