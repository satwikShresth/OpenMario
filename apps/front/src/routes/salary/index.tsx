import {
   Box,
   Button,
   Flex,
   Icon,
   Separator,
   Text,
   useBreakpointValue,
   useDisclosure,
} from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { Salary } from '@/components/Salary';
import { getV1SubmissionsOptions } from '@/client';
import { useQuery } from '@tanstack/react-query';
import { HiFilter } from 'react-icons/hi';

export const Route = createFileRoute('/salary/')({
   component: () => {
      const query = Route.useSearch();
      const isMobile = useBreakpointValue({ base: true, md: false });
      const { open: isFilterOpen, onOpen: openFilter, onClose: closeFilter } = useDisclosure();
      const { data } = useQuery({
         ...getV1SubmissionsOptions({ query }),
         staleTime: 3000,
         refetchOnWindowFocus: true,
      });

      return (
         <Box maxW='99%'>
            <Salary.Root Route={Route}>
               <Flex justify='space-between' mb={4} mt={4}>
                  {isMobile
                     ? (
                        <Button onClick={openFilter} variant='solid' mb={4}>
                           <Icon as={HiFilter} />
                           <Text>Filters</Text>
                        </Button>
                     )
                     : <Text fontSize='3xl' fontWeight='bolder'>Self Reported Salaries</Text>}
                  <Salary.Menu />
               </Flex>
               <Separator mb={4} />
               <Salary.DataTable.Filters open={isFilterOpen} onClose={closeFilter} />
               <Salary.DataTable.Body data={data?.data!} count={data?.data.length!} />
               <Salary.DataTable.Pagination count={data?.count!} />
               <Salary.DataTable.Footer />
            </Salary.Root>
         </Box>
      );
   },
});
