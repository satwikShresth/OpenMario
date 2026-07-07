import { useEffect } from 'react';
import { Box, Flex, IconButton, Image } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { SidebarCollapseIcon } from '@/components/icons';
import {
   DrawerBackdrop,
   DrawerBody,
   DrawerCloseTrigger,
   DrawerContent,
   DrawerRoot,
} from '@/components/ui/drawer';
import { useColorModeValue } from '@/components/ui/color-mode';
import { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from './sidebar-dimensions';
import { useSidebarStore } from './sidebarStore';
import { SidebarItems } from './SidebarItems';

function BrandBlock({ minimized }: { minimized: boolean }) {
   const muted = useColorModeValue('gray.600', 'gray.400');
   const brandHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');

   return (
      <Link to='/' style={{ textDecoration: 'none', display: 'block', minWidth: 0 }}>
         <Flex
            align='center'
            gap={3}
            justify={minimized ? 'center' : 'flex-start'}
            px={minimized ? 0 : 2}
            py={2}
            borderRadius='md'
            transition='background 0.15s ease'
            _hover={{ bg: brandHoverBg }}
         >
            <Image
               src='/openmario.png'
               alt='OpenMario'
               h={minimized ? '32px' : '36px'}
               w='auto'
               maxW={minimized ? '40px' : '140px'}
               fit='contain'
               flexShrink={0}
               style={{ viewTransitionName: 'sidebar-logo' }}
            />
            {!minimized && (
               <Flex direction='column' minW={0} gap={0} lineHeight='short'>
                  <Box
                     as='span'
                     fontWeight='semibold'
                     fontSize='sm'
                     color='fg'
                     truncate
                  >
                     OpenMario
                  </Box>
                  <Box as='span' fontSize='xs' color={muted} truncate>
                     Courses · Co-op · Salary
                  </Box>
               </Flex>
            )}
         </Flex>
      </Link>
   );
}

export function Sidebar() {
   const { isMinimized, toggle, drawerOpen, setDrawerOpen } = useSidebarStore();

   useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
         if (e.key !== 'b' && e.key !== 'B') return;
         if (!(e.metaKey || e.ctrlKey)) return;
         e.preventDefault();
         toggle();
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
   }, [toggle]);

   const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
   const drawerBg = useColorModeValue('gray.50', 'gray.950');

   const desktopWidth = isMinimized ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

   return (
      <>
         <DrawerRoot
            placement='start'
            open={drawerOpen}
            onOpenChange={e => setDrawerOpen(e.open)}
         >
            <DrawerBackdrop bg='blackAlpha.600' />

            <DrawerContent
               maxW='18rem'
               bg={drawerBg}
               borderRightWidth='1px'
               borderColor={borderColor}
               p={0}
            >
               <DrawerBody p={0} display='flex' flexDirection='column' h='100dvh' maxH='100dvh' overflow='hidden'>
                  <Flex
                     align='center'
                     justify='space-between'
                     px={3}
                     py={3}
                     flexShrink={0}
                     borderBottomWidth='1px'
                     borderColor={borderColor}
                  >
                     <BrandBlock minimized={false} />
                     <DrawerCloseTrigger
                        asChild
                        position='static'
                        top='unset'
                        right='unset'
                        insetEnd='unset'
                     >
                        <IconButton
                           aria-label='Close menu'
                           variant='ghost'
                           size='xs'
                           borderRadius='lg'
                           color='fg.muted'
                           _hover={{ color: 'fg', bg: 'bg.muted' }}
                        >
                           <SidebarCollapseIcon size={16} />
                        </IconButton>
                     </DrawerCloseTrigger>
                  </Flex>

                  <Flex flex={1} minH={0} direction='column' overflow='hidden' px={1} py={2}>
                     <SidebarItems onClose={() => setDrawerOpen(false)} minimized={false} />
                  </Flex>
               </DrawerBody>
            </DrawerContent>
         </DrawerRoot>

         {/*
          * Desktop: first column of the app shell (same row as main). Same canvas as `bg.subtle`
          * on the parent — no fixed overlay, no inner card; inset layout matches insights `_app`.
          */}
         <Flex
            display={{ base: 'none', md: 'flex' }}
            direction='column'
            flexShrink={0}
            alignSelf='stretch'
            w={desktopWidth}
            h='100dvh'
            maxH='100dvh'
            minH={0}
            overflow='hidden'
            transition='width 200ms ease-linear'
            px={2}
            pt={2}
            pb={2}
         >
            <Box flexShrink={0} px={isMinimized ? 1 : 1} pb={1}>
               <BrandBlock minimized={isMinimized} />
            </Box>

            <Flex flex={1} minH={0} direction='column' overflow='hidden'>
               <SidebarItems minimized={isMinimized} />
            </Flex>
         </Flex>
      </>
   );
}
