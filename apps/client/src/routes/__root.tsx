import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Box, Flex } from '@chakra-ui/react';
import type { QueryClient } from '@tanstack/react-query';
import TanStackQueryLayout from '@/integrations/tanstack-query/layout.tsx';
import { Footer, PageHeader } from '@/components/common';
import { Sidebar, BottomBar } from '@/components/nav';

interface MyRouterContext {
   queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
   component: () => (
      <>
         <Flex minH='100dvh' align='flex-start'>
            <Sidebar />
            <Flex direction='column' flex='1' minW={0} h='100dvh' overflowY='auto'>
               <PageHeader />
               <Box
                  flex='1'
                  px={{ base: 4, md: 6 }}
                  py={6}
                  pb={{ base: '72px', sm: 6 }}
               >
                  <Outlet />
               </Box>
               <Footer />
            </Flex>
         </Flex>
         <BottomBar />
         <TanStackRouterDevtools />
         <TanStackQueryLayout />
      </>
   ),
});
