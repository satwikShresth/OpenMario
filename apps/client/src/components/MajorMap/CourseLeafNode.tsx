import { Box, Text, VStack } from '@chakra-ui/react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { TONE_COLORS } from '@/lib/major-map'
import type { CourseLeafData } from './majorMapLayout'
import { COURSE_H, COURSE_W } from './majorMapLayout'

export default function CourseLeafNode({ data }: NodeProps<Node<CourseLeafData>>) {
   const tone = TONE_COLORS[data.tone]
   const completed = !!data.completed

   return (
      <Box
         w={`${COURSE_W}px`}
         minH={`${COURSE_H}px`}
         borderRadius='md'
         borderWidth='1.5px'
         borderColor={completed ? tone.border : 'border'}
         bg={completed ? tone.bg : 'bg'}
         _dark={{ bg: completed ? tone.bgDark : 'bg' }}
         px={2.5}
         py={2}
         textAlign='left'
         cursor='pointer'
         boxShadow='xs'
         className='nodrag nopan'
         transition='border-color 0.15s ease, transform 0.15s ease'
         role='button'
         tabIndex={0}
         _hover={{
            borderColor: tone.border,
            transform: 'translateY(-1px)',
         }}
         onClick={e => {
            e.stopPropagation()
            data.onSelect()
         }}
         onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
               e.preventDefault()
               e.stopPropagation()
               data.onSelect()
            }
         }}
      >
         <Handle type='target' position={Position.Left} style={{ opacity: 0.35 }} />
         <Handle type='source' position={Position.Right} style={{ opacity: 0.35 }} />
         <VStack align='stretch' gap={0.5}>
            <Text
               fontWeight='semibold'
               fontSize='xs'
               color={tone.fg}
               _dark={{ color: tone.fgDark }}
               textDecoration={completed ? 'line-through' : undefined}
            >
               {data.code}
               {data.credits != null ? ` · ${data.credits}` : ''}
               {data.grade ? ` · ${data.grade}` : ''}
            </Text>
            <Text fontSize='2xs' color='fg.muted' lineClamp={2} lineHeight='short'>
               {data.title}
            </Text>
         </VStack>
      </Box>
   )
}
