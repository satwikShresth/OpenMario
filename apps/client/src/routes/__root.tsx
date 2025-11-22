import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Box, Container, Flex, VStack } from '@chakra-ui/react';
import type { QueryClient } from '@tanstack/react-query';
import TanStackQueryLayout from '@/integrations/tanstack-query/layout.tsx';
import { Footer } from '@/components/common';
import Navbar from '@/components/nav';
import { useMobile } from '@/hooks';
import type { ReactNode } from 'react';
import { migrate } from '@/db';

interface MyRouterContext {
   queryClient: QueryClient;
}

const MobileLayout = ({ children }: { children: ReactNode }) => {
   const isMobile = useMobile();
   if (isMobile) {
      return (
         <>
            <Navbar />
            <Flex flex='fit-content' scrollbar='hidden'>
               {children}
            </Flex>
         </>
      );
   }
   return (
      <>
         <Flex direction='column' minH='100vh' w='90%' mx='auto'>
            <Navbar />
            <Flex flex='1' scrollbar='hidden' overflowY='auto'>
               {children}
            </Flex>
         </Flex>
         <TanStackRouterDevtools />
         <TanStackQueryLayout />
      </>
   );
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
   beforeLoad: () => migrate(),
   component: () => (
      <VStack align='normal'>
         <Box width='100%' position='relative'>
            <MobileLayout>
               <Container>
                  <Outlet />
               </Container>
            </MobileLayout>
         </Box>
         <Footer />
      </VStack>
   ),
});
