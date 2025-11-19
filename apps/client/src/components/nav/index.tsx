import {
   Box,
   Collapsible,
   Flex,
   Icon,
   IconButton,
   Image,
   Text,
   useDisclosure,
} from '@chakra-ui/react';

import { FiGithub, FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi';

import { Link, linkOptions } from '@tanstack/react-router';
import DesktopNav from './Desktop';
import MobileNav from './Mobile';
import { useColorMode, useColorModeValue } from '@/components/ui/color-mode';

export default function Navbar() {
   const { open, onToggle, onClose } = useDisclosure();
   const { colorMode, toggleColorMode } = useColorMode();

   return (
      <Box
         position='sticky'
         top='0'
         zIndex='sticky'
         borderBottomRadius='lg'
         bgColor='bg'
      >
         <Flex
            minH='60px'
            py={{ base: 2 }}
            px={{ base: 20 }}
            align='center'
            transition='all 0.3s ease'
         >
            {/* Mobile menu button */}
            <Flex
               flex={{ base: 1, md: 'auto' }}
               ml={{ base: -2 }}
               display={{ base: 'flex', md: 'none' }}
            >
               <IconButton
                  borderRadius='lg'
                  onClick={onToggle}
                  variant='ghost'
                  aria-label='Toggle Navigation'
               >
                  {open ? <FiX size={20} /> : <FiMenu size={20} />}
               </IconButton>
            </Flex>

            {/* Logo */}
            <Flex
               flex={{ base: 1 }}
               justify='center'
               align='center'
               position='relative'
            >
               <Text
                  as={Link}
                  position={{ base: 'relative', md: 'absolute' }}
                  left={{ md: '0' }}
                  textAlign={{ base: 'center', md: 'left' }}
                  _hover={{ color: 'accent' }}
                  fontFamily='heading'
                  fontWeight='bold'
                  fontSize='xl'
                  onClick={onClose}
                  {...linkOptions({ to: `/` })}
                  color={useColorModeValue('gray.800', 'white')}
               >
                  <Image
                     src='/openmario.png'
                     h='100px'
                     w='100px'
                     fit='contain'
                  />
               </Text>

               {/* Desktop Navigation - Centered */}
               <Flex
                  display={{ base: 'none', md: 'flex' }}
                  justify='center'
                  width='100%'
                  ml={20}
               >
                  <DesktopNav />
               </Flex>
            </Flex>

            {/* Color mode toggle */}
            <Flex
               flex={{ base: 1, md: 0 }}
               justify='flex-end'
               direction='row'
               gap={1}
            >
               <IconButton
                  as={Link}
                  variant='ghost'
                  _hover={{ color: 'accent' }}
                  borderRadius='lg'
                  onClick={onClose}
                  //@ts-expect-error
                  href='https://github.com/satwikShresth/openmario'
               >
                  <Icon as={FiGithub} />
               </IconButton>

               <IconButton
                  aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
                  variant='ghost'
                  _hover={{ color: 'accent' }}
                  onClick={toggleColorMode}
                  borderRadius='lg'
               >
                  {colorMode === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
               </IconButton>
            </Flex>
         </Flex>

         {/* Mobile Navigation */}
         <Collapsible.Root open={open}>
            <Collapsible.Content>
               <MobileNav onToggle={onToggle} />
            </Collapsible.Content>
         </Collapsible.Root>
      </Box>
   );
}
