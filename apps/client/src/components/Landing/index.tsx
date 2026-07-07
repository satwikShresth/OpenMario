import type { ReactNode } from 'react';
import {
   Box,
   Container,
   Flex,
   Heading,
   SimpleGrid,
   Text,
} from '@chakra-ui/react';
import { Link, useNavigate } from '@tanstack/react-router';

/** Primary destinations — full router paths that exist in `routeTree.gen.ts`. */
const DESTINATIONS: {
   title: string;
   hint: string;
   to: '/salary' | '/companies' | '/courses/explore' | '/professors' | '/courses/plan';
   emoji: string;
}[] = [
   {
      emoji: '💵',
      title: 'Salary',
      hint: 'Co-op pay — browse & submit',
      to: '/salary',
   },
   {
      emoji: '🏢',
      title: 'Companies',
      hint: 'Reviews & roles',
      to: '/companies',
   },
   {
      emoji: '📚',
      title: 'Explore courses',
      hint: 'Sections & instructors',
      to: '/courses/explore',
   },
   {
      emoji: '🗓️',
      title: 'Plan',
      hint: 'Schedule builder (beta)',
      to: '/courses/plan',
   },
   {
      emoji: '👨‍🏫',
      title: 'Professors',
      hint: 'Ratings & sections',
      to: '/professors',
   },
];

const HEADER_LINKS: { label: string; to: (typeof DESTINATIONS)[number]['to'] }[] = [
   { label: 'Salary', to: '/salary' },
   { label: 'Companies', to: '/companies' },
   { label: 'Courses', to: '/courses/explore' },
   { label: 'Plan', to: '/courses/plan' },
   { label: 'Professors', to: '/professors' },
];

function NavLink({
   to,
   children,
}: {
   to: (typeof DESTINATIONS)[number]['to'];
   children: ReactNode;
}) {
   return (
      <Link
         to={to}
         preload='intent'
         style={{ textDecoration: 'none' }}
      >
         {children}
      </Link>
   );
}

function DestinationTile(props: (typeof DESTINATIONS)[number]) {
   const { to, emoji, title, hint } = props;

   return (
      <NavLink to={to}>
         <Flex
            direction='column'
            align='flex-start'
            gap={1}
            p={4}
            minH='88px'
            borderWidth='1px'
            borderColor='#2a2a2a'
            borderRadius='lg'
            bg='#0a0a0a'
            color='#c8c8c8'
            transition='border-color 0.15s ease, background 0.15s ease, transform 0.15s ease'
            _hover={{
               borderColor: '#666',
               bg: '#141414',
               color: '#fff',
               transform: 'translateY(-1px)',
            }}
            _focusVisible={{
               outline: '2px solid #888',
               outlineOffset: '2px',
            }}
         >
            <Text fontSize='2xl' lineHeight='1' aria-hidden>
               {emoji}
            </Text>
            <Text fontWeight='semibold' fontSize='sm' letterSpacing='tight'>
               {title}
            </Text>
            <Text fontSize='xs' color='#777' _hover={{ color: '#aaa' }}>
               {hint}
            </Text>
         </Flex>
      </NavLink>
   );
}

