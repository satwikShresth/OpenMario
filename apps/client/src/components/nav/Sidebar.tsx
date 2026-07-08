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
            borderRadius='lg'
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
               <Flex direction='column' minW={0} gap={0.5} lineHeight='short'>
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

function SidebarShell({
   minimized,
   onClose,
}: {
   minimized: boolean;
   onClose?: () => void;
}) {
   return (
      <Flex direction='column' h='full' minH={0}>
         <Box flexShrink={0} px={minimized ? 2 : 3} py={3}>
            <BrandBlock minimized={minimized} />
         </Box>

         <Flex flex={1} minH={0} direction='column' overflow='hidden'>
            <SidebarItems onClose={onClose} minimized={minimized} />
         </Flex>
      </Flex>
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
               bg='bg.subtle'
               borderRightWidth='1px'
               borderColor={borderColor}
               p={0}
            >
               <DrawerBody p={0} display='flex' flexDirection='column' h='100dvh' maxH='100dvh' overflow='hidden'>
                  <Flex
                     align='center'
                     justify='flex-end'
                     px={2}
                     pt={2}
                     flexShrink={0}
                  >
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
                           size='sm'
                           borderRadius='lg'
                           color='fg.muted'
                           _hover={{ color: 'fg', bg: 'bg.muted' }}
                        >
                           <SidebarCollapseIcon size={16} />
                        </IconButton>
                     </DrawerCloseTrigger>
                  </Flex>

                  <Flex flex={1} minH={0} direction='column' overflow='hidden'>
                     <SidebarShell
                        minimized={false}
                        onClose={() => setDrawerOpen(false)}
                     />
                  </Flex>
               </DrawerBody>
            </DrawerContent>
         </DrawerRoot>

         {/*
          * Desktop: left column of the outer shell — same `bg.subtle` surface as the parent,
          * not a nested card. Main content is the only inset panel.
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
            px={2}
            pt={2}
            pb={2}
            style={{ viewTransitionName: 'sidebar-shell' }}
         >
            <SidebarShell
               minimized={isMinimized}
            />
         </Flex>
      </>
   );
}
