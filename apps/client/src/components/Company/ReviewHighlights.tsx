import { Box, Button, Flex, Grid, HStack, Skeleton, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowRightIcon } from '@/components/icons';
import { orpc } from '@/helpers/rpc.ts';
import { ReviewCard } from './helpers';
import { useCompanyDetail } from './detailStore';

function HighlightReview({
   sort,
   label,
}: {
   sort: 'rating_desc' | 'rating_asc' | 'year_desc';
   label: string;
}) {
   const company_id = useCompanyDetail(s => s.company_id);
   const { data, isLoading } = useQuery(
      orpc.companies.getCompanyReviews.queryOptions({
         input: { params: { company_id }, query: { sort, pageSize: 1, pageIndex: 1 } },
         staleTime: 60_000,
      })
   );
   const review = data?.data?.[0];
   if (isLoading) return <Skeleton height='160px' borderRadius='xl' />;
   if (!review || (!review.best_features && !review.challenges)) return null;
   return (
      <Box>
         <Text fontSize='xs' fontWeight='semibold' color='fg.muted' mb={2} letterSpacing='wide'>
            {label}
         </Text>
         <ReviewCard review={review} truncate />
      </Box>
   );
}

export function ReviewHighlights() {
   const company_id = useCompanyDetail(s => s.company_id);
   const totalReviews = useCompanyDetail(s => s.company?.total_reviews ?? 0);
   const isLoading = useCompanyDetail(s => s.isLoading);

   if (isLoading || !company_id) return null;

   return (
      <Box>
         <Flex justify='space-between' align='center' mb={5}>
            <Box>
               <Text fontWeight='semibold' fontSize='xl'>Review Highlights</Text>
               <Text fontSize='sm' color='fg.muted' mt={0.5}>{totalReviews} total reviews</Text>
            </Box>
            <Link to='/companies/$company_id/reviews' params={{ company_id }}>
               <Button variant='outline' size='sm'>
                  <HStack gap={2}>
                     <Text>View all reviews</Text>
                     <ArrowRightIcon size={14} />
                  </HStack>
               </Button>
            </Link>
         </Flex>
         <Grid templateColumns={{ base: '1fr', md: 'repeat(3,1fr)' }} gap={4}>
            <HighlightReview sort='rating_desc' label='⭐ TOP RATED' />
            <HighlightReview sort='year_desc' label='🕐 MOST RECENT' />
            <HighlightReview sort='rating_asc' label='⚡ MOST CRITICAL' />
         </Grid>
      </Box>
   );
}
