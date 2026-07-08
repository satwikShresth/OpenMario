import {
   Box,
   Button,
   Container,
   Flex,
   Grid,
   Heading,
   Icon,
   Image,
   Separator,
   Text,
} from '@chakra-ui/react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
   ArrowRightIcon,
   AutoFillIcon,
   BriefcaseIcon,
   CalendarIcon,
   SalaryIcon,
   SearchIcon,
   ShaftIcon,
   UploadIcon,
} from '@/components/icons';
import {
   BentoCard,
   CardDesc,
   CardLabel,
   CardTitle,
   Chip,
   FlowSteps,
   NodeGraph,
   OpenLink,
   RatingVisual,
   ScoreRow,
   SearchVisual,
   SectionDivider,
   StatBadge,
   WeekGrid,
} from './FeatureSection';

const NAV_LINKS = [
   { label: 'Explore', to: '/courses/explore' },
   { label: 'Companies', to: '/companies' },
   { label: 'Professors', to: '/professors' },
   { label: 'Salary', to: '/salary' },
   { label: 'Plan', to: '/courses/plan' },
] as const;

function LandingHeader({ onOpenApp }: { onOpenApp: () => void }) {
   return (
      <Box
         as='header'
         position='sticky'
         top={0}
         zIndex={50}
         borderBottomWidth='1px'
         borderColor='rgba(255,255,255,0.08)'
         bg='rgba(8,10,12,0.85)'
         backdropFilter='blur(20px)'
      >
         <Container maxW='7xl' px={{ base: 4, md: 8 }}>
            <Flex h={{ base: '56px', md: '64px' }} align='center' justify='space-between' gap={6}>
               <Link to='/' preload='intent' style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <Flex align='center' gap={3}>
                     <Image src='/openmario.png' alt='OpenMario' h='32px' w='auto' fit='contain' />
                     <Flex direction='column' gap={0} lineHeight='1.2' display={{ base: 'none', sm: 'flex' }}>
                        <Text fontFamily='body' fontWeight='semibold' fontSize='sm' color='white' letterSpacing='-0.01em'>
                           OpenMario
                        </Text>
                        <Text fontFamily='body' fontSize='2xs' color='rgba(255,255,255,0.4)'>
                           for Drexel students
                        </Text>
                     </Flex>
                  </Flex>
               </Link>

               <Flex
                  as='nav'
                  align='center'
                  gap={1}
                  display={{ base: 'none', lg: 'flex' }}
               >
                  {NAV_LINKS.map(link => (
                     <Link
                        key={link.to}
                        to={link.to}
                        preload='intent'
                        style={{ textDecoration: 'none' }}
                     >
                        <Text
                           fontFamily='body'
                           px={3}
                           py={1.5}
                           fontSize='sm'
                           fontWeight='medium'
                           color='rgba(255,255,255,0.55)'
                           borderRadius='md'
                           transition='color 0.15s'
                           _hover={{ color: 'white' }}
                        >
                           {link.label}
                        </Text>
                     </Link>
                  ))}
               </Flex>

               <Button
                  colorPalette='teal'
                  size='sm'
                  borderRadius='full'
                  px={5}
                  fontFamily='body'
                  fontWeight='semibold'
                  flexShrink={0}
                  onClick={onOpenApp}
               >
                  Open app
                  <Icon as={ArrowRightIcon} boxSize={3.5} />
               </Button>
            </Flex>
         </Container>
      </Box>
   );
}

