import { VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

/** Vertical page stack; width is capped by the app shell (`__root.tsx`). */
export function Root({
   children,
   gap = 4,
}: {
   children: ReactNode;
   gap?: number;
}) {
   return (
      <VStack align='stretch' gap={gap} w='full' minW={0}>
         {children}
      </VStack>
   );
}
