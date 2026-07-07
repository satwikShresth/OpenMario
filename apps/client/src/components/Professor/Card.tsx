import { Badge, Box, Card, Flex, Grid, HStack, Separator, Span, Text } from '@chakra-ui/react';
import { StarIcon } from '@/components/icons';
import type { ProfessorListItem } from './types';

const ratingMeta = (rating: number | null) => {
   if (rating === null) return { color: 'gray.400', label: '—' };
   if (rating >= 4) return { color: 'green.500', label: `${rating}` };
   if (rating >= 3) return { color: 'yellow.500', label: `${rating}` };
   return { color: 'red.500', label: `${rating}` };
};

/** Easier (green) → harder (red), aligned with professor detail badges */
const difficultyValueColor = (diff: number | null) => {
   if (diff == null) return 'fg.muted';
   if (diff <= 2.5) return 'green.500';
   if (diff <= 3.5) return 'yellow.500';
   return 'red.500';
};

type StatRow = {
   label: string;
   value: string | number;
   /** When set, used for the stat value `Text` (e.g. difficulty heat map) */
   valueColor?: string;
};

const STATS = (prof: ProfessorListItem): StatRow[] => [
   {
      label: 'Difficulty',
      value: prof.avg_difficulty != null ? Number(prof.avg_difficulty).toFixed(1) : '—',
      valueColor: difficultyValueColor(prof.avg_difficulty),
   },
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
         borderRadius='md'
         cursor='pointer'
         onClick={onClick}
         borderColor='border.subtle'
         w='full'
         boxShadow='none'
         _hover={{
            borderColor: 'border.emphasized',
            transform: 'none',
            boxShadow: 'none',
         }}
         transition='border-color 120ms ease'
      >
         <Card.Body
            py={{ base: 4, md: 5 }}
            pl={{ base: 7, md: 9 }}
            pr={{ base: 5, md: 6 }}
         >
            {/* Desktop: grid distributes stat columns across remaining width */}
            <Grid
               display={{ base: 'none', md: 'grid' }}
               templateColumns='auto 1px minmax(0, 1.4fr) repeat(4, minmax(3.5rem, 1fr))'
               gap={5}
               alignItems='center'
               w='full'
            >
               <HStack gap={2} align='center'>
                  <Text
                     fontSize='4xl'
                     fontWeight='bold'
                     color={rating.color}
                     lineHeight='1'
                     fontVariantNumeric='tabular-nums'
                  >
                     {rating.label}
                  </Text>
                  <Span color={rating.color} display='flex'>
                     <StarIcon size={20} fill='currentColor' />
                  </Span>
               </HStack>

               <Box borderLeftWidth='1px' borderColor='border.subtle' alignSelf='stretch' />

               <Box minW={0}>
                  <Text fontSize='xl' fontWeight='semibold' lineClamp={1}>
                     {prof.name}
                  </Text>
                  <Text fontSize='sm' color='fg.muted' mb={1} truncate>
                     {prof.department ?? 'Unknown Department'}
                  </Text>
                  {(() => {
                     const subjects = (prof.subjects_taught ?? []).filter((s): s is string => Boolean(s?.trim()));
                     if (subjects.length === 0) return null;
                     return (
                        <HStack gap={1.5} wrap='wrap'>
                           {subjects.slice(0, 4).map(s => (
                              <Badge key={s} size='md' variant='surface' colorPalette='blue'>
                                 {s}
                              </Badge>
                           ))}
                           {subjects.length > 4 && (
                              <Badge size='md' variant='surface' colorPalette='gray'>
                                 +{subjects.length - 4}
                              </Badge>
                           )}
                        </HStack>
                     );
                  })()}
               </Box>

               {stats.map(({ label, value, valueColor }) => (
                  <Box key={label} textAlign='center' minW={0}>
                     <Text
                        fontSize='md'
                        fontWeight='semibold'
                        fontVariantNumeric='tabular-nums'
                        color={valueColor ?? 'fg'}
                     >
                        {value}
                     </Text>
                     <Text fontSize='sm' color='fg.muted' lineClamp={1}>
                        {label}
                     </Text>
                  </Box>
               ))}
            </Grid>

            {/* Mobile: stacked rating + identity, stats in footer row */}
            <Flex display={{ base: 'flex', md: 'none' }} align='center' gap={4}>
               <HStack gap={2} align='center' flexShrink={0}>
                  <Text
                     fontSize='3xl'
                     fontWeight='bold'
                     color={rating.color}
                     lineHeight='1'
                     fontVariantNumeric='tabular-nums'
                  >
                     {rating.label}
                  </Text>
                  <Span color={rating.color} display='flex'>
                     <StarIcon size={20} fill='currentColor' />
                  </Span>
               </HStack>

               <Separator orientation='vertical' alignSelf='stretch' />

               <Box minW={0} flex={1}>
                  <Text fontSize='lg' fontWeight='semibold' lineClamp={1}>
                     {prof.name}
                  </Text>
                  <Text fontSize='sm' color='fg.muted' mb={1} truncate>
                     {prof.department ?? 'Unknown Department'}
                  </Text>
                  {(() => {
                     const subjects = (prof.subjects_taught ?? []).filter((s): s is string => Boolean(s?.trim()));
                     if (subjects.length === 0) return null;
                     return (
                        <HStack gap={1.5} wrap='wrap'>
                           {subjects.slice(0, 4).map(s => (
                              <Badge key={s} size='md' variant='surface' colorPalette='blue'>
                                 {s}
                              </Badge>
                           ))}
                           {subjects.length > 4 && (
                              <Badge size='md' variant='surface' colorPalette='gray'>
                                 +{subjects.length - 4}
                              </Badge>
                           )}
                        </HStack>
                     );
                  })()}
               </Box>
            </Flex>

            <Flex
               display={{ base: 'flex', md: 'none' }}
               gap={0}
               mt={4}
               pt={4}
               borderTopWidth='1px'
               borderColor='border.subtle'
               justify='space-around'
            >
               {stats.map(({ label, value, valueColor }) => (
                  <Box key={label} textAlign='center' px={1}>
                     <Text
                        fontSize='md'
                        fontWeight='semibold'
                        fontVariantNumeric='tabular-nums'
                        color={valueColor ?? 'fg'}
                     >
                        {value}
                     </Text>
                     <Text fontSize='sm' color='fg.muted'>
                        {label}
                     </Text>
                  </Box>
               ))}
            </Flex>
         </Card.Body>
      </Card.Root>
   );
}
