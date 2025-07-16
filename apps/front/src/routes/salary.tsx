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
import * as z from 'zod/mini';
import { HiFilter } from 'react-icons/hi';
import { Salary } from '@/components/Salary';
import { useQuery } from '@tanstack/react-query';
import { getV1SubmissionsOptions } from '@/client';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { coopCycle, coopYear, programLevel, zodCheckUnique } from '@/helpers';

const submissionSearchSchema = z.object({
   pageIndex: z.catch(z._default(z.coerce.number(), 1).check(z.minimum(1)), 1),
   pageSize: z.catch(
      z._default(z.coerce.number(), 10).check(z.minimum(10), z.maximum(50)),
      10,
   ),
   company: z.catch(
      z.optional(
         z
            .array(z.string())
            .check(z.minLength(1), z.maxLength(5), zodCheckUnique),
      ),
      undefined,
   ),
   position: z.catch(
      z.optional(
         z
            .array(z.string())
            .check(z.minLength(1), z.maxLength(5), zodCheckUnique),
      ),
      undefined,
   ),
   location: z.catch(
      z.optional(
         z
            .array(z.string())
            .check(z.minLength(1), z.maxLength(5), zodCheckUnique),
      ),
      undefined,
   ),
   year: z.catch(
      z._default(
         z.optional(
            z.array(
               z.coerce.number()
                  .check(z.maximum(new Date().getFullYear()), z.minimum(2005)),
            )
               .check(z.minLength(2), z.maxLength(2), zodCheckUnique),
         ),
         [2005, new Date().getFullYear()],
      ),
      [2005, new Date().getFullYear()],
   ),
   coop_cycle: z.catch(
      z.optional(z.array(z.enum(coopCycle)).check(zodCheckUnique)),
      undefined,
   ),
   coop_year: z.catch(
      z.optional(z.array(z.enum(coopYear)).check(zodCheckUnique)),
      undefined,
   ),
   program_level: z.catch(
      z._default(z.optional(z.enum(programLevel)), 'Undergraduate'),
      'Undergraduate',
   ),
   distinct: z.catch(z._default(z.coerce.boolean(), true), true),
});

export type SubmissionSearch = z.infer<typeof submissionSearchSchema>;

export const Route = createFileRoute('/salary')({
   validateSearch: submissionSearchSchema,
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
               <Salary.Root Route={Route}>
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
                           <Salary.ReportSalaryMenu />

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
                     <Salary.DataTable.Filters open={isFilterOpen} onClose={closeFilter} />
                     <Salary.DataTable.Body data={data?.data!} count={data?.data.length!} />
                     <Salary.DataTable.Pagination count={data?.count!} />
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
