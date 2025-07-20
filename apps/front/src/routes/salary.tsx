import {
   Box,
   Button,
   Clipboard,
   Container,
   Flex,
   HStack,
   Icon,
   Separator,
   Text,
   useBreakpointValue,
   useDisclosure,
   VStack,
} from '@chakra-ui/react';
import { HiFilter } from 'react-icons/hi';
import { Salary } from '@/components/Salary';
import { useQuery } from '@tanstack/react-query';
import { getV1SubmissionsOptions } from '@/client';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { salarySearchSchema } from './-validator.ts';

export const Route = createFileRoute('/salary')({
   validateSearch: salarySearchSchema,
   loaderDeps: ({ search }) => search,
   loader: ({ deps: query, context: { queryClient } }) =>
      queryClient.ensureQueryData(getV1SubmissionsOptions({ query })),
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
         <Container>
            <VStack align='center'>
               <Salary.Root>
                  <Box maxW='99%'>
                     <Flex justify='space-between' mb={4} mt={4}>
                        {isMobile
                           ? (
                              <Button onClick={openFilter} variant='solid'>
                                 <Icon as={HiFilter} />
                                 <Text>Filters</Text>
                              </Button>
                           )
                           : <Text fontSize='3xl' fontWeight='bolder'>Self Reported Salaries</Text>}

                        <HStack>
                           <Salary.ReportSalaryMenu Route={Route} />

                           <Clipboard.Root value={globalThis.location.href} timeout={1000}>
                              <Clipboard.Trigger asChild>
                                 <Button variant='solid' size='md'>
                                    <Clipboard.Indicator />
                                    <Text>Copy Link</Text>
                                 </Button>
                              </Clipboard.Trigger>
                           </Clipboard.Root>
                        </HStack>
                     </Flex>
                     <Separator mb={4} />
                     <Salary.DataTable.Filters
                        open={isFilterOpen}
                        onClose={closeFilter}
                        Route={Route}
                     />
                     <Salary.DataTable.Body data={data?.data!} count={data?.data.length!} />
                     <Salary.DataTable.Pagination count={data?.count!} Route={Route} />
                     <Salary.DataTable.Footer />
                     <Outlet />
                  </Box>
               </Salary.Root>
            </VStack>
         </Container>
      );
   },
});

export type SalaryRoute = typeof Route;
