import { Box, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export function Root({
   children,
   maxW = '4xl',
   gap = 4,
}: {
   children: ReactNode;
   maxW?: string;
   gap?: number;
}) {
   return (
      <Box maxW={maxW} w='full' mx='auto' overflowX='hidden'>
         <VStack align='stretch' gap={gap}>{children}</VStack>
      </Box>
   );
}
