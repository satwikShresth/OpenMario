import { Box, Grid, Skeleton, Stat } from '@chakra-ui/react';
import { useProfessorDetail } from './detailStore';

export function StatsGrid() {
   const prof = useProfessorDetail(s => s.prof);
   const isLoading = useProfessorDetail(s => s.isLoading);

   if (isLoading || !prof) {
      return (
         <Grid templateColumns={{ base: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }} gap={3}>
            {Array.from({ length: 4 }).map((_, i) => (
               <Skeleton key={i} height='80px' borderRadius='lg' />
            ))}
         </Grid>
      );
   }
   return (
      <Grid templateColumns={{ base: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }} gap={3}>
         {[
            { label: 'No of Ratings', value: prof.num_ratings ?? 0 },
            { label: 'Sections Taught', value: prof.total_sections_taught },
            { label: 'Courses Taught', value: prof.total_courses_taught },
            { label: 'Terms Active', value: prof.total_terms_active },
         ].map(({ label, value }) => (
            <Box key={label} borderWidth='2px' borderColor='border' borderRadius='xl' p={4} boxShadow='xs'>
               <Stat.Root>
                  <Stat.Label fontSize='xs'>{label}</Stat.Label>
                  <Stat.ValueText fontSize='xl'>{value}</Stat.ValueText>
               </Stat.Root>
            </Box>
         ))}
      </Grid>
   );
}
