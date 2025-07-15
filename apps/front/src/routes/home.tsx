import * as z from 'zod/mini';
import {
   Box,
   Button,
   Container,
   Flex,
   Icon,
   Separator,
   Text,
   useBreakpointValue,
   useDisclosure,
   VStack,
} from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { Salary } from '@/components/Salary';
import { getV1SubmissionsOptions } from '@/client';
import { useQuery } from '@tanstack/react-query';
import { coopCycle, coopYear, programLevel, zodCheckUnique } from '@/helpers';
import { HiFilter, HiPlus } from 'react-icons/hi';

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

export const Route = createFileRoute('/home')({
   validateSearch: submissionSearchSchema,
   loaderDeps: ({ search }) => search,
   loader: ({ deps: query, context: { queryClient } }) =>
      queryClient.ensureQueryData(getV1SubmissionsOptions({ query })),
   component: App,
});

export type Route = typeof Route;

function App() {
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
            <Box maxW='99%'>
               <Salary.Root Route={Route}>
                  <Flex justify='space-between' mb={4}>
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
                  <Separator mb={3} />
                  <Salary.DataTable.Filters open={isFilterOpen} onClose={closeFilter} />
                  <Salary.DataTable.Body data={data?.data!} count={data?.data.length!} />
                  <Salary.DataTable.Pagination count={data?.count!} />
                  <Salary.DataTable.Footer />
               </Salary.Root>
            </Box>
         </VStack>
      </Container>
   );
}
