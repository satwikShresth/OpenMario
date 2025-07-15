import * as z from "zod/mini";
import { Box, Container, VStack } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/Salary";
import { getV1SubmissionsOptions } from "@/client";
import { useQuery } from "@tanstack/react-query";
import { coopCycle, coopYear, programLevel, zodCheckUnique } from "@/helpers";

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
      z._default(z.optional(z.enum(programLevel)), "Undergraduate"),
      "Undergraduate",
   ),
   distinct: z.catch(z._default(z.coerce.boolean(), true), true),
});

export type SubmissionSearch = z.infer<typeof submissionSearchSchema>;

export const Route = createFileRoute("/home")({
   validateSearch: submissionSearchSchema,
   loaderDeps: ({ search }) => search,
   loader: ({ deps: query, context: { queryClient } }) =>
      queryClient.ensureQueryData(getV1SubmissionsOptions({ query })),
   component: App,
});

export type Route = typeof Route;

function App() {
   const query = Route.useSearch();
   const { data } = useQuery({
      ...getV1SubmissionsOptions({ query }),
      staleTime: 3000,
      refetchOnWindowFocus: true,
   });
   return (
      <Container>
         <VStack align="center">
            <Box maxW="85%">
               <DataTable.Root Route={Route}>
                  <DataTable.Filters />
                  <DataTable.Body data={data?.data!} count={data?.count!} />
                  <DataTable.Pagination count={data?.count!} />
                  <DataTable.Footer />
               </DataTable.Root>
            </Box>
         </VStack>
      </Container>
   );
}
