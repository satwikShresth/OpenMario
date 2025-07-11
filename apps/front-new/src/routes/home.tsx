import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
   Badge,
   Box,
   ButtonGroup,
   Container,
   createListCollection,
   HStack,
   Pagination,
   Portal,
   Select,
   Table,
   Text,
   VStack,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as z from "zod/mini";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { getSubmissionsOptions } from "../client/@tanstack/react-query.gen.ts";
import { PaginationLink } from "../components/common/PaginationLink.tsx";

const submissionSearchSchema = z.object({
   pageIndex: z._default(z.coerce.number(), 1).check(z.minimum(1)),
   pageSize: z._default(z.coerce.number(), 10).check(
      z.minimum(10),
      z.maximum(50),
   ),
});

const pageSizes = createListCollection({
   items: ["10", "20", "30", "40", "50"].map((value) => ({
      label: value,
      value,
   })),
});

export const Route = createFileRoute("/home")({
   validateSearch: submissionSearchSchema,
   loaderDeps: ({ search }) => search,
   loader: ({ deps, context: { queryClient } }) =>
      queryClient.ensureQueryData(
         getSubmissionsOptions({ query: { ...deps } }),
      ),
   component: App,
});

function App() {
   const { pageSize, pageIndex } = Route.useSearch();
   const navigate = useNavigate({ from: Route.fullPath });
   const queryClient = useQueryClient();
   const { data } = useQuery({
      ...getSubmissionsOptions({
         query: {
            pageIndex,
            pageSize,
         },
      }),
      // placeholderData: (previousData) => previousData,
      staleTime: 3000,
      refetchOnWindowFocus: false,
   });

   console.log(data);

   return (
      <Container maxW="container.md" py={10}>
         <VStack align="center">
            <Box>
               <Table.Root variant="outline" striped interactive>
                  <Table.Header>
                     <Table.Row>
                        <Table.ColumnHeader>Company</Table.ColumnHeader>
                        <Table.ColumnHeader>Position</Table.ColumnHeader>
                        <Table.ColumnHeader>Location</Table.ColumnHeader>
                        <Table.ColumnHeader>Year</Table.ColumnHeader>
                        <Table.ColumnHeader>Coop Year</Table.ColumnHeader>
                        <Table.ColumnHeader>Coop Cycle</Table.ColumnHeader>
                        <Table.ColumnHeader>Program Level</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign="end">
                           Salary
                        </Table.ColumnHeader>
                     </Table.Row>
                  </Table.Header>
                  <Table.Body>
                     {data?.count > 0
                        ? (
                           data?.data?.map((row, index) => (
                              <Table.Row key={index}>
                                 <Table.Cell>
                                    {row?.company || "N/A"}
                                 </Table.Cell>
                                 <Table.Cell>
                                    {row?.position || "N/A"}
                                 </Table.Cell>
                                 <Table.Cell>
                                    {`${row.location_city}, ${row.location_state_code}` ||
                                       "N/A"}
                                 </Table.Cell>
                                 <Table.Cell>{row?.year || "N/A"}</Table.Cell>
                                 <Table.Cell>
                                    {row?.coop_year || "N/A"}
                                 </Table.Cell>
                                 <Table.Cell>
                                    {row?.coop_cycle
                                       ? (
                                          <Badge
                                             colorPalette="blue"
                                             variant="subtle"
                                          >
                                             {row?.coop_cycle}
                                          </Badge>
                                       )
                                       : "N/A"}
                                 </Table.Cell>
                                 <Table.Cell>
                                    {row?.program_level || "N/A"}
                                 </Table.Cell>
                                 <Table.Cell textAlign="end">
                                    {row?.compensation
                                       ? (
                                          <Text
                                             fontWeight="semibold"
                                             color="green.600"
                                          >
                                             ${row?.compensation
                                                ?.toLocaleString()}
                                          </Text>
                                       )
                                       : "N/A"}
                                 </Table.Cell>
                              </Table.Row>
                           ))
                        )
                        : (
                           <Table.Row>
                              <Table.Cell colSpan={8} textAlign="center" py={8}>
                                 <Text color="gray.500">
                                    No salary data available
                                 </Text>
                              </Table.Cell>
                           </Table.Row>
                        )}
                  </Table.Body>
               </Table.Root>

               <HStack
                  mt={"3"}
                  justifySelf={"center"}
               >
                  <Select.Root
                     collection={pageSizes}
                     width="70px"
                     defaultValue={[String(pageSize)]}
                     value={[String(pageSize)]}
                     onValueChange={({ value: [pageSize] }) => {
                        navigate({
                           search: (prev) => ({ ...prev, pageSize }),
                        });
                     }}
                  >
                     <Select.HiddenSelect />
                     <Select.Control>
                        <Select.Trigger>
                           <Select.ValueText />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                           <Select.Indicator />
                        </Select.IndicatorGroup>
                     </Select.Control>
                     <Portal>
                        <Select.Positioner>
                           <Select.Content>
                              {pageSizes.items.map((framework) => (
                                 <Select.Item
                                    item={framework}
                                    key={framework.value}
                                 >
                                    {framework.label}
                                    <Select.ItemIndicator />
                                 </Select.Item>
                              ))}
                           </Select.Content>
                        </Select.Positioner>
                     </Portal>
                  </Select.Root>
                  <Pagination.Root
                     count={data?.count}
                     pageSize={pageSize}
                     page={pageIndex}
                     onPageChange={({ page }) => {
                        navigate({
                           search: (prev) => ({ ...prev, pageIndex: page }),
                        });
                     }}
                  >
                     <ButtonGroup variant="ghost" size="sm" wrap="wrap">
                        <PaginationLink to={Route.path} page="prev">
                           <LuChevronLeft />
                        </PaginationLink>

                        <Pagination.Items
                           render={(page) => (
                              <PaginationLink
                                 to={Route.path}
                                 page={page.value}
                                 variant={{
                                    base: "ghost",
                                    _selected: "outline",
                                 }}
                              >
                                 {page.value}
                              </PaginationLink>
                           )}
                        />

                        <PaginationLink to={Route.path} page="next">
                           <LuChevronRight />
                        </PaginationLink>
                     </ButtonGroup>
                  </Pagination.Root>
               </HStack>

               <Box mt={4} p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">
                     Note: All compensation data is self-reported by students.
                  </Text>
               </Box>
            </Box>
         </VStack>
      </Container>
   );
}
