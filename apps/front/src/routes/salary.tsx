import {
   Box,
   Button,
   Clipboard,
   Container,
   Flex,
   HStack,
   Icon,
   IconButton,
   Separator,
   Text,
   useDisclosure,
   VStack,
} from '@chakra-ui/react';
import { HiFilter } from 'react-icons/hi';
import { Salary } from '@/components/Salary';
import { useQuery } from '@tanstack/react-query';
import { getV1SubmissionsOptions } from '@/client';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { salarySearchSchema } from './-validator.ts';
import { useMobile } from '@/hooks';

export const Route = createFileRoute('/salary')({
   validateSearch: salarySearchSchema,
   loaderDeps: ({ search }) => search,
   loader: ({ deps: query, context: { queryClient } }) =>
      queryClient.ensureQueryData(getV1SubmissionsOptions({ query })),
   component: () => {
      const query = Route.useSearch();
      const isMobile = useMobile();
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
                  <Box>
                     <Flex justify='space-between' mb={2} mt={10}>
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

                           {isMobile
                              ? null
                              : (
                                 <Clipboard.Root value={globalThis.location.href} timeout={1000}>
                                    <Clipboard.Trigger asChild>
                                       <IconButton variant='solid'>
                                          <Clipboard.Indicator />
                                       </IconButton>
                                    </Clipboard.Trigger>
                                 </Clipboard.Root>
                              )}
                        </HStack>
                     </Flex>

                     {isMobile ? null : <Separator mb={5} />}
                     <Salary.DataTable.Filters
                        open={isFilterOpen}
                        onClose={closeFilter}
                        Route={Route}
                     />
                     <Box m={2} />
                     {isMobile
                        ? null
                        : <Salary.DataTable.Pagination count={data?.count!} Route={Route} />}
                     <Salary.DataTable.Body
                        Route={Route}
                        data={data?.data!}
                        count={data?.data.length!}
                     />
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
