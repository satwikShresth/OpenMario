import {
   Badge,
   Box,
   Container,
   Flex,
   Input,
   Skeleton,
   Table,
   Text,
   VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { orpc } from '@/helpers/rpc.ts';
import { omegaColorPalette } from '@/components/Company/helpers';
import { useMemo, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiChevronRight } from 'react-icons/fi';

export const Route = createFileRoute('/companies/$company_id/positions')({
   beforeLoad: () => ({ getLabel: () => 'Positions' }),
   component: AllPositionsPage,
});

type SortKey = 'position_name' | 'omega_score' | 'total_reviews' | 'avg_rating_overall' | 'avg_compensation' | 'most_recent_posting_year';

function AllPositionsPage() {
   const { company_id } = Route.useParams();
   const navigate = useNavigate();

   const [search, setSearch] = useState('');
   const [sortKey, setSortKey] = useState<SortKey>('omega_score');
   const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

   const { data: companyData, isLoading } = useQuery(
      orpc.companies.getCompany.queryOptions({ input: { company_id }, staleTime: 30_000 })
   );

   const allPositions = companyData?.positions ?? [];

   const sorted = useMemo(() => {
      const filtered = search.trim()
         ? allPositions.filter(p =>
            p.position_name.toLowerCase().includes(search.toLowerCase())
         )
         : allPositions;

      return [...filtered].sort((a, b) => {
         const av = a[sortKey] ?? (sortDir === 'desc' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY);
         const bv = b[sortKey] ?? (sortDir === 'desc' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY);
         if (typeof av === 'string' && typeof bv === 'string') {
            return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
         }
         return sortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
      });
   }, [allPositions, search, sortKey, sortDir]);

   function toggleSort(key: SortKey) {
      if (sortKey === key) {
         setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
      } else {
         setSortKey(key);
         setSortDir('desc');
      }
   }

   function SortIcon({ col }: { col: SortKey }) {
      if (sortKey !== col) return null;
      return sortDir === 'asc' ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />;
   }

   const headerCell = (label: string, col: SortKey, align?: 'right') => (
      <Table.ColumnHeader
         cursor='pointer'
         userSelect='none'
         onClick={() => toggleSort(col)}
         textAlign={align}
         _hover={{ color: 'fg' }}
         color={sortKey === col ? 'fg' : 'fg.muted'}
         fontWeight={sortKey === col ? 'semibold' : 'normal'}
         whiteSpace='nowrap'
      >
         <Flex align='center' gap={1} justify={align === 'right' ? 'flex-end' : 'flex-start'}>
            {label} <SortIcon col={col} />
         </Flex>
      </Table.ColumnHeader>
   );

   return (
      <Container maxW='5xl' py={10}>
         <VStack align='stretch' gap={8}>

            <Flex justify='space-between' align='center' wrap='wrap' gap={4}>
               <Box>
                  <Text fontSize='2xl' fontWeight='bold'>All Positions</Text>
                  {!isLoading && (
                     <Text fontSize='sm' color='fg.muted' mt={0.5}>
                        {sorted.length} of {allPositions.length} positions
                     </Text>
                  )}
               </Box>
               <Input
                  placeholder='Search positions…'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  width={{ base: 'full', md: '260px' }}
                  size='sm'
                  borderRadius='lg'
               />
            </Flex>

            {isLoading ? (
               <VStack gap={2}>
                  {Array.from({ length: 8 }).map((_, i) => (
                     <Skeleton key={i} height='52px' borderRadius='md' width='100%' />
                  ))}
               </VStack>
            ) : sorted.length === 0 ? (
               <Box textAlign='center' py={16}>
                  <Text color='fg.muted'>No positions match your search</Text>
               </Box>
            ) : (
               <Box borderWidth='thin' borderRadius='xl' overflow='hidden'>
                  <Table.Root size='sm'>
                     <Table.Header>
                        <Table.Row bg='bg.subtle'>
                           {headerCell('Position', 'position_name')}
                           {headerCell('Ω Score', 'omega_score', 'right')}
                           {headerCell('Reviews', 'total_reviews', 'right')}
                           {headerCell('Avg Rating', 'avg_rating_overall', 'right')}
                           {headerCell('Avg Comp', 'avg_compensation', 'right')}
                           {headerCell('Last Posted', 'most_recent_posting_year', 'right')}
                           <Table.ColumnHeader width='40px' />
                        </Table.Row>
                     </Table.Header>
                     <Table.Body>
                        {sorted.map(pos => (
                           <Table.Row
                              key={pos.position_id}
                              cursor='pointer'
                              _hover={{ bg: 'bg.subtle' }}
                              transition='background 0.1s'
                              onClick={() =>
                                 navigate({
                                    to: '/companies/$company_id/$position_id',
                                    params: { company_id, position_id: pos.position_id },
                                 })
                              }
                           >
                              <Table.Cell maxW='280px'>
                                 <Text fontWeight='medium' fontSize='sm' lineClamp={1}>
                                    {pos.position_name}
                                 </Text>
                              </Table.Cell>
                              <Table.Cell textAlign='right'>
                                 {pos.omega_score != null ? (
                                    <Badge
                                       colorPalette={omegaColorPalette(pos.omega_score)}
                                       variant='subtle'
                                       size='sm'
                                    >
                                       {pos.omega_score}
                                    </Badge>
                                 ) : (
                                    <Text color='fg.subtle' fontSize='sm'>—</Text>
                                 )}
                              </Table.Cell>
                              <Table.Cell textAlign='right'>
                                 <Text fontSize='sm'>{pos.total_reviews}</Text>
                              </Table.Cell>
                              <Table.Cell textAlign='right'>
                                 <Text fontSize='sm' color={pos.avg_rating_overall == null ? 'fg.subtle' : 'fg'}>
                                    {pos.avg_rating_overall != null
                                       ? `${Number(pos.avg_rating_overall).toFixed(2)}`
                                       : '—'}
                                 </Text>
                              </Table.Cell>
                              <Table.Cell textAlign='right'>
                                 <Text fontSize='sm' color={pos.avg_compensation == null ? 'fg.subtle' : 'fg'}>
                                    {pos.avg_compensation != null
                                       ? `$${Number(pos.avg_compensation).toLocaleString()}`
                                       : '—'}
                                 </Text>
                              </Table.Cell>
                              <Table.Cell textAlign='right'>
                                 <Text fontSize='sm' color={pos.most_recent_posting_year == null ? 'fg.subtle' : 'fg'}>
                                    {pos.most_recent_posting_year ?? '—'}
                                 </Text>
                              </Table.Cell>
                              <Table.Cell textAlign='right' px={3}>
                                 <FiChevronRight size={14} color='var(--chakra-colors-fg-subtle)' />
                              </Table.Cell>
                           </Table.Row>
                        ))}
                     </Table.Body>
                  </Table.Root>
               </Box>
            )}
         </VStack>
      </Container>
   );
}
