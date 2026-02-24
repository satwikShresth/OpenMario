import { Badge, Box, Flex, HStack, Image, Skeleton, Text, VStack } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { WarningIcon } from '@/components/icons';
import { omegaHex } from './helpers';
import { useCompanyDetail } from './detailStore';

export function Header() {
   const company = useCompanyDetail(s => s.company);
   const isLoading = useCompanyDetail(s => s.isLoading);

   if (isLoading || !company) {
      return (
         <VStack align='stretch' gap={3}>
            <Skeleton height='40px' width='320px' />
            <Skeleton height='22px' width='200px' />
         </VStack>
      );
   }
   return (
      <Flex justify='space-between' align='flex-start' wrap='wrap' gap={5}>
         <Box>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight='bold' lineHeight='1.2'>
               {company.company_name}
            </Text>
            <HStack gap={2} mt={3} flexWrap='wrap'>
               <Badge colorPalette='gray' variant='surface'>{company.total_reviews} reviews</Badge>
               <Badge colorPalette='gray' variant='surface'>{company.positions_reviewed} positions reviewed</Badge>
               {company.pct_would_recommend != null && (
                  <Badge colorPalette='green' variant='surface'>{company.pct_would_recommend}% recommend</Badge>
               )}
            </HStack>
         </Box>
         <Box textAlign='center' px={6} py={4} borderRadius='2xl' borderWidth='thin' minW='110px' position='relative'>
            {company.total_reviews < 5 && (
               <Tooltip content='Limited data — omΩ score is based on fewer than 5 reviews and may not be representative'>
                  <Box position='absolute' top='8px' right='10px' color='orange.400' cursor='help'>
                     <WarningIcon size={14} />
                  </Box>
               </Tooltip>
            )}
            <Text fontSize='4xl' fontWeight='extrabold' color={omegaHex(company.omega_score)} lineHeight='1'>
               {company.omega_score ?? '—'}
            </Text>
            <Flex align='center' justify='center' gap={1} mt={2}>
               <Image src='/omegascore-logo.png' alt='OMΩ' h='22px' />
               <Text fontSize='xs' color='fg.muted' letterSpacing='wide' fontWeight='medium'>Score</Text>
            </Flex>
         </Box>
      </Flex>
   );
}