export function Landing() {
   const navigate = useNavigate();

   return (
      <Box
         minH='100dvh'
         bg='#000'
         color='#e0e0e0'
         fontFamily='mono'
         pb={{ base: 10, md: 14 }}
      >
         {/* Top bar — every link is an explicit router navigation */}
         <Flex
            as='header'
            px={{ base: 3, md: 6 }}
            py={3}
            gap={3}
            align='center'
            justify='space-between'
            flexWrap='wrap'
            borderBottomWidth='1px'
            borderColor='#1a1a1a'
            position='sticky'
            top={0}
            bg='rgba(0,0,0,0.92)'
            backdropFilter='blur(10px)'
            zIndex={50}
         >
            <Link
               to='/'
               preload='intent'
               style={{ textDecoration: 'none' }}
            >
               <Text
                  fontSize='xs'
                  color='#fff'
                  letterSpacing='0.2em'
                  fontWeight='bold'
                  _hover={{ color: '#ccc' }}
               >
                  OPENMARIO
               </Text>
            </Link>

            <Flex
               gap={{ base: 1, md: 2 }}
               align='center'
               justify='flex-end'
               flex={1}
               minW={0}
               overflowX='auto'
               css={{
                  scrollbarWidth: 'thin',
                  '&::-webkit-scrollbar': { height: '4px' },
                  '&::-webkit-scrollbar-thumb': {
                     background: '#333',
                     borderRadius: 'full',
                  },
               }}
            >
               {HEADER_LINKS.map(({ label, to }) => (
                  <NavLink key={to} to={to}>
                     <Box
                        as='span'
                        display='inline-flex'
                        alignItems='center'
                        px={{ base: 2, md: 3 }}
                        py={2}
                        borderRadius='md'
                        fontSize='xs'
                        color='#999'
                        whiteSpace='nowrap'
                        transition='color 0.15s, background 0.15s'
                        _hover={{
                           color: '#fff',
                           bg: 'whiteAlpha.100',
                        }}
                        _focusVisible={{
                           outline: '2px solid #888',
                           outlineOffset: '2px',
                        }}
                     >
                        {label}
                     </Box>
                  </NavLink>
               ))}
            </Flex>
         </Flex>

         <Container maxW='5xl' px={{ base: 4, md: 6 }} py={{ base: 10, md: 14 }}>
            <Flex direction='column' gap={{ base: 12, md: 16 }} align='stretch'>
               <Flex direction='column' gap={3} textAlign='center'>
                  <Heading
                     as='h1'
                     fontSize={{ base: '2xl', md: '4xl' }}
                     fontWeight='black'
                     lineHeight='1.05'
                     letterSpacing='tight'
                     color='#fff'
                  >
                     ☠ RIP DREXEL SHAFT
                  </Heading>
                  <Text fontSize='xs' color='#666' letterSpacing='0.25em'>
                     NOV 15, 2009
                  </Text>
               </Flex>

               <Box
                  borderRadius='lg'
                  overflow='hidden'
                  borderWidth='1px'
                  borderColor='#222'
                  aspectRatio='16/9'
                  bg='#111'
               >
                  <iframe
                     title='In memoriam — Drexel Shaft'
                     width='100%'
                     height='100%'
                     src='https://www.youtube.com/embed/GzKJCVJHcbk?autoplay=0&rel=0&modestbranding=1'
                     allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                     allowFullScreen
                     loading='lazy'
                  />
               </Box>

               <Box
                  textAlign='center'
                  py={5}
                  px={4}
                  borderTopWidth='1px'
                  borderBottomWidth='1px'
                  borderColor='#1a1a1a'
               >
                  <Text
                     fontSize={{ base: 'sm', md: 'md' }}
                     color='#ccc'
                     lineHeight='1.75'
                     fontStyle='italic'
                     whiteSpace='pre-line'
                  >
                     {
                        '"The Drexel shaft may be dead,\nbut the suffering it brings to us students\nstill lives on"'
                     }
                  </Text>
                  <Text fontSize='xs' color='#666' mt={4}>
                     — @StanMangamer · 4 years ago
                  </Text>
               </Box>

               <Flex direction='column' gap={4}>
                  <Text fontSize='xs' color='#666' letterSpacing='0.15em' textAlign='center'>
                     OPEN THE APP
                  </Text>
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={3}>
                     {DESTINATIONS.map(d => (
                        <DestinationTile key={d.to} {...d} />
                     ))}
                  </SimpleGrid>
               </Flex>

               <Flex justify='center' pt={2}>
                  <Box
                     as='button'
                     px={6}
                     py={3}
                     borderRadius='full'
                     borderWidth='1px'
                     borderColor='#444'
                     bg='#0d0d0d'
                     color='#eee'
                     fontSize='sm'
                     fontWeight='medium'
                     cursor='pointer'
                     transition='all 0.15s ease'
                     _hover={{
                        borderColor: '#888',
                        bg: '#1a1a1a',
                     }}
                     _focusVisible={{
                        outline: '2px solid #aaa',
                        outlineOffset: '3px',
                     }}
                     onClick={() => navigate({ to: '/salary' })}
                  >
                     Start with salary →
                  </Box>
               </Flex>

               <Text fontSize='xs' color='#444' textAlign='center' pt={4}>
                  not affiliated with drexel university
               </Text>
            </Flex>
         </Container>
      </Box>
   );
}
