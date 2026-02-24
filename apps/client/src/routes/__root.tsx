import { createRootRouteWithContext, Outlet, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Box, Flex } from '@chakra-ui/react';
import type { QueryClient } from '@tanstack/react-query';
import TanStackQueryLayout from '@/integrations/tanstack-query/layout.tsx';
import { Footer, PageHeader } from '@/components/common';
import { Sidebar, BottomBar } from '@/components/nav';

interface MyRouterContext {
   queryClient: QueryClient;
}

function RootComponent() {
   const pathname = useRouterState({ select: (s) => s.location.pathname });

   if (pathname === '/') {
      return (
         <>
            <Outlet />
            <TanStackQueryLayout />
         </>
      );
   }

   return (
      <>
         <Flex minH='100dvh' align='flex-start'>
            <Sidebar />
            <Flex direction='column' flex='1' minW={0} h='100dvh' overflowY='auto'>
               <PageHeader />
               <Box
                  flex='1'
                  px={{ base: 4, md: 6, xl: 8, '2xl': 12 }}
                  py={{ base: 6, md: 8, xl: 10 }}
                  pb={{ base: '72px', sm: 6, md: 8, xl: 10 }}
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
   );
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
   component: RootComponent,
});
