import { Image, Box, Card as CCard, Flex, Text } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { WarningIcon } from '@/components/icons';
import type { CompanyListItem } from './types';

const omegaMeta = (score: number | null) => {
   if (score === null) return { color: 'gray.400', label: 'N/A' };
   if (score >= 70) return { color: 'green.500', label: `${score}` };
   if (score >= 50) return { color: 'yellow.500', label: `${score}` };
   return { color: 'red.500', label: `${score}` };
};

function ScorePill({ label, value }: { label: string; value: number | null }) {
   return (
      <Box textAlign='center'>
         <Text fontSize='sm' fontWeight='semibold' color={value == null ? 'fg.subtle' : 'fg'}>
            {value != null ? `${value}%` : '—'}
         </Text>
         <Text fontSize='xs' color='fg.muted' whiteSpace='nowrap'>{label}</Text>
      </Box>
   );
}

export function Card({ company, onClick }: { company: CompanyListItem; onClick: () => void }) {
   const omega = omegaMeta(company.omega_score);
   return (
      <CCard.Root
         variant='outline'
         borderRadius='xl'
         cursor='pointer'
         onClick={onClick}
         _hover={{ boxShadow: 'lg', borderColor: 'border.emphasized', transform: 'translate(-2px, -2px)' }}
         transition='transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease'
      >
         <CCard.Body py={5} px={5} minH='100px'>
            <Flex align='center' gap={5}>
               {/* Omega score */}
               <Flex
                  direction='column'
                  align='center'
                  justify='center'
                  flexShrink={0}
                  gap={0.5}
                  position='relative'
                  w='64px'
               >
                  <Text fontSize='2xl' fontWeight='bold' color={omega.color} lineHeight='1'>
                     {omega.label}
                  </Text>
                  <Image src='/omegascore-logo.png' alt='OMΩ' h='18px' />
                  {company.total_reviews < 5 && (
                     <Tooltip content='Limited data — omΩ score is based on fewer than 5 reviews and may not be representative'>
                        <Box position='absolute' top='-6px' right='-8px' color='orange.400' cursor='help'>
                           <WarningIcon size={12} />
                        </Box>
                     </Tooltip>
                  )}
               </Flex>

               {/* Main content */}
               <Flex direction='column' flex={1} minW={0} gap={3}>
                  {/* Name + meta */}
                  <Flex align='baseline' gap={3} wrap='wrap'>
                     <Text fontSize='lg' fontWeight='semibold' lineClamp={1} minW={0}>
                        {company.company_name}
                     </Text>
                     <Text fontSize='sm' color='fg.muted' flexShrink={0}>
                        {company.total_reviews} {company.total_reviews === 1 ? 'review' : 'reviews'}
                        {' · '}
                        {company.positions_reviewed} {company.positions_reviewed === 1 ? 'position' : 'positions'}
                     </Text>
                  </Flex>

                  {/* Score pills */}
                  <Flex gap={5} align='center'>
                     <ScorePill label='Satisfaction' value={company.satisfaction_score} />
                     <ScorePill label='Trust' value={company.trust_score} />
                     <ScorePill label='Integrity' value={company.integrity_score} />
                     <ScorePill label='Growth' value={company.growth_score} />
                     <ScorePill label='Work-Life' value={company.work_life_score} />
                  </Flex>
               </Flex>
            </Flex>
         </CCard.Body>
      </CCard.Root>
   );
}
