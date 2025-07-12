import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AsyncSelect, chakraComponents } from 'chakra-react-select';
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
} from '@chakra-ui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useStore } from '@tanstack/react-form';
import * as z from 'zod/mini';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import {
   getAutocompleteCompanyOptions,
   getAutocompletePositionOptions,
   getSubmissionsOptions,
} from '../client/@tanstack/react-query.gen.ts';
import { PaginationLink } from '../components/common/PaginationLink.tsx';

const submissionSearchSchema = z.object({
   pageIndex: z._default(z.coerce.number(), 1).check(z.minimum(1)),
   pageSize: z._default(z.coerce.number(), 10).check(
      z.minimum(10),
      z.maximum(50),
   ),
});

const pageSizes = createListCollection({
   items: ['10', '20', '30', '40', '50'].map((value) => ({
      label: value,
      value,
   })),
});

export const Route = createFileRoute('/home')({
   validateSearch: submissionSearchSchema,
   loaderDeps: ({ search }) => search,
   loader: ({ deps, context: { queryClient } }) =>
      queryClient.ensureQueryData(
         getSubmissionsOptions({ query: { ...deps } }),
      ),
   component: App,
});

const asyncComponents = {
   LoadingIndicator: (props) => (
      <chakraComponents.LoadingIndicator
         // The color palette of the filled in area of the spinner (there is no default)
         colorPalette='gray'
         // The color of the main line which makes up the spinner
         // This could be accomplished using `chakraStyles` but it is also available as a custom prop
         color='currentColor' // <-- This default's to your theme's text color (Light mode: gray.700 | Dark mode: whiteAlpha.900)
         // The color of the remaining space that makes up the spinner
         trackColor='transparent'
         // The `size` prop on the Chakra spinner
         // Defaults to one size smaller than the Select's size
         spinnerSize='md'
         // A CSS <time> variable (s or ms) which determines the time it takes for the spinner to make one full rotation
         animationDuration='500ms'
         // A CSS size string representing the thickness of the spinner's line
         borderWidth='2px'
         {
            // Don't forget to forward the props!
            ...props
         }
      />
   ),
};

interface CompanyOption {
   value: string;
   label: string;
   variant: string;
}

