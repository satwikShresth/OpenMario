import { Box, Container, Flex, Text, VStack } from '@chakra-ui/react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
   interface Window {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      YT: any;
      onYouTubeIframeAPIReady: () => void;
   }
}

const KEYFRAMES = `
@keyframes quake {
  0%   { transform: translate(0,0) rotate(0deg); }
  10%  { transform: translate(-6px, 4px) rotate(-0.5deg); }
  20%  { transform: translate(8px, -5px) rotate(0.5deg); }
  30%  { transform: translate(-5px, 6px) rotate(-0.3deg); }
  40%  { transform: translate(7px, -3px) rotate(0.4deg); }
  50%  { transform: translate(-4px, 5px) rotate(-0.2deg); }
  60%  { transform: translate(6px, -4px) rotate(0.3deg); }
  70%  { transform: translate(-3px, 3px) rotate(-0.1deg); }
  80%  { transform: translate(4px, -2px) rotate(0.2deg); }
  90%  { transform: translate(-2px, 2px) rotate(-0.1deg); }
  100% { transform: translate(0,0) rotate(0deg); }
}
@keyframes flashIn {
  0%   { opacity: 0; }
  20%  { opacity: 0.9; }
  100% { opacity: 0; }
}
@keyframes scanroll {
  from { background-position: 0 0; }
  to   { background-position: 0 100%; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes glitchIn {
  0%   { opacity: 0; clip-path: inset(40% 0 40% 0); letter-spacing: 0.5em; }
  30%  { opacity: 1; clip-path: inset(0% 0 60% 0); letter-spacing: 0.1em; }
  60%  { clip-path: inset(50% 0 0% 0); letter-spacing: 0.05em; }
  100% { opacity: 1; clip-path: inset(0 0 0 0); letter-spacing: -0.02em; }
}
`;

// ─── Inline fade wrapper ──────────────────────────────────────────────────
function Reveal({ show, delay = 0, children, animation = 'fadeIn 2.5s ease-in-out forwards' }: {
   show: boolean;
   delay?: number;
   children: React.ReactNode;
   animation?: string;
}) {
   return (
      <Box
         style={{
            opacity: show ? undefined : 0,
            pointerEvents: show ? undefined : 'none',
            animation: show ? animation : undefined,
            animationDelay: show ? `${delay}ms` : undefined,
            animationFillMode: 'forwards',
         }}
      >
         {children}
      </Box>
   );
}


// ─── Shaft video ──────────────────────────────────────────────────────────
function DrexelShaftVideo({ onDrop, onStop }: { onDrop: () => void; onStop: () => void }) {
   const containerRef = useRef<HTMLDivElement>(null);
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const playerRef = useRef<any>(null);
   const droppedRef = useRef(false);

   useEffect(() => {
      const init = () => {
         if (!containerRef.current) return;
         playerRef.current = new window.YT.Player(containerRef.current, {
            videoId: 'GzKJCVJHcbk',
            playerVars: { autoplay: 1, mute: 1, loop: 1, playlist: 'GzKJCVJHcbk', controls: 1, modestbranding: 1, rel: 0 },
            events: {
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               onReady: (e: any) => {
                  e.target.setPlaybackRate(2);
                  e.target.setVolume(0);
                  e.target.unMute();
                  e.target.playVideo();
                  const DROP       = 37.1;
                  const VOL_START  = 10;   // volume ramp starts
                  const SLOW_START = 25;   // speed ramp starts
                  const poll = setInterval(() => {
                     if (!playerRef.current?.getCurrentTime) return;
                     const t = playerRef.current.getCurrentTime();
                     // gradually increase volume from 10s → impact
                     if (t >= VOL_START && !droppedRef.current) {
                        const pct = Math.min((t - VOL_START) / (DROP - VOL_START), 1);
                        playerRef.current.setVolume(Math.round(pct * 100));
                     }
                     // gradually slow from 2x → 1x between 25s → impact
                     if (t >= SLOW_START && !droppedRef.current) {
                        const pct = Math.min((t - SLOW_START) / (DROP - SLOW_START), 1);
                        playerRef.current.setPlaybackRate(2 - pct);
                     }
                     // building hits ground at 37.1s
                     if (t >= DROP && !droppedRef.current) {
                        droppedRef.current = true;
                        playerRef.current.setPlaybackRate(1);
                        playerRef.current.setVolume(100);
                        onDrop();
                     }
                     // freeze at 1:31
                     if (t >= 91) {
                        playerRef.current.pauseVideo();
                        clearInterval(poll);
                        onStop();
                     }
                  }, 200);
               },
            },
         });
      };
      const prev = window.onYouTubeIframeAPIReady;
      if (window.YT?.Player) { init(); }
      else {
         window.onYouTubeIframeAPIReady = () => { prev?.(); init(); };
         if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
         }
      }
   }, [onDrop, onStop]);

   return (
      <Box
         borderRadius='lg' overflow='hidden' borderWidth='1px' borderColor='#1a1a1a'
         style={{
            aspectRatio: '16/9',
         }}
      >
         <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </Box>
   );
}

