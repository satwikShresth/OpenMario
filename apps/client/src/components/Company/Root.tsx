import { Box, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export function Root({
   children,
   maxW = '4xl',
   gap = 6,
}: {
   children: ReactNode;
   maxW?: string | Record<string, string>;
   gap?: number | Record<string, number>;
}) {
   return (
      <Box maxW={maxW} w='full' mx='auto'>
         <VStack align='stretch' gap={gap}>{children}</VStack>
      </Box>
   );
}