function App() {
   const query = Route.useSearch();
   const queryClient = useQueryClient();
   const navigate = useNavigate({ from: Route.fullPath });

   const form = useForm({
      defaultValues: {
         company: [''],
         position: [''],
      },
      onSubmit: async ({ value }) => {
         console.log(value);
      },
   });

   const { company, position } = useStore(
      form.store,
      (state) => ({ company: state.values.company, position: state.values.position }),
   );

   const { data, error } = useQuery({
      ...getSubmissionsOptions({
         query,
      }),
      // placeholderData: (previousData) => previousData,
      staleTime: 3000,
      refetchOnWindowFocus: false,
   });

   return (
      <Container maxW='container.md' py={10}>
         <VStack align='center'>
            <Box>
               <form>
                  <HStack mb={4}>
                     <form.Field
                        name='company'
                        listeners={{
                           onChange: ({ value }) =>
                              navigate({
                                 search: (prev) => ({
                                    ...prev,
                                    company: value?.map(({ value }) => value),
                                 }),
                                 reloadDocument: false,
                                 replace: true,
                                 startTransition: true,
                              }),
                        }}
                     >
                        {({ state, handleChange, handleBlur }) => (
                           <AsyncSelect
                              isMulti
                              name='company'
                              placeholder='Select a company'
                              value={state?.value}
                              components={asyncComponents}
                              onBlur={handleBlur}
                              onChange={(value) => handleChange(value)}
                              noOptionsMessage={() => 'Keeping typing for autocomplete'}
                              loadOptions={async (inputValue, callback) => {
                                 if (inputValue?.length >= 3) {
                                    callback(
                                       await queryClient.ensureQueryData(
                                          {
                                             ...getAutocompleteCompanyOptions({
                                                query: {
                                                   comp: inputValue,
                                                },
                                             }),
                                          },
                                       ).then(
                                          (values) =>
                                             values
                                                ?.map(({ name }) => (
                                                   {
                                                      value: name!,
                                                      label: name!,
                                                      variant: 'subtle',
                                                   }
                                                )),
                                       ),
                                    );
                                 }
                              }}
                           />
                        )}
                     </form.Field>
                     <form.Field
                        name='position'
                        listeners={{
                           onChange: ({ value }) =>
                              navigate({
                                 search: (prev) => ({
                                    ...prev,
                                    position: value?.map(({ value }) => value),
                                 }),
                                 reloadDocument: false,
                                 replace: true,
                                 startTransition: true,
                              }),
                        }}
                     >
                        {({ state, handleChange, handleBlur }) => (
                           <AsyncSelect
                              isMulti
                              name='position'
                              placeholder='Select a position'
                              value={state?.value}
                              components={asyncComponents}
                              onBlur={handleBlur}
                              onChange={(value) => handleChange(value)}
                              noOptionsMessage={() => 'Keeping typing for autocomplete'}
                              loadOptions={async (inputValue, callback) => {
                                 if (inputValue?.length >= 3) {
                                    callback(
                                       await queryClient.ensureQueryData(
                                          {
                                             ...getAutocompletePositionOptions({
                                                query: {
                                                   comp: '*',
                                                   pos: inputValue,
                                                },
                                             }),
                                          },
                                       ).then(
                                          (values) =>
                                             values
                                                ?.map(({ name }) => (
                                                   {
                                                      value: name!,
                                                      label: name!,
                                                      variant: 'subtle',
                                                   }
                                                )),
                                       ),
                                    );
                                 }
                              }}
                           />
                        )}
                     </form.Field>
                  </HStack>
               </form>
               <Table.Root variant='outline' striped interactive>
                  <Table.Header>
                     <Table.Row>
                        <Table.ColumnHeader>Company</Table.ColumnHeader>
                        <Table.ColumnHeader>Position</Table.ColumnHeader>
                        <Table.ColumnHeader>Location</Table.ColumnHeader>
                        <Table.ColumnHeader>Year</Table.ColumnHeader>
                        <Table.ColumnHeader>Coop Year</Table.ColumnHeader>
                        <Table.ColumnHeader>Coop Cycle</Table.ColumnHeader>
                        <Table.ColumnHeader>Program Level</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign='end'>
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
                                    {row?.company || 'N/A'}
                                 </Table.Cell>
                                 <Table.Cell>
                                    {row?.position || 'N/A'}
                                 </Table.Cell>
                                 <Table.Cell>
                                    {`${row.location_city}, ${row.location_state_code}` ||
                                       'N/A'}
                                 </Table.Cell>
                                 <Table.Cell>{row?.year || 'N/A'}</Table.Cell>
                                 <Table.Cell>
                                    {row?.coop_year || 'N/A'}
                                 </Table.Cell>
                                 <Table.Cell>
                                    {row?.coop_cycle
                                       ? (
                                          <Badge
                                             colorPalette='blue'
                                             variant='subtle'
                                          >
                                             {row?.coop_cycle}
                                          </Badge>
                                       )
                                       : 'N/A'}
                                 </Table.Cell>
                                 <Table.Cell>
                                    {row?.program_level || 'N/A'}
                                 </Table.Cell>
                                 <Table.Cell textAlign='end'>
                                    {row?.compensation
                                       ? (
                                          <Text
                                             fontWeight='semibold'
                                             color='green.600'
                                          >
                                             ${row?.compensation
                                                ?.toLocaleString()}
                                          </Text>
                                       )
                                       : 'N/A'}
                                 </Table.Cell>
                              </Table.Row>
                           ))
                        )
                        : (
                           <Table.Row>
                              <Table.Cell colSpan={8} textAlign='center' py={8}>
                                 <Text color='gray.500'>
                                    No salary data available
                                 </Text>
                              </Table.Cell>
                           </Table.Row>
                        )}
                  </Table.Body>
               </Table.Root>

               <HStack
                  mt={'3'}
                  justifySelf={'center'}
               >
                  <Select.Root
                     collection={pageSizes}
                     width='70px'
                     defaultValue={[String(query.pageSize)]}
                     value={[String(query.pageSize)]}
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
                     pageSize={query.pageSize}
                     page={query.pageIndex}
                     onPageChange={({ page }) => {
                        navigate({
                           search: (prev) => ({ ...prev, pageIndex: page }),
                        });
                     }}
                  >
                     <ButtonGroup variant='ghost' size='sm' wrap='wrap'>
                        <PaginationLink to={Route.path} page='prev'>
                           <LuChevronLeft />
                        </PaginationLink>

                        <Pagination.Items
                           render={(page) => (
                              <PaginationLink
                                 to={Route.path}
                                 page={page.value}
                                 variant={{
                                    base: 'ghost',
                                    _selected: 'outline',
                                 }}
                              >
                                 {page.value}
                              </PaginationLink>
                           )}
                        />

                        <PaginationLink to={Route.path} page='next'>
                           <LuChevronRight />
                        </PaginationLink>
                     </ButtonGroup>
                  </Pagination.Root>
               </HStack>

               <Box mt={4} p={3} bg='gray.50' borderRadius='md'>
                  <Text fontSize='sm' color='gray.600'>
                     Note: All compensation data is self-reported by students.
                  </Text>
               </Box>
            </Box>
         </VStack>
      </Container>
   );
}
