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
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { salarySearchSchema } from './-validator.ts';
import { useMobile } from '@/hooks';
import { orpc } from '@/helpers/rpc.ts';
import z from 'zod';

export const Route = createFileRoute('/salary')({
   validateSearch: z.optional(salarySearchSchema),
   component: () => {
      const query = Route.useSearch();
      const isMobile = useMobile();
      const { open: isFilterOpen, onOpen: openFilter, onClose: closeFilter } = useDisclosure();
      const { data } = useQuery(
         orpc.submission.list.queryOptions({
            input: query!,
            staleTime: 3000,
            refetchOnWindowFocus: true,
            placeholderData: keepPreviousData,
         })
      );

      const rows = data?.data ?? [];
      const count = data?.count ?? 0;

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
                           <Salary.ReportSalaryMenu />

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
                     />
                     <Box m={2} />
                     {isMobile ? null : <Salary.DataTable.Pagination count={count} />}
                     <Salary.DataTable.Body
                        data={rows}
                        count={rows.length}
                     />
                     <Salary.DataTable.Pagination count={count} />
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
