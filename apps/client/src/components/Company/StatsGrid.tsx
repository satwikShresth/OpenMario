import { Box, Grid, Skeleton, Stat } from '@chakra-ui/react';
import { useCompanyDetail } from './detailStore';

export function StatsGrid() {
   const company = useCompanyDetail(s => s.company);
   const isLoading = useCompanyDetail(s => s.isLoading);

   if (isLoading || !company) {
      return (
         <Grid templateColumns={{ base: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(6,1fr)' }} gap={4}>
            {Array.from({ length: 6 }).map((_, i) => (
               <Skeleton key={i} height='96px' borderRadius='xl' />
            ))}
         </Grid>
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
      <Grid templateColumns={{ base: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(6,1fr)' }} gap={4}>
         {stats.map(({ label, value }) => (
            <Box key={label} borderWidth='thin' borderRadius='xl' p={5}>
               <Stat.Root>
                  <Stat.Label fontSize='sm' color='fg.muted'>{label}</Stat.Label>
                  <Stat.ValueText fontSize='2xl' fontWeight='bold' mt={1}>{value}</Stat.ValueText>
               </Stat.Root>
            </Box>
         ))}
      </Grid>
   );
}
