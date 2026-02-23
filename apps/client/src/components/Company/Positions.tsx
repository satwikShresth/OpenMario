import { Badge, Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRightIcon, ChevronRightIcon } from '@/components/icons';
import { omegaColorPalette } from './helpers';
import { useCompanyDetail } from './detailStore';

export function Positions() {
   const positions = useCompanyDetail(s => s.positions);
   const company_id = useCompanyDetail(s => s.company_id);
   const isLoading = useCompanyDetail(s => s.isLoading);
   const navigate = useNavigate();

   if (isLoading) return null;

   return (
      <Box>
         <Flex justify='space-between' align='center' mb={4}>
            <Box>
               <Text fontWeight='semibold' fontSize='xl'>Positions</Text>
               <Text fontSize='sm' color='fg.muted' mt={0.5}>{positions.length} total</Text>
            </Box>
            {positions.length > 5 && (
               <Link to='/companies/$company_id/positions' params={{ company_id }}>
                  <Button variant='outline' size='sm'>
                     <HStack gap={2}>
                        <Text>View all {positions.length}</Text>
                        <ArrowRightIcon size={14} />
                     </HStack>
                  </Button>
               </Link>
            )}
         </Flex>
         {positions.length === 0 ? (
            <Text color='fg.muted'>No positions found</Text>
         ) : (
            <VStack gap={3} align='stretch'>
               {positions.slice(0, 5).map(pos => (
                  <Box
                     key={pos.position_id}
                     borderWidth='thin'
                     borderRadius='xl'
                     p={5}
                     cursor='pointer'
                     _hover={{ shadow: 'md', borderColor: 'colorPalette.300' }}
                     transition='all 0.15s'
                     onClick={() =>
                        navigate({
                           to: '/companies/$company_id/$position_id',
                           params: { company_id, position_id: pos.position_id },
                        })
                     }
                  >
                     <Flex justify='space-between' align='center' gap={4}>
                        <HStack gap={3} flex={1} minW={0}>
                           <Badge
                              colorPalette={omegaColorPalette(pos.omega_score)}
                              variant='subtle'
                              fontSize='sm'
                              px={3}
                              py={1}
                              borderRadius='lg'
                              flexShrink={0}
                           >
                              Ω {pos.omega_score ?? '—'}
                           </Badge>
                           <Box flex={1} minW={0}>
                              <Text fontWeight='semibold' fontSize='md' lineClamp={1}>{pos.position_name}</Text>
                              <HStack gap={3} mt={0.5} flexWrap='wrap'>
                                 <Text fontSize='sm' color='fg.muted'>
                                    {pos.total_reviews} review{pos.total_reviews !== 1 ? 's' : ''}
                                 </Text>
                                 {pos.avg_compensation != null && (
                                    <Text fontSize='sm' color='fg.muted'>
                                       ${Number(pos.avg_compensation).toLocaleString()} avg comp
                                    </Text>
                                 )}
                                 {pos.most_recent_posting_year != null && (
                                    <Text fontSize='sm' color='fg.muted'>
                                       Last posted {pos.most_recent_posting_year}
                                    </Text>
                                 )}
                              </HStack>
                           </Box>
                        </HStack>
                        <ChevronRightIcon size={18} color='var(--chakra-colors-fg-muted)' />
                     </Flex>
                  </Box>
               ))}
               {positions.length > 5 && (
                  <Link to='/companies/$company_id/positions' params={{ company_id }}>
                     <Box
                        borderWidth='thin'
                        borderRadius='xl'
                        p={4}
                        textAlign='center'
                        _hover={{ bg: 'bg.subtle' }}
                        transition='background 0.15s'
                     >
                        <Text fontSize='sm' color='fg.muted'>
                           +{positions.length - 5} more positions — View all
                        </Text>
                     </Box>
                  </Link>
               )}
            </VStack>
         )}
      </Box>
   );
}
