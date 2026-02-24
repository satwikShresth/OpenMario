import { Box, Flex, Skeleton, Stat } from '@chakra-ui/react';
import { useCompanyDetail } from './detailStore';

export function StatsGrid() {
   const company = useCompanyDetail(s => s.company);
   const isLoading = useCompanyDetail(s => s.isLoading);

   if (isLoading || !company) {
      return (
         <Flex wrap='wrap' gap={4}>
            {Array.from({ length: 6 }).map((_, i) => (
               <Skeleton key={i} height='96px' borderRadius='xl' flex='1 1 140px' minW={0} />
            ))}
         </Flex>
      );
   }
   const stats = [
      {
         label: 'Avg Rating',
         value: company.avg_rating_overall != null
            ? `${Number(company.avg_rating_overall).toFixed(2)} / 4`
            : 'N/A',
      },
      {
         label: 'Would Recommend',
         value: company.pct_would_recommend != null ? `${company.pct_would_recommend}%` : 'N/A',
      },
      { label: 'Avg Days / Week', value: company.avg_days_per_week ?? 'N/A' },
      {
         label: 'Overtime Required',
         value: company.pct_overtime_required != null ? `${company.pct_overtime_required}%` : 'N/A',
      },
      {
         label: 'Avg Compensation',
         value: company.avg_compensation != null
            ? `$${Number(company.avg_compensation).toLocaleString()}`
            : 'N/A',
      },
      {
         label: 'Median Compensation',
         value: company.median_compensation != null
            ? `$${Number(company.median_compensation).toLocaleString()}`
            : 'N/A',
      },
   ];
   return (
      <Flex wrap='wrap' gap={4}>
         {stats.map(({ label, value }) => (
            <Box
               key={label}
               borderWidth='2px'
               borderColor='border'
               borderRadius='xl'
               p={4}
               boxShadow='xs'
               flex='1 1 140px'
               minW={0}
            >
               <Stat.Root>
                  <Stat.Label fontSize='sm' color='fg.muted'>{label}</Stat.Label>
                  <Stat.ValueText fontSize={{ base: 'lg', md: '2xl' }} fontWeight='bold' mt={1}>
                     {value}
                  </Stat.ValueText>
               </Stat.Root>
            </Box>
         ))}
      </Flex>
   );
}
