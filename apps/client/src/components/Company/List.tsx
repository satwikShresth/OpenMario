import { Box, Skeleton, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from '@tanstack/react-router';
import { Card } from './Card';
import { useCompanyList } from './listStore';

export function List() {
   const companies = useCompanyList(s => s.companies);
   const isLoading = useCompanyList(s => s.isLoading);
   const navigate = useNavigate();

   if (isLoading) {
      return (
         <VStack gap={3}>
            {Array.from({ length: 5 }).map((_, i) => (
               <Skeleton key={i} height='100px' borderRadius='lg' width='100%' />
            ))}
         </VStack>
      );
   }
   if (companies.length === 0) {
      return (
         <Box textAlign='center' py={16}>
            <Text fontSize='lg' color='fg.muted'>No companies found</Text>
         </Box>
      );
   }
   return (
      <VStack gap={3} align='stretch'>
         {companies.map(company => (
            <Card
               key={company.company_id}
               company={company}
               onClick={() =>
                  navigate({ to: '/companies/$company_id', params: { company_id: company.company_id } })
               }
            />
         ))}
      </VStack>
   );
}
