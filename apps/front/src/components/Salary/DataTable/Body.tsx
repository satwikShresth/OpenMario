import { Badge, Box, Flex, Table, Text } from "@chakra-ui/react";
import type { SubmissionListResponse } from "@/client";

export default (
   { data, count }: { data: SubmissionListResponse["data"]; count: number },
) => {
   return (
      <Box overflow="auto" w="full">
         <Table.Root variant="outline" striped interactive borderRadius="2xl">
            <Table.Header>
               <Table.Row>
                  <Table.ColumnHeader>Company</Table.ColumnHeader>
                  <Table.ColumnHeader>Position</Table.ColumnHeader>
                  <Table.ColumnHeader
                     display={{ base: "none", md: "table-cell" }}
                  >
                     Location
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                     display={{ base: "table-cell", md: "table-cell" }}
                  >
                     Year
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                     display={{ base: "none", md: "table-cell" }}
                  >
                     Coop Year
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                     display={{ base: "none", md: "table-cell" }}
                  >
                     Coop Cycle
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                     display={{ base: "none", md: "table-cell" }}
                  >
                     Program Level
                  </Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">
                     Salary
                  </Table.ColumnHeader>
               </Table.Row>
            </Table.Header>
            <Table.Body>
               {count > 0
                  ? (
                     data?.map((row, index) => (
                        <Table.Row key={index}>
                           <Table.Cell>{row?.company || "N/A"}</Table.Cell>
                           <Table.Cell>{row?.position || "N/A"}</Table.Cell>
                           <Table.Cell
                              display={{ base: "none", md: "table-cell" }}
                           >
                              {`${row.location_city}, ${row.location_state_code}` ||
                                 "N/A"}
                           </Table.Cell>
                           <Table.Cell
                              display={{ base: "table-cell", md: "table-cell" }}
                           >
                              {row?.year || "N/A"}
                           </Table.Cell>
                           <Table.Cell
                              display={{ base: "none", md: "table-cell" }}
                           >
                              {row?.coop_year || "N/A"}
                           </Table.Cell>
                           <Table.Cell
                              display={{ base: "none", md: "table-cell" }}
                           >
                              {row?.coop_cycle
                                 ? (
                                    <Badge colorPalette="blue" variant="subtle">
                                       {row?.coop_cycle}
                                    </Badge>
                                 )
                                 : "N/A"}
                           </Table.Cell>
                           <Table.Cell
                              display={{ base: "none", md: "table-cell" }}
                           >
                              {row?.program_level || "N/A"}
                           </Table.Cell>
                           <Table.Cell textAlign="end">
                              {row?.compensation
                                 ? (
                                    <Text
                                       fontWeight="semibold"
                                       color="green.600"
                                    >
                                       ${row?.compensation?.toLocaleString()}
                                    </Text>
                                 )
                                 : "N/A"}
                           </Table.Cell>
                        </Table.Row>
                     ))
                  )
                  : (
                     <Table.Row>
                        <Table.Cell colSpan={8} py={10}>
                           <Flex
                              justify="center"
                              align="center"
                              direction="column"
                           >
                              <Text color="gray.500">
                                 No salary data available
                              </Text>
                           </Flex>
                        </Table.Cell>
                     </Table.Row>
                  )}
            </Table.Body>
         </Table.Root>
      </Box>
   );
};
