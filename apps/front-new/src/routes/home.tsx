import * as z from 'zod/mini';
import { Box, Container, VStack } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from '@/components/Salary';
import { getSubmissionsOptions } from '@/client/@tanstack/react-query.gen.ts';
import { useQuery } from '@tanstack/react-query';

const submissionSearchSchema = z.object({
   pageIndex: z._default(z.coerce.number(), 1).check(z.minimum(1)),
   pageSize: z
      ._default(z.coerce.number(), 10)
      .check(
         z.minimum(10),
         z.maximum(50),
      ),
   company: z.catch(
      z.optional(
         z
            .array(z.string())
            .check(z.minLength(1), z.maxLength(5)),
      ),
      undefined,
   ),
   position: z.catch(
      z.optional(
         z
            .array(z.string())
            .check(z.minLength(1), z.maxLength(5)),
      ),
      undefined,
   ),
});

export const Route = createFileRoute('/home')({
   validateSearch: submissionSearchSchema,
   loaderDeps: ({ search }) => search,
   loader: ({ deps: query, context: { queryClient } }) =>
      queryClient.ensureQueryData(
         getSubmissionsOptions({ query }),
      ),
   component: App,
});

export type Route = typeof Route;

function App() {
   const query = Route.useSearch();
   const { data } = useQuery({
      ...getSubmissionsOptions({ query }),
      staleTime: 3000,
      refetchOnWindowFocus: false,
   });
   return (
      <Container maxW='container.md' py={10}>
         <VStack align='center'>
            <Box>
               <DataTable.Root Route={Route}>
                  <DataTable.Filters />
                  <DataTable.Body data={data?.data} count={data?.count} />
                  <DataTable.Pagination count={data?.count} />
                  <DataTable.Footer />
               </DataTable.Root>
            </Box>
         </VStack>
      </Container>
   );
}
