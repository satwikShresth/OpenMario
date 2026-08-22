import { Box, Text } from '@chakra-ui/react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { ChoiceNodeData } from './majorMapLayout'
import { CHOICE_H } from './majorMapLayout'

export default function ChoiceNode({ data }: NodeProps<Node<ChoiceNodeData>>) {
   const isPick = data.label.startsWith('Pick')

   return (
      <Box
         minW={isPick ? '72px' : '56px'}
         h={`${CHOICE_H}px`}
         px={2}
         borderRadius='full'
         borderWidth='2px'
         borderColor={isPick ? 'cyan.500' : 'orange.400'}
         bg={isPick ? 'cyan.50' : 'orange.50'}
         _dark={{
            bg: isPick ? 'cyan.950' : 'orange.950',
            borderColor: isPick ? 'cyan.400' : 'orange.300',
         }}
         display='flex'
         alignItems='center'
         justifyContent='center'
         className='nodrag nopan'
      >
         <Handle type='target' position={Position.Left} style={{ opacity: 0.4 }} />
         <Handle type='source' position={Position.Right} style={{ opacity: 0.4 }} />
         <Text
            fontSize='2xs'
            fontWeight='bold'
            color={isPick ? 'cyan.700' : 'orange.600'}
            _dark={{ color: isPick ? 'cyan.200' : 'orange.200' }}
            whiteSpace='nowrap'
         >
            {data.label}
         </Text>
      </Box>
   )
}
