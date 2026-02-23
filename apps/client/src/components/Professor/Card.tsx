import { Badge, Box, Card, Flex, HStack, Separator, Stack, Text } from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import type { ProfessorListItem } from './types';

const ratingMeta = (rating: number | null) => {
   if (rating === null) return { color: 'gray.400', label: '—' };
   if (rating >= 4) return { color: 'green.500', label: `${rating}` };
   if (rating >= 3) return { color: 'yellow.500', label: `${rating}` };
   return { color: 'red.500', label: `${rating}` };
};

export function ProfessorCard({ prof, onClick }: { prof: ProfessorListItem; onClick: () => void }) {
   const rating = ratingMeta(prof.avg_rating);
   return (
      <Card.Root
         variant='outline'
         borderRadius='xl'
         _hover={{ shadow: 'md', borderColor: 'colorPalette.400' }}
         cursor='pointer'
         transition='all 0.15s'
         onClick={onClick}
      >
         <Card.Body py={5} px={6}>
            <Stack
               direction={{ base: 'column', md: 'row' }}
               align={{ base: 'stretch', md: 'center' }}
               gap={5}
            >
               <Flex direction='column' align='center' justify='center' minW='64px' gap={0.5}>
                  <HStack gap={1} align='baseline'>
                     <Text fontSize='2xl' fontWeight='bold' color={rating.color} lineHeight='1'>
                        {rating.label}
                     </Text>
                     {prof.avg_rating != null && <FiStar size={12} color={rating.color} />}
                  </HStack>
                  <Text fontSize='xs' color='fg.muted' letterSpacing='wide'>RATING</Text>
               </Flex>
               <Separator orientation='vertical' height='56px' display={{ base: 'none', md: 'block' }} />
               <Box flex={1} minW={0}>
                  <Text fontSize='lg' fontWeight='semibold' lineClamp={1}>{prof.instructor_name}</Text>
                  <Text fontSize='sm' color='fg.muted' mb={1}>{prof.department ?? 'Unknown Department'}</Text>
                  {prof.subjects_taught && prof.subjects_taught.length > 0 && (
                     <HStack gap={1} wrap='wrap'>
                        {prof.subjects_taught.slice(0, 5).map(s => (
                           <Badge key={s} size='sm' variant='surface' colorPalette='blue'>{s}</Badge>
                        ))}
                        {prof.subjects_taught.length > 5 && (
                           <Badge size='sm' variant='surface' colorPalette='gray'>
                              +{prof.subjects_taught.length - 5}
                           </Badge>
                        )}
                     </HStack>
                  )}
               </Box>
               <Separator orientation='vertical' height='56px' display={{ base: 'none', md: 'block' }} />
               <Flex gap={5} wrap='wrap' justify={{ base: 'flex-start', md: 'flex-end' }}>
                  {[
                     { label: 'Difficulty', value: prof.avg_difficulty != null ? prof.avg_difficulty : '—' },
                     { label: 'Ratings', value: prof.num_ratings ?? 0 },
                     { label: 'Sections', value: prof.total_sections_taught },
                     { label: 'Courses', value: prof.total_courses_taught },
                  ].map(({ label, value }) => (
                     <Box key={label} textAlign='center' minW='56px'>
                        <Text fontSize='sm' fontWeight='semibold'>{value}</Text>
                        <Text fontSize='xs' color='fg.muted'>{label}</Text>
                     </Box>
                  ))}
               </Flex>
            </Stack>
         </Card.Body>
      </Card.Root>
   );
}
