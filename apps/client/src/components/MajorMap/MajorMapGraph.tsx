import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo } from 'react'
import {
   Background,
   Controls,
   ReactFlow,
   ReactFlowProvider,
   useReactFlow,
   type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useColorMode, useColorModeValue } from '@/components/ui/color-mode'
import {
   normalizeCourseCode,
   resolveFocus,
   useMajorMapProgress,
   type CourseRef,
   type MajorProgram,
} from '@/lib/major-map'
import ProgramRootNode from './ProgramRootNode'
import FactionNode from './FactionNode'
import ChoiceNode from './ChoiceNode'
import CourseLeafNode from './CourseLeafNode'
import BucketNode from './BucketNode'
import {
   BUCKET_NODE,
   buildFocusedGraph,
   CHOICE_NODE,
   COURSE_LEAF,
   FACTION_NODE,
   PROGRAM_NODE,
} from './majorMapLayout'

const nodeTypes = {
   [PROGRAM_NODE]: ProgramRootNode,
   [FACTION_NODE]: FactionNode,
   [CHOICE_NODE]: ChoiceNode,
   [COURSE_LEAF]: CourseLeafNode,
   [BUCKET_NODE]: BucketNode,
}

type MajorMapGraphProps = {
   program: MajorProgram
   path: string[]
   onPathChange: (path: string[]) => void
   onCourseClick: (course: CourseRef) => void
}

function FitViewOnChange({
   nodeCount,
   pathKey,
}: {
   nodeCount: number
   pathKey: string
}) {
   const { fitView } = useReactFlow()

   useEffect(() => {
      if (nodeCount === 0) return
      const frame = requestAnimationFrame(() => {
         fitView({ padding: 0.22, duration: 280 })
      })
      return () => cancelAnimationFrame(frame)
   }, [fitView, nodeCount, pathKey])

   return null
}

function Breadcrumbs({
   program,
   path,
   onPathChange,
}: {
   program: MajorProgram
   path: string[]
   onPathChange: (path: string[]) => void
}) {
   const { trail } = resolveFocus(program, path)

   return (
      <HStack gap={1} flexWrap='wrap' align='center' px={1}>
         <Button
            size='xs'
            variant={path.length === 0 ? 'subtle' : 'ghost'}
            colorPalette='teal'
            onClick={() => onPathChange([])}
         >
            {program.name}
         </Button>
         {trail.map((block, i) => {
            const isLast = i === trail.length - 1
            return (
               <HStack key={block.id} gap={1}>
                  <Text fontSize='xs' color='fg.muted'>
                     /
                  </Text>
                  <Button
                     size='xs'
                     variant={isLast ? 'subtle' : 'ghost'}
                     colorPalette='teal'
                     onClick={() => onPathChange(path.slice(0, i + 1))}
                  >
                     {block.title}
                  </Button>
               </HStack>
            )
         })}
      </HStack>
   )
}

function GraphCanvas({
   program,
   path,
   onPathChange,
   onCourseClick,
}: MajorMapGraphProps) {
   const backgroundColor = useColorModeValue('#d4d4d8', '#3f3f46')
   const { colorMode } = useColorMode()
   const pathKey = path.join('/')
   const progress = useMajorMapProgress(program.id)

   const courseStatus = useMemo(() => {
      const map: Record<string, { completed: boolean; grade?: string | null }> = {}
      for (const entry of Object.values(progress.courses)) {
         if (entry.status !== 'completed') continue
         map[normalizeCourseCode(entry.code)] = {
            completed: true,
            grade: entry.grade,
         }
      }
      return map
   }, [progress.courses])

   const onDrill = useCallback(
      (blockId: string) => {
         onPathChange([...path, blockId])
      },
      [path, onPathChange],
   )

   const { nodes, edges } = useMemo(
      () =>
         buildFocusedGraph(program, {
            path,
            onDrill,
            onCourseClick,
            courseStatus,
         }),
      [program, path, onDrill, onCourseClick, courseStatus],
   )

   const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
      if (node.type === FACTION_NODE) {
         const data = node.data as { onDrill?: () => void }
         data.onDrill?.()
      }
      if (node.type === COURSE_LEAF) {
         const data = node.data as { onSelect?: () => void }
         data.onSelect?.()
      }
   }, [])

   const hint =
      path.length === 0
         ? 'Click a category to zoom in'
         : 'Click a chunk to drill deeper · courses open in Explore'

   return (
      <VStack align='stretch' gap={3} flex={1} minH={0}>
         <HStack justify='space-between' align='center' gap={3} flexWrap='wrap'>
            <Breadcrumbs program={program} path={path} onPathChange={onPathChange} />
            <Text fontSize='xs' color='fg.muted'>
               {hint}
            </Text>
         </HStack>

         <Box
            flex={1}
            minH={0}
            borderWidth='thin'
            borderRadius='lg'
            overflow='hidden'
            bg='bg'
         >
            <ReactFlow
               nodes={nodes}
               edges={edges}
               nodeTypes={nodeTypes}
               onNodeClick={onNodeClick}
               fitView
               minZoom={0.2}
               maxZoom={1.5}
               proOptions={{ hideAttribution: true }}
               colorMode={colorMode === 'dark' ? 'dark' : 'light'}
            >
               <Background color={backgroundColor} gap={20} size={1} />
               <Controls showInteractive={false} />
               <FitViewOnChange nodeCount={nodes.length} pathKey={pathKey} />
            </ReactFlow>
         </Box>
      </VStack>
   )
}

export function MajorMapGraph(props: MajorMapGraphProps) {
   return (
      <ReactFlowProvider>
         <GraphCanvas {...props} />
      </ReactFlowProvider>
   )
}