const TOOLS = [
   { emoji: '🏢', label: 'co-op reviews', to: '/companies' },
   { emoji: '📚', label: 'courses',        to: '/courses/explore' },
   { emoji: '👨‍🏫', label: 'professors',     to: '/professors' },
];

type Phase = 'before' | 'impact' | 'after';

const SHAFT_KEY = 'shaft-seen';

export function Landing() {
   const navigate                     = useNavigate();
   const [phase, setPhase]            = useState<Phase>('before');
   const [showTitle,   setShowTitle]  = useState(false);
   const [showQuote,   setShowQuote]  = useState(false);
   const [showTools,   setShowTools]  = useState(false);
   const [showNav,     setShowNav]    = useState(false);

   const [glitch, setGlitch]          = useState(false);

   useEffect(() => {
      if (localStorage.getItem(SHAFT_KEY)) {
         navigate({ to: '/salary' });
      }
   }, [navigate]);

   useEffect(() => {
      if (!document.getElementById('landing-keyframes')) {
         const s = document.createElement('style');
         s.id = 'landing-keyframes';
         s.textContent = KEYFRAMES;
         document.head.appendChild(s);
      }
   }, []);

   // glitch flicker on title once it's visible
   useEffect(() => {
      if (!showTitle) return;
      const id = setInterval(() => {
         setGlitch(true);
         setTimeout(() => setGlitch(false), 120);
      }, 3500 + Math.random() * 2500);
      return () => clearInterval(id);
   }, [showTitle]);

   const handleDrop = useCallback(() => {
      localStorage.setItem(SHAFT_KEY, '1');
      setPhase('impact');
      setTimeout(() => setPhase('after'),  900);
      setTimeout(() => setShowTitle(true), 1000);
      setTimeout(() => setShowQuote(true), 1600);
      setTimeout(() => setShowTools(true), 2200);
      setTimeout(() => setShowNav(true),   2800);
   }, []);

   const handleStop = useCallback(() => {}, []);


   const isAfter  = phase === 'after';
   const isImpact = phase === 'impact';

   return (
      <Box
         minH='100dvh'
         bg='#000'
         color='#e0e0e0'
         fontFamily='mono'
         position='relative'
         style={{ animation: isImpact ? 'quake 0.85s ease-out' : undefined }}
      >
         {/* flash */}
         {isImpact && (
            <Box position='fixed' inset='0' bg='white' zIndex={9999} pointerEvents='none'
               style={{ animation: 'flashIn 0.85s ease-out forwards' }} />
         )}

         {/* scanlines */}
         {isAfter && (
            <Box position='fixed' inset='0' zIndex={9998} pointerEvents='none'
               style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)',
                  backgroundSize: '100% 4px',
                  animation: 'scanroll 8s linear infinite',
               }} />
         )}

         {/* eerie ambient drone — plays until impact */}


         {/* nav — hidden until after drop */}
         <Reveal show={showNav}>
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
         </Reveal>

         <Container maxW='5xl' py={{ base: 4, md: 6 }}>
            <VStack gap={4} align='stretch'>

               {/* title — hidden until after drop */}
               <Reveal show={showTitle} animation='glitchIn 1.4s ease-in-out forwards'>
                  <VStack gap={1} textAlign='center'>
                     <Text
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight='black'
                        lineHeight='1'
                        letterSpacing='tight'
                        color={glitch ? '#ff3333' : '#fff'}
                        transition='color 60ms'
                        style={{ textShadow: glitch ? '3px 0 #ff3333, -3px 0 #0ff' : 'none' }}
                     >
                        ☠ RIP DREXEL SHAFT
                     </Text>
                     <Text fontSize='xs' color='#666' letterSpacing='widest'>
                        NOV 15, 2009
                     </Text>
                  </VStack>
               </Reveal>

               {/* video */}
               <DrexelShaftVideo onDrop={handleDrop} onStop={handleStop} />

               {/* quote */}
               <Reveal show={showQuote} delay={0}>
                  <Box textAlign='center' py={3} px={4} borderTopWidth='1px' borderBottomWidth='1px' borderColor='#1a1a1a'>
                     <Text fontSize={{ base: 'sm', md: 'md' }} color='#ccc' lineHeight='1.7' fontStyle='italic'>
                        "The Drexel shaft may be dead,<br />
                        but the suffering it brings to us students<br />
                        still lives on"
                     </Text>
                     <Text fontSize='xs' color='#666' mt={3}>— @StanMangamer · 4 years ago</Text>
                  </Box>
               </Reveal>

               {/* tools */}
               <Reveal show={showTools}>
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
               </Reveal>

               {showNav && (
                  <Text fontSize='xs' color='#444' textAlign='center'>
                     not affiliated with drexel university
                  </Text>
               )}

            </VStack>
         </Container>
      </Box>
   );
}
