import { Container, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export function Root({
   children,
   maxW = '5xl',
   py = 8,
   gap = 6,
}: {
   children: ReactNode;
   maxW?: string;
   py?: number;
   gap?: number;
}) {
   return (
      <Container maxW={maxW} py={py}>
         <VStack align='stretch' gap={gap}>{children}</VStack>
      </Container>
   );
}
