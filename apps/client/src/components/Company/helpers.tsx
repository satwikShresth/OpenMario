import {
   Badge,
   Box,
   Button,
   Card,
   Flex,
   HStack,
   Text,
   VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import type { ReviewItem } from '@openmario/contracts';

export const omegaColorPalette = (s: number | null) =>
   s === null ? 'gray' : s >= 70 ? 'green' : s >= 50 ? 'yellow' : 'red';

export const omegaHex = (s: number | null) =>
   s === null ? '#9CA3AF' : s >= 70 ? '#22C55E' : s >= 50 ? '#EAB308' : '#EF4444';

export const ratingLabel = (v: number | null) => {
   if (v === null) return 'N/A';
   const map: Record<number, string> = {
      1: 'Very Dissatisfied',
      2: 'Dissatisfied',
      3: 'Satisfied',
      4: 'Very Satisfied',
   };
   return `${Number(v).toFixed(2)} — ${map[Math.round(v)] ?? ''}`;
};

export const ratingColorHex = (v: number) =>
   v >= 3 ? '#22C55E' : v >= 2 ? '#EAB308' : '#EF4444';

export const ratingLabelShort = (v: number) => {
   const map: Record<number, string> = {
      1: 'Very Dissatisfied',
      2: 'Dissatisfied',
      3: 'Satisfied',
      4: 'Very Satisfied',
   };
   return map[Math.round(v)] ?? '';
};

export function ReviewCard({
   review,
   showPosition = true,
   truncate = true,
}: {
   review: ReviewItem;
   showPosition?: boolean;
   truncate?: boolean;
}) {
   const [expanded, setExpanded] = useState(false);
   if (!review.best_features && !review.challenges) return null;

   const isLong =
      (review.best_features?.length ?? 0) > 200 ||
      (review.challenges?.length ?? 0) > 200;
   const shouldTruncate = truncate && isLong && !expanded;

   return (
      <Card.Root variant='outline' borderRadius='xl'>
         <Card.Body p={5}>
            <Flex justify='space-between' align='flex-start' mb={3} gap={3} wrap='wrap'>
               <Box>
                  {showPosition && (
                     <Text fontWeight='semibold' fontSize='sm' mb={1}>
                        {review.position_name}
                     </Text>
                  )}
                  <HStack gap={2} flexWrap='wrap'>
                     <Badge size='sm' variant='surface' colorPalette='blue'>
                        {review.coop_cycle}
                     </Badge>
                     <Badge size='sm' variant='surface' colorPalette='gray'>
                        {review.year}
                     </Badge>
                     {review.department && (
                        <Badge size='sm' variant='surface' colorPalette='purple'>
                           {review.department}
                        </Badge>
                     )}
                  </HStack>
               </Box>
               <HStack gap={2} flexShrink={0}>
                  {review.rating_overall != null && (
                     <Badge
                        colorPalette={review.rating_overall >= 3 ? 'green' : 'red'}
                        variant='subtle'
                        size='sm'
                        px={2}
                     >
                        {review.rating_overall}/4
                     </Badge>
                  )}
                  {review.would_recommend != null && (
                     <Badge
                        colorPalette={review.would_recommend ? 'green' : 'orange'}
                        variant='subtle'
                        size='sm'
                     >
                        {review.would_recommend ? '👍 Recommends' : '👎 Does not recommend'}
                     </Badge>
                  )}
               </HStack>
            </Flex>

            <VStack align='stretch' gap={3}>
               {review.best_features && (
                  <Box>
                     <Text fontSize='xs' fontWeight='semibold' color='green.600' mb={1} letterSpacing='wide'>
                        ✦ BEST FEATURES
                     </Text>
                     <Text fontSize='sm' color='fg' lineHeight='1.7' lineClamp={shouldTruncate ? 3 : undefined}>
                        {review.best_features}
                     </Text>
                  </Box>
               )}
               {review.challenges && (
                  <Box>
                     <Text fontSize='xs' fontWeight='semibold' color='orange.600' mb={1} letterSpacing='wide'>
                        ⚠ CHALLENGES
                     </Text>
                     <Text fontSize='sm' color='fg' lineHeight='1.7' lineClamp={shouldTruncate ? 3 : undefined}>
                        {review.challenges}
                     </Text>
                  </Box>
               )}
            </VStack>

            {truncate && isLong && (
               <Button variant='ghost' size='xs' mt={2} onClick={() => setExpanded(e => !e)} color='fg.muted'>
                  {expanded ? 'Show less' : 'Read more'}
               </Button>
            )}
         </Card.Body>
      </Card.Root>
   );
}
