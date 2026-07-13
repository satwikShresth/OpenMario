import { Box, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { CourseNodeData } from './prerequisiteGraphUtils';

export default function CourseGraphNode({ data, sourcePosition, targetPosition }: NodeProps<Node<CourseNodeData>>) {
   const source = sourcePosition ?? Position.Bottom;
   const target = targetPosition ?? Position.Top;
   const expandPrereqIcon = source === Position.Bottom ? ChevronUp : ChevronLeft;
   const expandDependentIcon = source === Position.Bottom ? ChevronDown : ChevronRight;
   const PrereqIcon = expandPrereqIcon;
   const DependentIcon = expandDependentIcon;

   return (
      <Box
         borderWidth='2px'
         borderColor={data.isRoot ? 'blue.500' : 'border'}
         borderRadius='lg'
         bg='bg'
         color='fg'
         boxShadow='sm'
         width='190px'
         minH='80px'
         px={3}
         py={2}
         cursor='pointer'
         className='nodrag nopan'
         _hover={{ borderColor: data.isRoot ? 'blue.600' : 'blue.300' }}
      >
         <Handle type='target' position={target} style={{ opacity: 0.5 }} />
         <Handle type='source' position={source} style={{ opacity: 0.5 }} />

         <VStack align='stretch' gap={1}>
            <Text fontWeight='semibold' fontSize='sm' lineClamp={1} color='fg'>
               {data.label}
            </Text>
            <Text fontSize='xs' color='fg.muted' lineClamp={2} minH='2.5em'>
               {data.title}
            </Text>

            {data.showExpansion && (
               <HStack justify='space-between' pt={1}>
                  {!data.expandedPrereqs && (
                     <IconButton
                        aria-label='Expand prerequisites'
                        size='2xs'
                        variant='subtle'
                        colorPalette='blue'
                        loading={data.expandingPrereqs}
                        onClick={event => {
                           event.stopPropagation();
                           data.onExpandPrereqs();
                        }}
                     >
                        <PrereqIcon size={14} />
                     </IconButton>
                  )}

                  <Box flex='1' />

                  {!data.expandedDependents && (
                     <IconButton
                        aria-label='Expand courses that require this course'
                        size='2xs'
                        variant='subtle'
                        colorPalette='purple'
                        loading={data.expandingDependents}
                        onClick={event => {
                           event.stopPropagation();
                           data.onExpandDependents();
                        }}
                     >
                        <DependentIcon size={14} />
                     </IconButton>
                  )}
               </HStack>
            )}
         </VStack>
      </Box>
   );
}
