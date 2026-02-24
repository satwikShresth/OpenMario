import { Badge, Box, Card, Flex, HStack, Separator, Span, Text } from '@chakra-ui/react';
import { StarIcon } from '@/components/icons';
import type { ProfessorListItem } from './types';

const ratingMeta = (rating: number | null) => {
   if (rating === null) return { color: 'gray.400', label: '—' };
   if (rating >= 4) return { color: 'green.500', label: `${rating}` };
   if (rating >= 3) return { color: 'yellow.500', label: `${rating}` };
   return { color: 'red.500', label: `${rating}` };
};

const STATS = (prof: ProfessorListItem) => [
   { label: 'Difficulty', value: prof.avg_difficulty != null ? prof.avg_difficulty : '—' },
   { label: 'Ratings', value: prof.num_ratings ?? 0 },
   { label: 'Sections', value: prof.total_sections_taught },
   { label: 'Courses', value: prof.total_courses_taught },
];

export function ProfessorCard({ prof, onClick }: { prof: ProfessorListItem; onClick: () => void }) {
   const rating = ratingMeta(prof.avg_rating);
   const stats = STATS(prof);

   return (
      <Card.Root
         variant='outline'
         borderRadius='xl'
         cursor='pointer'
         onClick={onClick}
         _hover={{ boxShadow: 'lg', borderColor: 'border.emphasized', transform: 'translate(-2px, -2px)' }}
         transition='transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease'
      >
         <Card.Body py={4} px={5}>
            {/* Top row: always horizontal — rating | info | stats */}
            <Flex align='center' gap={4}>
               {/* Rating */}
               <HStack gap={1} align='center' flexShrink={0}>
                  <Text fontSize='xl' fontWeight='bold' color={rating.color} lineHeight='1'>
                     {rating.label}
                  </Text>
                  <Span color={rating.color} display='flex'>
                     <StarIcon size={13} fill='currentColor' />
                  </Span>
               </HStack>

               <Separator orientation='vertical' alignSelf='stretch' />

               {/* Name + department + badges */}
               <Box flex={1} minW={0}>
                  <Text fontSize='md' fontWeight='semibold' lineClamp={1}>{prof.instructor_name}</Text>
                  <Text fontSize='sm' color='fg.muted' mb={1} truncate>{prof.department ?? 'Unknown Department'}</Text>
                  {prof.subjects_taught && prof.subjects_taught.length > 0 && (
                     <HStack gap={1} wrap='wrap'>
                        {prof.subjects_taught.slice(0, 4).map(s => (
                           <Badge key={s} size='sm' variant='surface' colorPalette='blue'>{s}</Badge>
                        ))}
                        {prof.subjects_taught.length > 4 && (
                           <Badge size='sm' variant='surface' colorPalette='gray'>
                              +{prof.subjects_taught.length - 4}
                           </Badge>
                        )}
                     </HStack>
                  )}
               </Box>

               {/* Stats — inline on md+, hidden on small */}
               <Flex gap={4} flexShrink={0} display={{ base: 'none', md: 'flex' }}>
                  <Separator orientation='vertical' alignSelf='stretch' />
                  {stats.map(({ label, value }) => (
                     <Box key={label} textAlign='center' minW='44px'>
                        <Text fontSize='sm' fontWeight='semibold'>{value}</Text>
                        <Text fontSize='xs' color='fg.muted'>{label}</Text>
                     </Box>
                  ))}
               </Flex>
            </Flex>

            {/* Stats row — only on small screens */}
            <Flex
               display={{ base: 'flex', md: 'none' }}
               gap={0}
               mt={3}
               pt={3}
               borderTopWidth='1px'
               borderColor='border.subtle'
               justify='space-around'
            >
               {stats.map(({ label, value }) => (
                  <Box key={label} textAlign='center'>
                     <Text fontSize='sm' fontWeight='semibold'>{value}</Text>
                     <Text fontSize='xs' color='fg.muted'>{label}</Text>
                  </Box>
               ))}
            </Flex>
         </Card.Body>
      </Card.Root>
   );
}
