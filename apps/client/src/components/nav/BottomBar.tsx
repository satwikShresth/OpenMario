import { Box, Flex, Image, Text } from '@chakra-ui/react';
import { Link, useRouterState } from '@tanstack/react-router';
import { NAV_ITEMS } from './items';

const LEFT_ITEMS = NAV_ITEMS.slice(0, 2);
const RIGHT_ITEMS = NAV_ITEMS.slice(2);

export function BottomBar() {
   const pathname = useRouterState({ select: s => s.location.pathname });

   return (
      <Box
         display={{ base: 'flex', sm: 'none' }}
         position='fixed'
         bottom={0}
         left={0}
         right={0}
         zIndex='sticky'
         borderTopWidth='thin'
         bg='bg'
      >
         <Flex h='56px' w='full' align='stretch'>
            {/* Left nav items */}
            {LEFT_ITEMS.map(item => {
               const isActive = pathname.startsWith(item.href);
               return (
                  <Link key={item.label} to={item.href} style={{ flex: 1, textDecoration: 'none' }}>
                     <Flex
                        direction='column'
                        align='center'
                        justify='center'
                        w='full'
                        h='full'
                        gap={0.5}
                        color={isActive ? 'colorPalette.fg' : 'fg.subtle'}
                        _hover={{ color: 'fg' }}
                        transition='color 0.15s'
                        position='relative'
                     >
                        <item.icon size={20} />
                        <Text fontSize='2xs' fontWeight={isActive ? 'semibold' : 'normal'} lineHeight='1'>
                           {item.label}
                        </Text>
                        {isActive && (
                           <Box
                              position='absolute'
                              top={0}
                              left='50%'
                              transform='translateX(-50%)'
                              w='20px'
                              h='2px'
                              bg='colorPalette.fg'
                              borderBottomRadius='full'
                           />
                        )}
                     </Flex>
                  </Link>
               );
            })}

            {/* Center OM logo — home link */}
            <Link to='/' style={{ textDecoration: 'none', flexShrink: 0 }}>
               <Flex
                  direction='column'
                  align='center'
                  justify='center'
                  w='64px'
                  h='full'
               >
                  <Box
                     bg='bg'
                     borderWidth='thin'
                     borderRadius='full'
                     p='6px'
                     mt='-20px'
                     shadow='md'
                  >
                     <Image src='/openmario.png' h='36px' w='36px' fit='contain' />
                  </Box>
               </Flex>
            </Link>

            {/* Right nav items */}
            {RIGHT_ITEMS.map(item => {
               const isActive = pathname.startsWith(item.href);
               return (
                  <Link key={item.label} to={item.href} style={{ flex: 1, textDecoration: 'none' }}>
                     <Flex
                        direction='column'
                        align='center'
                        justify='center'
                        w='full'
                        h='full'
                        gap={0.5}
                        color={isActive ? 'colorPalette.fg' : 'fg.subtle'}
                        _hover={{ color: 'fg' }}
                        transition='color 0.15s'
                        position='relative'
                     >
                        <Box position='relative'>
                           <item.icon size={20} />
                           {item.badge && (
                              <Box
                                 position='absolute'
                                 top='-3px'
                                 right='-5px'
                                 w='7px'
                                 h='7px'
                                 bg='orange.400'
                                 borderRadius='full'
                                 borderWidth='1.5px'
                                 borderColor='bg'
                              />
                           )}
                        </Box>
                        <Text fontSize='2xs' fontWeight={isActive ? 'semibold' : 'normal'} lineHeight='1'>
                           {item.label}
                        </Text>
                        {isActive && (
                           <Box
                              position='absolute'
                              top={0}
                              left='50%'
                              transform='translateX(-50%)'
                              w='20px'
                              h='2px'
                              bg='colorPalette.fg'
                              borderBottomRadius='full'
                           />
                        )}
                     </Flex>
                  </Link>
               );
            })}
         </Flex>
      </Box>
   );
}
