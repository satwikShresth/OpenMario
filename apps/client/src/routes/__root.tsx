import { createRootRouteWithContext, Outlet, useRouterState } from '@tanstack/react-router';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { Box, Flex } from '@chakra-ui/react';
import type { QueryClient } from '@tanstack/react-query';
import TanStackQueryLayout from '@/integrations/tanstack-query/layout.tsx';
import { Footer, PageHeader } from '@/components/common';
import { getPageMaxWidth } from '@/components/common/page-layout';
import { Sidebar, BottomBar } from '@/components/nav';

interface MyRouterContext {
   queryClient: QueryClient;
}

const tanstackDevtoolsPlugins = [
   {
      name: 'TanStack Router',
      render: <TanStackRouterDevtoolsPanel />
   },
   formDevtoolsPlugin()
] as const;

function RootComponent() {
   const pathname = useRouterState({ select: (s) => s.location.pathname });
   const pageMaxW = getPageMaxWidth(pathname);

   return (
      <>
         {pathname === '/' ? (
            <>
               <Box style={{ viewTransitionName: 'page-content' }}>
                  <Outlet />
               </Box>
               <TanStackQueryLayout />
            </>
         ) : (
            <>
               {/*
                * App shell: one surface (`bg.subtle`) holds nav column + main; main is the inset
                * panel only — same structure as insights `_app` + `SidebarInset`.
                */}
               <Flex
                  h='100dvh'
                  maxH='100dvh'
                  minH={0}
                  w='full'
                  align='stretch'
                  overflow='hidden'
                  bg='bg.subtle'
               >
                  <Sidebar />
                  <Flex
                     flex='1'
                     direction='column'
                     minW={0}
                     minH={0}
                     h='100%'
                     p={{ base: 0, md: 3 }}
                  >
                     <Box
                        flex='1'
                        display='flex'
                        flexDirection='column'
                        minH={0}
                        h='100%'
                        bg='bg'
                        borderRadius={{ base: 'none', md: 'xl' }}
                        borderWidth={{ base: '0', md: '1px' }}
                        borderColor='border'
                        overflow='hidden'
                        style={{ viewTransitionName: 'main-panel' }}
                     >
                        <PageHeader />
                        <Box
                           flex='1'
                           minH={0}
                           minW={0}
                           overflowY='auto'
                           overscrollBehavior='contain'
                           px={{ base: 4, md: 6 }}
                           py={6}
                           pb={{ base: '72px', sm: 6 }}
                        >
                           <Box
                              maxW={pageMaxW}
                              w='full'
                              mx='auto'
                              minW={0}
                              style={{ viewTransitionName: 'page-content' }}
                           >
                              <Outlet />
                           </Box>
                        </Box>
                        <Footer />
                     </Box>
                  </Flex>
               </Flex>
               <BottomBar />
               <TanStackQueryLayout />
            </>
         )}
         <TanStackDevtools plugins={[...tanstackDevtoolsPlugins]} />
      </>
   );
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
   component: RootComponent,
});
