import { Box, Text, VStack } from '@chakra-ui/react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { TONE_COLORS } from '@/lib/major-map'
import type { BucketNodeData } from './majorMapLayout'
import { BUCKET_H, BUCKET_W } from './majorMapLayout'

export default function BucketNode({ data }: NodeProps<Node<BucketNodeData>>) {
   const tone = TONE_COLORS[data.tone]

   return (
      <Box
         w={`${BUCKET_W}px`}
         minH={`${BUCKET_H}px`}
         borderRadius='xl'
         borderWidth='2px'
         borderStyle='dashed'
         borderColor={tone.border}
         bg={tone.bg}
         _dark={{ bg: tone.bgDark }}
         px={4}
         py={3}
         className='nodrag nopan'
      >
         <Handle type='target' position={Position.Left} style={{ opacity: 0.4 }} />
         <VStack align='stretch' gap={1} justify='center' h='full'>
            <Text
               fontWeight='bold'
               fontSize='sm'
               color={tone.fg}
               _dark={{ color: tone.fgDark }}
               lineHeight='short'
            >
               {data.title}
               {data.credits != null ? ` · ${data.credits} cr` : ''}
            </Text>
            {data.notes && (
               <Text fontSize='xs' color='fg.muted' lineClamp={3}>
                  {data.notes}
               </Text>
            )}
         </VStack>
      </Box>
   )
}