/* ─── Landing ─────────────────────────────────────────────────────────────── */
export function Landing() {
   const navigate = useNavigate();

   return (
      <Box minH='100dvh' bg='#080a0c' color='white' overflowX='hidden' fontFamily='body'>

         <LandingHeader onOpenApp={() => navigate({ to: '/courses/explore' })} />

         {/* ── Hero ── */}
         <Box position='relative' overflow='hidden'>
            <Box
               className='landing-hero-glow'
               position='absolute'
               top={0} left='50%'
               transform='translateX(-50%)'
               w='900px' h='560px'
               background='radial-gradient(ellipse at 50% 0%, rgba(20,184,166,0.2) 0%, transparent 65%)'
               pointerEvents='none'
            />
            <Container maxW='5xl' px={{ base: 4, md: 8 }} pt={{ base: 16, md: 24 }} pb={{ base: 12, md: 16 }} position='relative'>
               {/* Headline */}
               <Heading
                  as='h1'
                  className='landing-fade-up'
                  fontFamily='body'
                  textAlign='center'
                  fontSize={{ base: '3.25rem', sm: '4rem', md: '4.75rem', lg: '5.5rem' }}
                  fontWeight='700'
                  lineHeight='1.02'
                  letterSpacing='-0.04em'
                  mb={6}
               >
                  Transparency
                  <Box as='br' display={{ base: 'none', sm: 'block' }} />
                  {' '}for{' '}
                  <Box as='span' className='landing-drexel-glow' color='#2dd4bf'>
                     Drexel
                  </Box>
               </Heading>
               <Text
                  className='landing-fade-up landing-fade-up-delay-1'
                  fontFamily='body'
                  textAlign='center'
                  fontSize={{ base: 'lg', md: 'xl' }}
                  fontWeight='medium'
                  color='rgba(255,255,255,0.55)'
                  maxW='2xl'
                  mx='auto'
                  lineHeight='1.6'
                  letterSpacing='-0.01em'
                  mb={10}
               >
                  Salaries, co-op reviews, professors, and course planning —
                  <Box as='span' display='block' mt={2} color='rgba(255,255,255,0.75)' fontWeight='semibold'>
                     No paywall. No signups. Just value.
                  </Box>
               </Text>

               {/* CTAs */}
               <Flex className='landing-fade-up landing-fade-up-delay-2' justify='center' gap={3} flexWrap='wrap'>
                  <Button
                     colorPalette='teal' size='lg' borderRadius='full' px={8}
                     boxShadow='0 0 40px rgba(20,184,166,0.25)'
                     onClick={() => navigate({ to: '/courses/explore' })}
                  >
                     Explore courses <Icon as={ArrowRightIcon} boxSize={4} />
                  </Button>
                  <Button
                     variant='outline' size='lg' borderRadius='full' px={8}
                     borderColor='rgba(255,255,255,0.15)' color='rgba(255,255,255,0.7)'
                     _hover={{ borderColor: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)' }}
                     onClick={() => navigate({ to: '/salary' })}
                  >
                     Submit salary data
                  </Button>
               </Flex>
            </Container>
         </Box>

         {/* ── Stats ── */}
         <Box borderTopWidth='1px' borderBottomWidth='1px' borderColor='rgba(255,255,255,0.07)'>
            <Container maxW='5xl' px={{ base: 4, md: 8 }}>
               <Flex>
                  <StatBadge value='240+' label='salaries' accent='teal' />
                  <Box w='1px' bg='rgba(255,255,255,0.07)' my={4} />
                  <StatBadge value='800+'   label='professor ratings'  accent='yellow' />
                  <Box w='1px' bg='rgba(255,255,255,0.07)' my={4} />
                  <StatBadge value='1,200+' label='co-op reviews'      accent='blue'   />
                  <Box w='1px' bg='rgba(255,255,255,0.07)' my={4} />
                  <StatBadge value='5,000+' label='courses indexed'    accent='purple' />
               </Flex>
            </Container>
         </Box>

         {/* ── Feature bento grid ── */}
         <Container maxW='7xl' px={{ base: 4, md: 8 }} py={{ base: 10, md: 16 }}>
            <Box textAlign='center' mb={10}>
               <Text
                  fontSize='xs' fontWeight='semibold' letterSpacing='0.14em'
                  textTransform='uppercase' color='rgba(255,255,255,0.3)' mb={3}
               >
                  Everything you need
               </Text>
               <Heading fontFamily='body' fontSize={{ base: '2xl', md: '3xl' }} fontWeight='700' letterSpacing='-0.03em'>
                  The Drexel tools you actually wanted
               </Heading>
            </Box>

            {/* Salary auto-fill — featured at top */}
            <Box mb={4}>
               <BentoCard to='/salary' accent='green' span={2}>
                  <Box p={6}>
                     <CardLabel accent='green'>Salary auto-fill</CardLabel>
                     <CardTitle>Screenshot your DrexelOne offer page → salary entries in seconds</CardTitle>
                     <CardDesc>
                        OCR reads your co-op rankings screenshot and pre-fills every offer as a draft. Review and submit in one click — no manual typing.
                     </CardDesc>
                     <Box mt={6}>
                        <FlowSteps accent='green' steps={[
                           {
                              icon: <UploadIcon size={22} color='#4ade80' />,
                              label: 'Drop screenshot',
                              sub: 'DrexelOne offer page PNG or PDF',
                           },
                           {
                              icon: <AutoFillIcon size={22} color='#4ade80' />,
                              label: 'OCR extracts data',
                              sub: 'Company, role, pay — automatically',
                           },
                           {
                              icon: <SalaryIcon size={22} color='#4ade80' />,
                              label: 'Review drafts',
                              sub: '3 entries pre-filled, ready to submit',
                           },
                        ]} />
                     </Box>
                     <OpenLink accent='green' />
                  </Box>
               </BentoCard>
            </Box>

            {/* Row 1 — Search (wide) + Professors */}
            <Grid
               templateColumns={{ base: '1fr', md: '1.6fr 1fr' }}
               gap={4}
               mb={4}
            >
               <BentoCard to='/courses/explore' accent='teal'>
                  <Box p={6}>
                     <CardLabel accent='teal'>Course search</CardLabel>
                     <CardTitle>Instant search across every Drexel section</CardTitle>
                     <CardDesc>Type a course code, filter by day, time, or instructor rating. Results in milliseconds.</CardDesc>
                     <Flex gap={2} mt={3} mb={5} flexWrap='wrap'>
                        <Chip accent='teal'>Fall 2026</Chip>
                        <Chip accent='teal'>4+ ★ instructor</Chip>
                        <Chip accent='teal'>Seats open</Chip>
                     </Flex>
                     <SearchVisual accent='teal' query='CS 283' rows={[
                        { label: 'CS 283 · Systems Programming', sub: '4 cr · Writing Intensive', right: 'EXACT' },
                        { label: 'CS 283-001 · Mon/Wed 10:00', sub: 'Korman 116', right: '★ 4.3' },
                        { label: 'CS 283-002 · Tue/Thu 14:00', sub: 'URBN 340', right: '3 seats left' },
                     ]} />
                     <OpenLink accent='teal' />
                  </Box>
               </BentoCard>

               <BentoCard to='/professors' accent='yellow'>
                  <Box p={6}>
                     <CardLabel accent='yellow'>Professors</CardLabel>
                     <CardTitle>Ratings, difficulty, and RMP — all in one click</CardTitle>
                     <CardDesc>Know who teaches well before you register.</CardDesc>
                     <Box mt={5}>
                        <RatingVisual score={4.6} accent='yellow' />
                     </Box>
                     <OpenLink accent='yellow' />
                  </Box>
               </BentoCard>
            </Grid>

            {/* Row 2 — Companies + Reviews (wide) */}
            <Grid
               templateColumns={{ base: '1fr', md: '1fr 1.6fr' }}
               gap={4}
               mb={4}
            >
               <BentoCard to='/companies' accent='blue'>
                  <Box p={6}>
                     <CardLabel accent='blue'>Companies</CardLabel>
                     <CardTitle>Search fast. Add missing ones instantly.</CardTitle>
                     <CardDesc>Omega scores, recommendation rates, and Philly-area filters.</CardDesc>
                     <Box mt={5}>
                        <ScoreRow name='Comcast' sub='48 reviews · 81% recommend' score={72} accent='blue' />
                        <ScoreRow name='Lockheed Martin' sub='29 reviews · 76% recommend' score={68} accent='blue' />
                        <ScoreRow name='Vanguard' sub='21 reviews · 90% recommend' score={74} accent='blue' />
                     </Box>
                     <OpenLink accent='blue' />
                  </Box>
               </BentoCard>

               <BentoCard to='/companies' accent='blue'>
                  <Box p={6}>
                     <CardLabel accent='blue'>Co-op reviews</CardLabel>
                     <CardTitle>Honest student writeups, position by position</CardTitle>
                     <CardDesc>Not just aggregate scores — real paragraphs from students who held the role.</CardDesc>
                     {/* Pull-quote */}
                     <Box
                        mt={5}
                        p={4}
                        borderRadius='xl'
                        borderWidth='1px'
                        borderColor='rgba(59,130,246,0.25)'
                        bg='rgba(59,130,246,0.07)'
                        position='relative'
                     >
                        <Text
                           fontSize='3xl'
                           color='rgba(59,130,246,0.3)'
                           lineHeight='1'
                           position='absolute'
                           top={2}
                           left={4}
                           fontFamily='Georgia, serif'
                        >
                           "
                        </Text>
                        <Text fontSize='sm' color='rgba(255,255,255,0.7)' lineHeight='1.75' pt={3}>
                           Real ownership on a production team — shipped a feature to 10M+ users in week 3.
                        </Text>
                        <Flex gap={2} mt={3} flexWrap='wrap'>
                           <Chip accent='blue'>$28/hr</Chip>
                           <Chip accent='blue'>84% recommend</Chip>
                           <Chip accent='blue'>Spring 2026</Chip>
                        </Flex>
                     </Box>
                     <OpenLink accent='blue' />
                  </Box>
               </BentoCard>
            </Grid>

            {/* Row 3 — Plan + Prereqs */}
            <Grid
               templateColumns={{ base: '1fr', md: '1.4fr 1fr' }}
               gap={4}
            >
               <BentoCard to='/courses/plan' accent='orange'>
                  <Box p={6}>
                     <CardLabel accent='orange'>Course planner</CardLabel>
                     <CardTitle>Build your schedule · catch conflicts before they happen</CardTitle>
                     <CardDesc>Drag courses in, see credit totals, get instant conflict warnings.</CardDesc>
                     <Box mt={5}>
                        <WeekGrid />
                     </Box>
                     <OpenLink accent='orange' />
                  </Box>
               </BentoCard>

               <BentoCard to='/courses/explore' accent='purple'>
                  <Box p={6}>
                     <CardLabel accent='purple'>Prerequisite graph</CardLabel>
                     <CardTitle>See what you need — and what you unlock</CardTitle>
                     <CardDesc>Interactive AND/OR prereq graph for every course. Plan smarter, avoid surprises.</CardDesc>
                     <Box mt={6} px={2}>
                        <NodeGraph />
                     </Box>
                     <OpenLink accent='purple' />
                  </Box>
               </BentoCard>
            </Grid>
         </Container>

         {/* ── Mission ── */}
         <SectionDivider />
         <Box position='relative' overflow='hidden'>
            <Box
               position='absolute' inset={0}
               background='radial-gradient(ellipse 60% 60% at 50% 50%, rgba(20,184,166,0.08), transparent 70%)'
               pointerEvents='none'
            />
            <Container maxW='3xl' px={{ base: 4, md: 8 }} py={{ base: 16, md: 24 }} textAlign='center' position='relative'>
               <Text
                  fontSize='xs' fontWeight='semibold' letterSpacing='0.14em'
                  textTransform='uppercase' color='rgba(20,184,166,0.7)' mb={4}
               >
                  Our mission
               </Text>
               <Heading
                  fontFamily='body'
                  fontSize={{ base: '2xl', md: '3.5xl' }}
                  fontWeight='700'
                  letterSpacing='-0.03em'
                  lineHeight='1.2'
                  mb={5}
               >
                  Every entry you add helps the{' '}
                  <Box as='span' color='#2dd4bf'>
                     next dragon.
                  </Box>
               </Heading>
               <Text fontSize='md' color='rgba(255,255,255,0.45)' lineHeight='1.85' mb={4}>
                  Every salary entry, co-op review, and professor rating compounds. The student who gets their first offer next year benefits from what you add today.
               </Text>
               <Text fontSize='md' color='rgba(255,255,255,0.45)' lineHeight='1.85' mb={10}>
                  Drexel's co-op program is elite. Navigating it shouldn't feel like a black box. OpenMario is how we open it — together.
               </Text>
               <Button
                  colorPalette='teal' variant='outline' size='lg'
                  borderRadius='full' px={8}
                  onClick={() => navigate({ to: '/salary' })}
               >
                  Contribute your data <Icon as={ArrowRightIcon} boxSize={4} />
               </Button>
            </Container>
         </Box>

         {/* ── Final CTA ── */}
         <SectionDivider />
         <Container maxW='5xl' px={{ base: 4, md: 8 }} py={{ base: 12, md: 16 }} textAlign='center'>
            <Heading fontFamily='body' fontSize={{ base: '2xl', md: '4xl' }} fontWeight='700' letterSpacing='-0.03em' mb={4}>
               Ready to get started?
            </Heading>
            <Text fontSize='md' color='rgba(255,255,255,0.4)' mb={10}>
               No paywall. No signups. Just open the app.
            </Text>
            <Grid templateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }} gap={4} mb={10}>
               {[
                  { icon: SearchIcon,    label: 'Explore courses',     sub: 'Search every section, filter by rating', to: '/courses/explore', accent: 'teal'   as const },
                  { icon: BriefcaseIcon, label: 'Review your co-op',   sub: 'Write a review and help the next student',to: '/companies',       accent: 'blue'   as const },
                  { icon: SalaryIcon,    label: 'Submit salary',       sub: 'Auto-fill from a screenshot',            to: '/salary',          accent: 'green'  as const },
               ].map(item => (
                  <Link key={item.label} to={item.to as '/salary'} preload='intent' style={{ textDecoration: 'none' }}>
                     <Flex
                        direction='column'
                        align='center'
                        gap={3}
                        p={6}
                        borderRadius='2xl'
                        borderWidth='1px'
                        borderColor='rgba(255,255,255,0.1)'
                        bg='rgba(255,255,255,0.03)'
                        transition='all 0.2s'
                        _hover={{ bg: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.18)', transform: 'translateY(-2px)' }}
                        h='full'
                     >
                        <Flex
                           w='48px' h='48px' borderRadius='xl'
                           bg={`rgba(${item.accent === 'teal' ? '20,184,166' : item.accent === 'blue' ? '59,130,246' : '34,197,94'},0.12)`}
                           borderWidth='1px'
                           borderColor={`rgba(${item.accent === 'teal' ? '20,184,166' : item.accent === 'blue' ? '59,130,246' : '34,197,94'},0.3)`}
                           align='center' justify='center'
                        >
                           <item.icon size={22} color={item.accent === 'teal' ? '#2dd4bf' : item.accent === 'blue' ? '#60a5fa' : '#4ade80'} />
                        </Flex>
                        <Box textAlign='center'>
                           <Text fontWeight='semibold' color='white' mb={1}>{item.label}</Text>
                           <Text fontSize='sm' color='rgba(255,255,255,0.4)'>{item.sub}</Text>
                        </Box>
                     </Flex>
                  </Link>
               ))}
            </Grid>
            <Button
               colorPalette='teal' size='xl' borderRadius='full' px={12}
               boxShadow='0 0 60px rgba(20,184,166,0.2)'
               onClick={() => navigate({ to: '/courses/explore' })}
            >
               Open the app <Icon as={ArrowRightIcon} boxSize={5} />
            </Button>
         </Container>

         {/* ── Shaft memorial ── */}
         <SectionDivider />
         <Box bg='#040506'>
            <Container maxW='3xl' px={{ base: 4, md: 8 }} py={{ base: 12, md: 16 }}>
               <Flex direction='column' align='center' gap={5}>
                  <Flex align='center' gap={2} color='rgba(255,255,255,0.25)'>
                     <Icon as={ShaftIcon} boxSize={3.5} />
                     <Text fontSize='xs' letterSpacing='0.2em' fontFamily='mono' textTransform='uppercase'>
                        ☠ RIP Drexel Shaft · Nov 15, 2009
                     </Text>
                  </Flex>
                  <Box
                     w='full' borderRadius='2xl' overflow='hidden'
                     borderWidth='1px' borderColor='rgba(255,255,255,0.08)'
                     boxShadow='0 24px 60px rgba(0,0,0,0.5)'
                     aspectRatio='16/9'
                  >
                     <iframe
                        title='In memoriam — Drexel Shaft'
                        width='100%' height='100%'
                        src='https://www.youtube.com/embed/GzKJCVJHcbk?autoplay=0&rel=0&modestbranding=1'
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen loading='lazy'
                        style={{ display: 'block' }}
                     />
                  </Box>
                  <Separator borderColor='rgba(255,255,255,0.07)' />
                  <Text
                     fontSize='sm' color='rgba(255,255,255,0.3)' fontFamily='mono'
                     textAlign='center' fontStyle='italic' maxW='md' lineHeight='1.8'
                  >
                     "The shaft may be dead, but the suffering lives on"
                     <br />— OpenMario exists so you can fight back.
                  </Text>
               </Flex>
            </Container>
         </Box>

         {/* ── Footer ── */}
         <Flex as='footer' justify='center' align='center' gap={4} py={6} borderTopWidth='1px' borderColor='rgba(255,255,255,0.06)'>
            <Text fontSize='xs' color='rgba(255,255,255,0.2)'>Not affiliated with Drexel University</Text>
            <Box w='1px' h='3' bg='rgba(255,255,255,0.1)' />
            <Text fontSize='xs' color='rgba(255,255,255,0.2)'>Open source</Text>
            <Box w='1px' h='3' bg='rgba(255,255,255,0.1)' />
            <Text fontSize='xs' color='rgba(255,255,255,0.2)'>Free forever</Text>
         </Flex>

      </Box>
   );
}
