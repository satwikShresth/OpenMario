import { Box, Text } from '@chakra-ui/react';

export default function Footer() {
   return (
      <Box mb={3}>
         <Box px={3} py={2} bg='bg.subtle' borderRadius='md'>
            <Text fontSize='sm' color='fg.muted'>
               Note: All compensation data is self-reported by students.
            </Text>
         </Box>
      </Box>
   );
}
