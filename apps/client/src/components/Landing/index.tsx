import { Box, Container, Flex, Text, VStack } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';

const TOOLS = [
   { emoji: '🏢', label: 'co-op reviews', to: '/companies' },
   { emoji: '📚', label: 'courses', to: '/courses/explore' },
   { emoji: '👨‍🏫', label: 'professors', to: '/professors' },
];

export function Landing() {
   return (
      <Box minH='100dvh' bg='#000' color='#e0e0e0' fontFamily='mono'>
         <Flex
            as='nav' px={{ base: 4, md: 8 }} py={3}
            align='center' justify='space-between'
            borderBottomWidth='1px' borderColor='#111'
            position='sticky' top='0' bg='#000' zIndex={100}
         >
            <Text fontSize='xs' color='#888' letterSpacing='widest'>OPENMARIO</Text>
            <Link to='/salary'>
               <Text fontSize='xs' color='#666' _hover={{ color: '#ccc' }} cursor='pointer'>submit review ↗</Text>
            </Link>
         </Flex>

         <Container maxW='5xl' py={{ base: 12, md: 20 }}>
            <VStack gap={10} align='stretch'>
               <VStack gap={1} textAlign='center'>
                  <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight='black' lineHeight='1' letterSpacing='tight' color='#fff'>
                     ☠ RIP DREXEL SHAFT
                  </Text>
                  <Text fontSize='xs' color='#666' letterSpacing='widest'>NOV 15, 2009</Text>
               </VStack>

               <Box borderRadius='lg' overflow='hidden' borderWidth='1px' borderColor='#1a1a1a' aspectRatio='16/9'>
                  <iframe
                     width='100%' height='100%'
                     src='https://www.youtube.com/embed/GzKJCVJHcbk?autoplay=0&rel=0&modestbranding=1'
                     allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                     allowFullScreen
                  />
               </Box>

               <Box textAlign='center' py={3} px={4} borderTopWidth='1px' borderBottomWidth='1px' borderColor='#1a1a1a'>
                  <Text fontSize={{ base: 'sm', md: 'md' }} color='#ccc' lineHeight='1.7' fontStyle='italic'>
                     "The Drexel shaft may be dead,<br />
                     but the suffering it brings to us students<br />
                     still lives on"
                  </Text>
                  <Text fontSize='xs' color='#666' mt={3}>— @StanMangamer · 4 years ago</Text>
               </Box>

               <Flex gap={3} justify='center' flexWrap='wrap'>
                  {TOOLS.map(({ emoji, label, to }) => (
                     <Link key={to} to={to}>
                        <Box
                           px={4} py={3}
                           borderWidth='1px' borderColor='#333' borderRadius='md'
                           _hover={{ borderColor: '#888', color: '#fff' }}
                           transition='all 120ms' textAlign='center' minW='110px' color='#aaa'
                        >
                           <Text fontSize='xl'>{emoji}</Text>
                           <Text fontSize='xs' mt={1}>{label}</Text>
                        </Box>
                     </Link>
                  ))}
               </Flex>

               <Text fontSize='xs' color='#444' textAlign='center'>
                  not affiliated with drexel university
               </Text>
            </VStack>
         </Container>
      </Box>
   );
}
