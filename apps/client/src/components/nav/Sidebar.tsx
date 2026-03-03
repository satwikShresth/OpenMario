import { Box, Flex, Icon, IconButton, Image } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { SidebarCollapseIcon, SidebarExpandIcon } from '@/components/icons';
import {
   DrawerBackdrop,
   DrawerBody,
   DrawerCloseTrigger,
   DrawerContent,
   DrawerRoot,
} from '@/components/ui/drawer';
import { useColorModeValue } from '@/components/ui/color-mode';
import { useSidebarStore } from './sidebarStore';
import { SidebarItems } from './SidebarItems';

function Logo({ minimized }: { minimized: boolean }) {
   return (
      <Link to='/' style={{ textDecoration: 'none', display: 'block' }}>
         <Image
            src='/openmario.png'
            alt='OpenMario'
            h={minimized ? '32px' : '56px'}
            w='auto'
            maxW={minimized ? '52px' : '190px'}
            fit='contain'
            flexShrink={0}
            style={{ viewTransitionName: 'sidebar-logo' }}
         />
      </Link>
   );
}

export function Sidebar() {
   const { isMinimized, toggle, drawerOpen, setDrawerOpen } = useSidebarStore();

   const cardBg = useColorModeValue('rgba(255,255,255,0.92)', 'rgba(9,9,11,0.92)');
   const borderColor = useColorModeValue('rgba(0,0,0,0.08)', 'rgba(255,255,255,0.08)');

   return (
      <>
         {/* Tablet — drawer, only mounted on sm screens (trigger lives in PageHeader) */}
         <DrawerRoot
            placement='start'
            open={drawerOpen}
            onOpenChange={e => setDrawerOpen(e.open)}
         >
            <DrawerBackdrop bg='blackAlpha.600' />

            <DrawerContent
               maxW='240px'
               bg={cardBg}
               borderRightWidth='1px'
               borderColor={borderColor}
               shadow='lg'
               css={{ backdropFilter: 'blur(16px)' }}
            >
               <DrawerBody p={0} display='flex' flexDirection='column' h='full'>
                  {/* Drawer header */}
                  <Flex
                     align='center'
                     justify='space-between'
                     px={4}
                     py={4}
                     flexShrink={0}
                     borderBottomWidth='1px'
                     borderColor={borderColor}
                  >
                     <Logo minimized={false} />
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
                           <Icon as={SidebarCollapseIcon} boxSize={4} />
                        </IconButton>
                     </DrawerCloseTrigger>
                  </Flex>

                  <Box
                     flex='1'
                     overflowY='auto'
                     css={{
                        '&::-webkit-scrollbar': { width: '2px' },
                        '&::-webkit-scrollbar-thumb': {
                           background: 'var(--chakra-colors-border-subtle)',
                           borderRadius: '9999px',
                        },
                     }}
                  >
                     <SidebarItems onClose={() => setDrawerOpen(false)} minimized={false} />
                  </Box>
               </DrawerBody>
            </DrawerContent>
         </DrawerRoot>

         {/* Desktop — floating card sidebar */}
         <Box
            display={{ base: 'none', md: 'flex' }}
            position='sticky'
            top={3}
            h='calc(100dvh - 24px)'
            alignSelf='flex-start'
            m={3}
            flexShrink={0}
            w={isMinimized ? '62px' : '220px'}
            transition='width 0.2s cubic-bezier(0.4,0,0.2,1)'
            flexDirection='column'
            borderRadius='xl'
            borderWidth='1px'
            borderColor={borderColor}
            overflow='hidden'
            css={{
               background: cardBg,
               backdropFilter: 'blur(16px)',
            }}
         >
            {/* Header */}
            <Flex
               align='center'
               flexDirection='column'
               px={isMinimized ? 0 : 3}
               pt={4}
               pb={isMinimized ? 2 : 4}
               gap={isMinimized ? 2 : 0}
               flexShrink={0}
               borderBottomWidth='1px'
               borderColor={borderColor}
               position='relative'
            >
               <Flex align='center' justify='space-between' w='full'>
                  {/* Invisible spacer to balance the collapse button */}
                  {!isMinimized && <Box w='24px' flexShrink={0} />}

                  <Logo minimized={isMinimized} />

                  {!isMinimized && (
                     <IconButton
                        aria-label='Minimize sidebar'
                        variant='ghost'
                        size='xs'
                        borderRadius='lg'
                        onClick={toggle}
                        color='fg.muted'
                        _hover={{ color: 'fg', bg: 'bg.muted' }}
                        flexShrink={0}
                     >
                        <Icon as={SidebarCollapseIcon} boxSize={4} />
                     </IconButton>
                  )}
               </Flex>

               {isMinimized && (
                  <IconButton
                     aria-label='Expand sidebar'
                     variant='ghost'
                     size='xs'
                     borderRadius='lg'
                     onClick={toggle}
                     color='fg.muted'
                     _hover={{ color: 'fg', bg: 'bg.muted' }}
                  >
                     <Icon as={SidebarExpandIcon} boxSize={4} />
                  </IconButton>
               )}
            </Flex>

            {/* Nav items */}
            <Box
               flex='1'
               overflowY='auto'
               overflowX='hidden'
               py={2}
               css={{
                  '&::-webkit-scrollbar': { width: '2px' },
                  '&::-webkit-scrollbar-thumb': {
                     background: 'var(--chakra-colors-border-subtle)',
                     borderRadius: '9999px',
                  },
               }}
            >
               <SidebarItems minimized={isMinimized} />
            </Box>
         </Box>
      </>
   );
}
