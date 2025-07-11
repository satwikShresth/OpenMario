import { createFileRoute } from '@tanstack/react-router';
import { Box, Button, Container, Heading, Image, Text, VStack } from '@chakra-ui/react';
import logo from '../logo.svg';

export const Route = createFileRoute('/')({
   component: App,
});

function App() {
   return (
      <Container maxW='container.md' py={10}>
         <VStack align='center'>
            <Image src={logo} alt='Logo' boxSize='150px' />

            <VStack textAlign='center'>
               <Heading size='2xl' color='blue.500'>
                  Welcome to Our App
               </Heading>
               <Text fontSize='lg' color='gray.600' maxW='md'>
                  We're excited to have you here! Explore our features and discover what makes our
                  platform special.
               </Text>
            </VStack>

            <VStack>
               <Button colorScheme='blue' size='lg'>
                  Get Started
               </Button>
               <Button variant='outline' size='lg'>
                  Learn More
               </Button>
            </VStack>

            <Box textAlign='center' pt={6}>
               <Text fontSize='sm' color='gray.500'>
                  Ready to begin your journey? Click the button above to start exploring.
               </Text>
            </Box>
         </VStack>
      </Container>
   );
}
