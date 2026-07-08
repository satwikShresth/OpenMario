import { Box, Text } from '@chakra-ui/react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { LogicNodeData } from './prerequisiteGraphUtils';

export default function LogicGraphNode({ data, sourcePosition, targetPosition }: NodeProps<Node<LogicNodeData>>) {
   const source = sourcePosition ?? Position.Bottom;
   const target = targetPosition ?? Position.Top;
   const isOr = data.operator === 'OR';

   return (
      <Box
         width='64px'
         height='40px'
         borderRadius='full'
         borderWidth='2px'
         borderColor={isOr ? 'orange.400' : 'cyan.500'}
         bg={isOr ? 'orange.50' : 'cyan.50'}
         _dark={{
            bg: isOr ? 'orange.950' : 'cyan.950'
         }}
         display='flex'
         alignItems='center'
         justifyContent='center'
         className='nodrag nopan'
      >
         <Handle type='target' position={target} style={{ opacity: 0.4 }} />
         <Handle type='source' position={source} style={{ opacity: 0.4 }} />
         <Text
            fontSize='xs'
            fontWeight='bold'
            color={isOr ? 'orange.600' : 'cyan.600'}
            _dark={{ color: isOr ? 'orange.200' : 'cyan.200' }}
         >
            {data.operator}
         </Text>
      </Box>
   );
}
