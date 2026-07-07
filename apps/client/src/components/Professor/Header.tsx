import { Badge, Box, Flex, HStack, Skeleton, Text, VStack } from '@chakra-ui/react';
import { ExternalLinkIcon, StarIcon } from '@/components/icons';
import { useProfessorDetail } from './detailStore';

const ratingColor = (rating: number | null) => {
   if (rating === null) return 'gray';
   if (rating >= 4) return 'green';
   if (rating >= 3) return 'yellow';
   return 'red';
};

const ratingHex = (rating: number | null) => {
   if (rating === null) return '#9CA3AF';
   if (rating >= 4) return '#22C55E';
   if (rating >= 3) return '#EAB308';
   return '#EF4444';
};

const difficultyColor = (diff: number | null) => {
   if (diff === null) return 'gray';
   if (diff <= 2.5) return 'green';
   if (diff <= 3.5) return 'yellow';
   return 'red';
};

export function Header() {
   const prof = useProfessorDetail(s => s.prof);
   const isLoading = useProfessorDetail(s => s.isLoading);

   if (isLoading || !prof) {
      return (
         <VStack align='stretch' gap={3}>
            <Skeleton height='44px' width='min(100%, 320px)' />
            <Skeleton height='24px' width='220px' />
         </VStack>
      );
   }
   return (
      <Flex justify='space-between' align='flex-start' wrap='wrap' gap={4}>
         <Box>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight='bold' lineHeight='1.2'>
               {prof.name}
            </Text>
            <Text fontSize={{ base: 'md', md: 'lg' }} color='fg.muted' mt={1}>
               {prof.department ?? 'Unknown Department'}
            </Text>
            <HStack gap={2} mt={3} flexWrap='wrap'>
               {prof.avg_rating != null && (
                  <Badge colorPalette={ratingColor(prof.avg_rating)} variant='subtle' px={3} py={1.5}>
                     <HStack gap={1}>
                        <StarIcon size={14} />
                        <Text fontSize='sm'>{prof.avg_rating} / 5 rating</Text>
                     </HStack>
                  </Badge>
               )}
               {prof.avg_difficulty != null && (
                  <Badge colorPalette={difficultyColor(prof.avg_difficulty)} variant='subtle' px={3} py={1.5}>
                     <Text fontSize='sm'>Difficulty: {prof.avg_difficulty} / 5</Text>
                  </Badge>
               )}
               {prof.rmp_legacy_id != null && (
                  <a
                     href={`https://www.ratemyprofessors.com/professor/${prof.rmp_legacy_id}`}
                     target='_blank'
                     rel='noopener noreferrer'
                     style={{ textDecoration: 'none' }}
                  >
                     <Badge variant='outline' px={3} py={1.5} cursor='pointer'>
                        <HStack gap={1}>
                           <Text fontSize='sm'>Rate My Professors</Text>
                           <ExternalLinkIcon size={13} />
                        </HStack>
                     </Badge>
                  </a>
               )}
            </HStack>
         </Box>
         {prof.avg_rating != null && (
            <Box
               textAlign='center'
               p={{ base: 4, md: 5 }}
               borderRadius='xl'
               borderWidth='2px'
               borderColor='border'
               minW='112px'
               boxShadow='sm'
            >
               <Text
                  fontSize={{ base: '3xl', md: '4xl' }}
                  fontWeight='extrabold'
                  color={ratingHex(prof.avg_rating)}
                  lineHeight='1'
                  fontVariantNumeric='tabular-nums'
               >
                  {prof.avg_rating}
               </Text>
               <Text fontSize='sm' color='fg.muted' letterSpacing='widest' mt={1.5}>
                  / 5 RATING
               </Text>
            </Box>
         )}
      </Flex>
   );
}
