import { Image, Box, Flex, Separator, Stack, Text } from '@chakra-ui/react';
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
      <Box textAlign='center' minW='64px'>
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
      <Stack
         as='button'
         textAlign='left'
         borderWidth='thin'
         borderRadius='xl'
         p={5}
         px={6}
         direction={{ base: 'column', md: 'row' }}
         align={{ base: 'stretch', md: 'center' }}
         gap={5}
         cursor='pointer'
         _hover={{ shadow: 'md', borderColor: 'colorPalette.400' }}
         transition='all 0.15s'
         onClick={onClick}
         width='full'
      >
         <Flex direction='column' align='center' justify='center' minW='72px' gap={0.5} position='relative'>
            <Text fontSize='2xl' fontWeight='bold' color={omega.color} lineHeight='1'>{omega.label}</Text>
            <Image src='/omegascore-logo.png' alt='OMΩ' h='16px' />
            {company.total_reviews < 5 && (
               <Tooltip content='Limited data — omΩ score is based on fewer than 5 reviews and may not be representative'>
                  <Box position='absolute' top='-6px' right='-10px' color='orange.400' cursor='help'>
                     <WarningIcon size={13} />
                  </Box>
               </Tooltip>
            )}
         </Flex>
         <Separator orientation='vertical' height='56px' display={{ base: 'none', md: 'block' }} />
         <Box flex={1} minW={0}>
            <Text fontSize='lg' fontWeight='semibold' lineClamp={1}>{company.company_name}</Text>
            <Flex gap={4} mt={1} wrap='wrap'>
               <Text fontSize='sm' color='fg.muted'>{company.total_reviews} reviews</Text>
               <Text fontSize='sm' color='fg.muted'>{company.positions_reviewed} positions</Text>
            </Flex>
         </Box>
         <Separator orientation='vertical' height='56px' display={{ base: 'none', md: 'block' }} />
         <Flex gap={4} wrap='wrap' justify={{ base: 'flex-start', md: 'flex-end' }}>
            <ScorePill label='Satisfaction' value={company.satisfaction_score} />
            <ScorePill label='Trust' value={company.trust_score} />
            <ScorePill label='Integrity' value={company.integrity_score} />
            <ScorePill label='Growth' value={company.growth_score} />
            <ScorePill label='Work-Life' value={company.work_life_score} />
         </Flex>
      </Stack>
   );
}
