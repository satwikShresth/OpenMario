import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Box, Center, Flex } from '@chakra-ui/react';
import type { QueryClient } from '@tanstack/react-query';
import TanStackQueryLayout from '@/integrations/tanstack-query/layout.tsx';
im port Navbar from '@/components/nav/index.tsx';
 
in terface MyRouterContext {
   queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
   component: () => (
      <>
         <Center>
             <Box width='100%' maxWidth='1800px' position='relative'>
               <Flex direction='column' minH='100vh' w='90%' mx='auto'>
                  <Navbar />
                  <Flex flex='1' scrollbar='hidden' overflowY='auto'>
                      <Outlet />
                    </Flex>
               </Flex>
                 <TanStackRouterDevtools />
                 <TanStackQueryLayout />
            </Box>
           </Center>
         </>
   ),    
});     
      
       
       }}
       
        
        
          
           
         
        
    
