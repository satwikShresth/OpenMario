import { Box, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import {
   Background,
   Controls,
   ReactFlow,
   ReactFlowProvider,
   useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useColorMode, useColorModeValue } from '@/components/ui/color-mode';
import CourseGraphNode from './CourseGraphNode';
import LogicGraphNode from './LogicGraphNode';
import { COURSE_NODE_TYPE, LOGIC_NODE_TYPE, type CourseGraphMode } from './prerequisiteGraphUtils';
import { useCourseGraph } from './useCourseGraph';

const nodeTypes = {
   [COURSE_NODE_TYPE]: CourseGraphNode,
   [LOGIC_NODE_TYPE]: LogicGraphNode
};

type PrerequisiteGraphProps = {
   course_id: string;
   mode?: CourseGraphMode;
};

function FitViewOnChange({ nodeCount }: { nodeCount: number }) {
   const { fitView } = useReactFlow();

   useEffect(() => {
      if (nodeCount === 0) return;
      const frame = requestAnimationFrame(() => {
         fitView({ padding: 0.2, duration: 200 });
      });
      return () => cancelAnimationFrame(frame);
   }, [fitView, nodeCount]);

   return null;
}

function GraphCanvas({ course_id, mode = 'requirements' }: PrerequisiteGraphProps) {
   const { nodes, edges, isPending, isError, onNodeSelect } = useCourseGraph({
      courseId: course_id,
      mode
   });
   const isVisualizer = mode === 'visualizer';
   const backgroundColor = useColorModeValue('#d4d4d8', '#3f3f46');
   const { colorMode } = useColorMode();

   if (isPending) {
      return (
         <Box
            height='420px'
            borderWidth='thin'
            borderRadius='lg'
            display='flex'
            alignItems='center'
            justifyContent='center'
         >
            <Spinner size='lg' />
         </Box>
      );
   }

   if (isError) {
      return (
         <Box
            height='200px'
            borderWidth='thin'
            borderRadius='lg'
            display='flex'
            alignItems='center'
            justifyContent='center'
            px={4}
         >
            <Text color='fg.muted' textAlign='center'>
               Unable to load course graph.
            </Text>
         </Box>
      );
   }

   if (nodes.length === 0) {
      return (
         <Box
            height='200px'
            borderWidth='thin'
            borderRadius='lg'
            display='flex'
            alignItems='center'
            justifyContent='center'
         >
            <Text color='fg.muted'>No course data to display.</Text>
         </Box>
      );
   }

   return (
      <VStack align='stretch' gap={3}>
         <HStack gap={4} wrap='wrap' fontSize='xs' color='fg.muted'>
            <HStack gap={1}>
               <Box w='3' h='0.5' bg='blue.500' />
               <Text>Prerequisite</Text>
            </HStack>
            <HStack gap={1}>
               <Box w='3' h='0.5' bg='green.500' borderStyle='dashed' />
               <Text>Corequisite</Text>
            </HStack>
            {isVisualizer && (
               <>
                  <HStack gap={1}>
                     <Box w='3' h='0.5' bg='purple.500' />
                     <Text>Required by</Text>
                  </HStack>
                  <Text>Use arrows on nodes to expand prerequisite chains or downstream courses.</Text>
               </>
            )}
            <HStack gap={1}>
               <Box
                  w='8'
                  h='5'
                  borderRadius='full'
                  borderWidth='2px'
                  borderColor='orange.400'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
               >
                  <Text fontSize='8px' fontWeight='bold' color='orange.500'>
                     OR
                  </Text>
               </Box>
               <Text>Pick one</Text>
            </HStack>
            <HStack gap={1}>
               <Box
                  w='8'
                  h='5'
                  borderRadius='full'
                  borderWidth='2px'
                  borderColor='cyan.500'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
               >
                  <Text fontSize='8px' fontWeight='bold' color='cyan.500'>
                     AND
                  </Text>
               </Box>
               <Text>All required</Text>
            </HStack>
            {!isVisualizer && (
               <Text>Click a course to open it. Prerequisites above, corequisites below.</Text>
            )}
         </HStack>

         <Box
            height='480px'
            width='100%'
            borderWidth='thin'
            borderRadius='lg'
            overflow='hidden'
            bg='bg.subtle'
            position='relative'
         >
            <ReactFlow
               nodes={nodes}
               edges={edges}
               nodeTypes={nodeTypes}
               colorMode={colorMode === 'dark' ? 'dark' : 'light'}
               fitView
               fitViewOptions={{ padding: 0.2 }}
               minZoom={0.2}
               maxZoom={1.5}
               nodesDraggable={false}
               nodesConnectable={false}
               nodesFocusable={false}
               elementsSelectable
               onNodeClick={(_, node) => {
                  if (node.type === COURSE_NODE_TYPE) onNodeSelect(node.id);
               }}
               proOptions={{ hideAttribution: true }}
               style={{ width: '100%', height: '100%' }}
            >
               <FitViewOnChange nodeCount={nodes.length} />
               <Background gap={20} size={1} color={backgroundColor} />
               <Controls showInteractive={false} />
            </ReactFlow>
         </Box>
      </VStack>
   );
}

export default function PrerequisiteGraph(props: PrerequisiteGraphProps) {
   return (
      <ReactFlowProvider>
         <GraphCanvas {...props} />
      </ReactFlowProvider>
   );
}
