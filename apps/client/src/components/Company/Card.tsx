import { Box, Card as CCard, Flex, Grid, Text } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { WarningIcon } from '@/components/icons';
import type { CompanyListItem } from './types';

const omegaMeta = (score: number | null) => {
   if (score === null) return { color: 'gray.400', label: 'N/A' };
   if (score >= 70) return { color: 'green.500', label: `${score}` };
   if (score >= 50) return { color: 'yellow.500', label: `${score}` };
   return { color: 'red.500', label: `${score}` };
};

const DIMENSIONS: {
   key: keyof Pick<
      CompanyListItem,
      | 'satisfaction_score'
      | 'trust_score'
      | 'integrity_score'
      | 'growth_score'
      | 'work_life_score'
   >;
   label: string;
}[] = [
   { key: 'satisfaction_score', label: 'Satisfaction' },
   { key: 'trust_score', label: 'Trust' },
   { key: 'integrity_score', label: 'Integrity' },
   { key: 'growth_score', label: 'Growth' },
   { key: 'work_life_score', label: 'Work-life' },
];

function fmtPct(v: number | null) {
   return v != null ? `${v}%` : '—';
}

export function Card({ company, onClick }: { company: CompanyListItem; onClick: () => void }) {
   const omega = omegaMeta(company.omega_score);

   return (
      <CCard.Root
         variant='outline'
         borderRadius='md'
         cursor='pointer'
         onClick={onClick}
         borderColor='border.subtle'
         w='full'
         boxShadow='none'
         _hover={{
            borderColor: 'border.emphasized',
            transform: 'none',
            boxShadow: 'none',
         }}
         transition='border-color 120ms ease'
      >
         <CCard.Body
            py={{ base: 4, md: 5 }}
            pl={{ base: 7, md: 9 }}
            pr={{ base: 5, md: 6 }}
         >
            <Flex align='center' gap={{ base: 4, md: 5 }} minH={{ base: 'auto', md: '56px' }}>
               {/* Ω score */}
               <Flex
                  direction='column'
                  align='center'
                  justify='center'
                  flexShrink={0}
                  w={{ base: '44px', sm: '52px' }}
                  position='relative'
               >
                  <Text
                     fontSize={{ base: '2xl', md: '3xl' }}
                     fontWeight='bold'
                     color={omega.color}
                     lineHeight='1'
                     fontVariantNumeric='tabular-nums'
                  >
                     {omega.label}
                  </Text>
                  <Text fontSize='xs' color='fg.muted' mt={0.5} letterSpacing='0.08em'>
                     OMΩ
                  </Text>
                  {company.total_reviews < 5 && (
                     <Tooltip content='Limited data — omΩ score is based on fewer than 5 reviews and may not be representative'>
                        <Box position='absolute' top='-4px' right='-6px' color='orange.400' cursor='help'>
                           <WarningIcon size={10} />
                        </Box>
                     </Tooltip>
                  )}
               </Flex>

               <Box borderLeftWidth='1px' borderColor='border.subtle' alignSelf='stretch' flexShrink={0} />

               <Flex direction='column' flex={1} minW={0} gap={3}>
                  <Box minW={0}>
                     <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight='semibold' lineClamp={1}>
                        {company.company_name}
                     </Text>
                     <Text fontSize='xs' color='fg.muted'>
                        {company.total_reviews} reviews · {company.positions_reviewed} positions
                     </Text>
                  </Box>

                  <Grid
                     as='ul'
                     templateColumns={{ base: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' }}
                     gap={{ base: 3, md: 4 }}
                     listStyleType='none'
                     m={0}
                     p={0}
                     w='full'
                  >
                     {DIMENSIONS.map(({ key, label }) => {
                        const value = company[key];
                        return (
                           <Flex key={key} as='li' direction='column' minW={0}>
                              <Text fontSize='xs' color='fg.subtle' fontWeight='medium' lineClamp={1}>
                                 {label}
                              </Text>
                              <Text
                                 fontSize='sm'
                                 fontWeight='semibold'
                                 color={value == null ? 'fg.subtle' : 'fg'}
                                 fontVariantNumeric='tabular-nums'
                                 lineHeight='1.3'
                              >
                                 {fmtPct(value)}
                              </Text>
                           </Flex>
                        );
                     })}
                  </Grid>
               </Flex>
            </Flex>
         </CCard.Body>
      </CCard.Root>
   );
}
