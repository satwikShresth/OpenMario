import {
   Badge,
   EmptyState,
   Flex,
   HStack,
   Icon,
   List,
   Spinner,
   Table,
   Text,
   useDialog,
   VStack,
} from '@chakra-ui/react';
import { useSearch } from '@tanstack/react-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useInfiniteHits } from 'react-instantsearch';
import type { SubmissionDocument } from '@openmario/meilisearch';
import type { SubmissionListItem, SubmissionQuery } from '@openmario/contracts';
import { Link } from '@tanstack/react-router';
import { EmptyIcon, SortAscIcon, SortDescIcon, SortIcon } from '@/components/icons';
import { Tooltip } from '@/components/ui/tooltip.jsx';
import DataTableDialog from './Dialog';
import { dedupeSubmissions, toSubmissionListItem } from '../helpers';

export default function MeiliBody() {
   const query = useSearch({ from: '/salary' });
   const dialog = useDialog();
   const [submission, setSubmission] = useState<SubmissionListItem | null>(null);
   const { items, showMore, isLastPage } = useInfiniteHits<SubmissionDocument>();

   const rows = useMemo(
      () =>
         dedupeSubmissions(
            items.map(toSubmissionListItem),
            query?.distinct ?? true
         ),
      [items, query?.distinct]
   );

   const showMoreRef = useRef(showMore);
   const isLastPageRef = useRef(isLastPage);
   showMoreRef.current = showMore;
   isLastPageRef.current = isLastPage;

   const observerRef = useRef<IntersectionObserver | null>(null);
   const sentinelCallbackRef = useCallback((el: HTMLDivElement | null) => {
      if (el) {
         observerRef.current = new IntersectionObserver(entries => {
            entries.forEach(entry => {
               if (entry.isIntersecting && !isLastPageRef.current) {
                  showMoreRef.current();
               }
            });
         });
         observerRef.current.observe(el);
      } else {
         observerRef.current?.disconnect();
         observerRef.current = null;
      }
   }, []);

   const SortableColumnHeader = useCallback(({
      label,
      value,
      textAlign = 'start',
      display = { base: 'table-cell', md: 'table-cell' },
   }: {
      label: string;
      value: NonNullable<SubmissionQuery['sortField']>;
      textAlign?: 'start' | 'center' | 'end';
      display?: Record<string, string>;
   }) => (
      <Table.ColumnHeader textAlign={textAlign} display={display}>
         <Link
            //@ts-expect-error tanstack router search updater
            search={(prev) => {
               const sort: 'ASC' | 'DESC' = (prev?.sortField === value)
                  ? (prev?.sort === 'DESC') ? 'ASC' : 'DESC'
                  : 'DESC';
               return { ...prev, sort, sortField: value };
            }}
         >
            <HStack justify='space-between'>
               {label}
               <Tooltip
                  content={(query?.sortField === value)
                     ? (query?.sort === 'ASC') ? 'ASC' : 'DESC'
                     : 'SORT'}
               >
                  <Icon size='sm'>
                     {(query?.sortField === value)
                        ? (query?.sort === 'ASC') ? <SortAscIcon /> : <SortDescIcon />
                        : <SortIcon />}
                  </Icon>
               </Tooltip>
            </HStack>
         </Link>
      </Table.ColumnHeader>
   ), [query?.sort, query?.sortField]);

   return (
      <Flex direction='column' overflow='auto' w='full' mt={4}>
         <Table.Root
            tableLayout={rows.length === 0 ? 'fixed' : 'auto'}
            variant='outline'
            interactive
            borderRadius='xl'
         >
            <Table.Header>
               <Table.Row>
                  <SortableColumnHeader label='Company' value='company' />
                  <SortableColumnHeader label='Position' value='position' />
                  <SortableColumnHeader
                     label='Location'
                     value='location'
                     display={{ base: 'none', md: 'table-cell' }}
                  />
                  <SortableColumnHeader
                     label='Year'
                     value='year'
                     display={{ base: 'none', md: 'table-cell' }}
                  />
                  <SortableColumnHeader label='Salary' value='compensation' />
                  <SortableColumnHeader
                     label='Coop'
                     display={{ base: 'none', md: 'table-cell' }}
                     value='coop'
                  />
                  <Table.ColumnHeader display={{ base: 'none', md: 'table-cell' }}>
                     Cycle
                  </Table.ColumnHeader>
                  <Table.ColumnHeader display={{ base: 'none', md: 'table-cell' }}>
                     Program Level
                  </Table.ColumnHeader>
               </Table.Row>
            </Table.Header>
            <Table.Body columnWidth='10px'>
               {rows.length > 0
                  ? rows.map((row, index) => (
                     <Table.Row
                        key={`${row.company}-${row.position}-${row.compensation}-${index}`}
                        cursor='pointer'
                        onClick={() => {
                           setSubmission(row);
                           dialog.setOpen(true);
                        }}
                     >
                        <Table.Cell>
                           <Text lineClamp={2}>{row.company || 'N/A'}</Text>
                        </Table.Cell>
                        <Table.Cell>
                           <Text lineClamp={2}>{row.position || 'N/A'}</Text>
                        </Table.Cell>
                        <Table.Cell display={{ base: 'none', md: 'table-cell' }}>
                           {`${row.location_city}, ${row.location_state_code}` || 'N/A'}
                        </Table.Cell>
                        <Table.Cell display={{ base: 'none', md: 'table-cell' }}>
                           {row.year || 'N/A'}
                        </Table.Cell>
                        <Table.Cell textAlign='end'>
                           {row.compensation
                              ? (
                                 <Text fontWeight='semibold' color='green.600'>
                                    ${row.compensation.toLocaleString()}/hr
                                 </Text>
                              )
                              : 'N/A'}
                        </Table.Cell>
                        <Table.Cell display={{ base: 'none', md: 'table-cell' }}>
                           {row.coop_year || 'N/A'}
                        </Table.Cell>
                        <Table.Cell display={{ base: 'none', md: 'table-cell' }}>
                           {row.coop_cycle
                              ? (
                                 <Badge size='lg' colorPalette='blue' variant='subtle'>
                                    {row.coop_cycle}
                                 </Badge>
                              )
                              : 'N/A'}
                        </Table.Cell>
                        <Table.Cell display={{ base: 'none', md: 'table-cell' }}>
                           {row.program_level || 'N/A'}
                        </Table.Cell>
                     </Table.Row>
                  ))
                  : (
                     <Table.Row>
                        <Table.Cell colSpan={8} py={100} width='full'>
                           <EmptyState.Root>
                              <EmptyState.Content>
                                 <EmptyState.Indicator>
                                    <EmptyIcon />
                                 </EmptyState.Indicator>
                                 <VStack textAlign='center'>
                                    <EmptyState.Title>No results found</EmptyState.Title>
                                    <EmptyState.Description>
                                       Try adjusting your search
                                    </EmptyState.Description>
                                 </VStack>
                                 <List.Root variant='marker'>
                                    <List.Item>Try removing filters</List.Item>
                                    <List.Item>Try different keywords</List.Item>
                                 </List.Root>
                              </EmptyState.Content>
                           </EmptyState.Root>
                        </Table.Cell>
                     </Table.Row>
                  )}
            </Table.Body>
         </Table.Root>

         <Flex ref={sentinelCallbackRef} justify='center' py={4}>
            {!isLastPage && <Spinner size='sm' color='fg.muted' />}
            {isLastPage && rows.length > 0 && (
               <Text fontSize='sm' color='fg.subtle'>
                  All {rows.length} entries loaded
               </Text>
            )}
         </Flex>

         <DataTableDialog dialog={dialog} submission={submission} />
      </Flex>
   );
}
