import { Box, Text, VStack } from '@chakra-ui/react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { ProgramNodeData } from './majorMapLayout'
import { PROGRAM_H, PROGRAM_W } from './majorMapLayout'

export default function ProgramRootNode({
   data,
}: NodeProps<Node<ProgramNodeData>>) {
   return (
      <Box
         w={`${PROGRAM_W}px`}
         minH={`${PROGRAM_H}px`}
         borderRadius='xl'
         borderWidth='2px'
         borderColor='teal.600'
         bg='teal.50'
         _dark={{ bg: 'teal.950', borderColor: 'teal.400' }}
         px={4}
         py={3}
         boxShadow='md'
         className='nodrag nopan'
      >
         <Handle type='source' position={Position.Right} style={{ opacity: 0.45 }} />
         <VStack align='stretch' gap={0.5} justify='center' h='full'>
            <Text
               fontSize='2xs'
               fontWeight='semibold'
               color='teal.700'
               _dark={{ color: 'teal.200' }}
               textTransform='uppercase'
               letterSpacing='wider'
            >
               {data.degree}
            </Text>
            <Text fontWeight='bold' fontSize='md' color='fg' lineHeight='short'>
               {data.name}
            </Text>
            <Text fontSize='xs' color='fg.muted'>
               {data.totalCredits} total credits
            </Text>
         </VStack>
      </Box>
   )
}
