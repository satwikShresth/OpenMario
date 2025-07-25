import { Box, Container, Flex, HStack, Link as Clink, Separator, Text } from '@chakra-ui/react';
import { Link, linkOptions } from '@tanstack/react-router';

export const Footer = () => {
   return (
      <Box as='footer' width='100%'>
         <Separator />
         <Container maxW='container.xl' py={2}>
            <Flex
               direction={{ base: 'column', md: 'row' }}
               justify='space-between'
               align='center'
            >
               <Text fontSize='sm'>
                  © {new Date().getFullYear()} OpenMario. All rights reserved.
               </Text>
               <HStack mt={0} gap={5}>
                  <Text fontSize='sm'>
                     {'Created by '}
                     <Clink
                        as={Link}
                        {
                           //@ts-ignore: shuup
                           ...linkOptions({ to: 'https://satwik.dev' })
                        }
                        colorPalette='teal'
                     >
                        Satwik
                     </Clink>
                  </Text>
               </HStack>
            </Flex>
         </Container>
      </Box>
   );
};
