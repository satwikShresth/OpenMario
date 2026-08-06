import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { ChevronRightIcon } from '@/components/icons'
import { TONE_COLORS } from '@/lib/major-map'
import type { FactionNodeData } from './majorMapLayout'
import { FACTION_H, FACTION_W } from './majorMapLayout'

export default function FactionNode({ data }: NodeProps<Node<FactionNodeData>>) {
   const tone = TONE_COLORS[data.tone]

   return (
      <Box
         w={`${FACTION_W}px`}
         minH={`${FACTION_H}px`}
         borderRadius='xl'
         borderWidth='2px'
         borderColor={tone.border}
         bg={tone.bg}
         _dark={{ bg: tone.bgDark }}
         px={4}
         py={3}
         boxShadow='sm'
         className='nodrag nopan'
         cursor={data.drillable ? 'pointer' : 'default'}
         role={data.drillable ? 'button' : undefined}
         tabIndex={data.drillable ? 0 : undefined}
         transition='transform 0.15s ease, box-shadow 0.15s ease'
         _hover={
            data.drillable
               ? { transform: 'translateY(-2px)', boxShadow: 'md' }
               : undefined
         }
         onClick={e => {
            if (!data.drillable || !data.onDrill) return
            e.stopPropagation()
            data.onDrill()
         }}
         onKeyDown={e => {
            if (!data.drillable || !data.onDrill) return
            if (e.key === 'Enter' || e.key === ' ') {
               e.preventDefault()
               e.stopPropagation()
               data.onDrill()
            }
         }}
      >
         <Handle type='target' position={Position.Left} style={{ opacity: 0.4 }} />
         <Handle type='source' position={Position.Right} style={{ opacity: 0.4 }} />
         <VStack align='stretch' gap={1.5} h='full' justify='center'>
            <HStack justify='space-between' align='start' gap={2}>
               <Text
                  fontWeight='bold'
                  fontSize='md'
                  color={tone.fg}
                  _dark={{ color: tone.fgDark }}
                  lineHeight='short'
                  lineClamp={2}
               >
                  {data.title}
               </Text>
               {data.drillable && (
                  <Box color={tone.fg} _dark={{ color: tone.fgDark }} flexShrink={0} mt={0.5}>
                     <ChevronRightIcon size={16} />
                  </Box>
               )}
            </HStack>
            {data.summary && (
               <Text fontSize='xs' color='fg.muted' lineClamp={2} lineHeight='short'>
                  {data.summary}
               </Text>
            )}
            <HStack gap={2} fontSize='2xs' color='fg.muted' pt={0.5}>
               {data.credits != null && <Text>{data.credits} credits</Text>}
               {data.credits != null && data.courseCount != null && <Text>·</Text>}
               {data.courseCount != null && data.courseCount > 0 && (
                  <Text>{data.courseCount} courses</Text>
               )}
            </HStack>
         </VStack>
      </Box>
   )
}
