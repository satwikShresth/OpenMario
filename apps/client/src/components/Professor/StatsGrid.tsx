import { Box, Grid, Skeleton, Stat } from '@chakra-ui/react';
import { useProfessorDetail } from './detailStore';

export function StatsGrid() {
   const prof = useProfessorDetail(s => s.prof);
   const isLoading = useProfessorDetail(s => s.isLoading);

   if (isLoading || !prof) {
      return (
         <Grid templateColumns={{ base: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }} gap={4}>
            {Array.from({ length: 4 }).map((_, i) => (
               <Skeleton key={i} height='96px' borderRadius='xl' />
            ))}
         </Grid>
      );
   }
   return (
      <Grid templateColumns={{ base: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }} gap={4}>
         {[
            { label: 'No of Ratings', value: prof.num_ratings ?? 0 },
            { label: 'Sections Taught', value: prof.total_sections_taught },
            { label: 'Courses Taught', value: prof.total_courses_taught },
            { label: 'Terms Active', value: prof.total_terms_active },
         ].map(({ label, value }) => (
            <Box key={label} borderWidth='2px' borderColor='border' borderRadius='xl' p={{ base: 4, md: 5 }} boxShadow='xs'>
               <Stat.Root>
                  <Stat.Label fontSize='sm' color='fg.muted'>
                     {label}
                  </Stat.Label>
                  <Stat.ValueText fontSize={{ base: 'lg', md: '2xl' }} fontWeight='bold' mt={1}>
                     {value}
                  </Stat.ValueText>
               </Stat.Root>
            </Box>
         ))}
      </Grid>
   );
}
