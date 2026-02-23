import { Box, Flex, Separator, Text } from '@chakra-ui/react';

interface FooterProps {
   avg?: number | null;
   median?: number | null;
}

export default function Footer({ avg, median }: FooterProps) {
   const hasStats = avg != null || median != null;

   return (
      <Box mt={4}>
         {hasStats && (
            <>
               <Flex gap={6} px={3} py={2} bg='bg.subtle' borderRadius='md' mb={2} flexWrap='wrap'>
                  {avg != null && (
                     <Text fontSize='sm' color='fg.muted'>
                        Avg:{' '}
                        <Text as='span' fontWeight='semibold' color='fg'>
                           ${avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </Text>
                     </Text>
                  )}
                  {median != null && (
                     <Text fontSize='sm' color='fg.muted'>
                        Median:{' '}
                        <Text as='span' fontWeight='semibold' color='fg'>
                           ${median.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </Text>
                     </Text>
                  )}
               </Flex>
               <Separator mb={2} />
            </>
         )}
         <Box p={3} bg='bg.subtle' borderRadius='md'>
            <Text fontSize='sm' color='fg.muted'>
               Note: All compensation data is self-reported by students.
            </Text>
         </Box>
      </Box>
   );
}
