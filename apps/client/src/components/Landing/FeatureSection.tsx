import type { ReactNode } from 'react';
import { Box, Flex, Grid, Icon, Text } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { ArrowRightIcon } from '@/components/icons';

export type LandingRoute =
   | '/salary'
   | '/salary/auto-fill'
   | '/companies'
   | '/courses/explore'
   | '/professors'
   | '/courses/plan';

/* ─── Accent palette ─────────────────────────────────────────────────────── */
type Accent = 'teal' | 'yellow' | 'blue' | 'green' | 'orange' | 'purple';

const PALETTE: Record<Accent, { glow: string; border: string; text: string; bg: string; dim: string }> = {
   teal:   { glow: 'rgba(20,184,166,0.15)',  border: 'rgba(20,184,166,0.3)',   text: '#2dd4bf', bg: 'rgba(20,184,166,0.08)',  dim: 'rgba(20,184,166,0.4)'  },
   yellow: { glow: 'rgba(234,179,8,0.13)',   border: 'rgba(234,179,8,0.28)',   text: '#fbbf24', bg: 'rgba(234,179,8,0.07)',   dim: 'rgba(234,179,8,0.4)'   },
   blue:   { glow: 'rgba(59,130,246,0.14)',  border: 'rgba(59,130,246,0.28)',  text: '#60a5fa', bg: 'rgba(59,130,246,0.07)',  dim: 'rgba(59,130,246,0.4)'  },
   green:  { glow: 'rgba(34,197,94,0.13)',   border: 'rgba(34,197,94,0.27)',   text: '#4ade80', bg: 'rgba(34,197,94,0.07)',   dim: 'rgba(34,197,94,0.4)'   },
   orange: { glow: 'rgba(249,115,22,0.13)',  border: 'rgba(249,115,22,0.27)',  text: '#fb923c', bg: 'rgba(249,115,22,0.07)',  dim: 'rgba(249,115,22,0.4)'  },
   purple: { glow: 'rgba(168,85,247,0.13)',  border: 'rgba(168,85,247,0.27)',  text: '#c084fc', bg: 'rgba(168,85,247,0.07)',  dim: 'rgba(168,85,247,0.4)'  },
};

/* ─── BentoCard — base card container ───────────────────────────────────── */
export function BentoCard({
   to,
   accent = 'teal',
   children,
   span,
}: {
   to: LandingRoute;
   accent?: Accent;
   children: ReactNode;
   /** 1 = normal, 2 = spans 2 columns on md+ */
   span?: 1 | 2;
}) {
   const p = PALETTE[accent];
   return (
      <Link
         to={to}
         preload='intent'
         style={{ textDecoration: 'none', gridColumn: span === 2 ? 'span 2' : undefined }}
      >
         <Box
            h='full'
            borderRadius='2xl'
            borderWidth='1px'
            borderColor={p.border}
            bg={`radial-gradient(ellipse 80% 60% at 20% 20%, ${p.glow}, transparent 70%)`}
            backgroundColor='#0d1117'
            overflow='hidden'
            position='relative'
            transition='transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease'
            _hover={{
               transform: 'translateY(-3px)',
               boxShadow: `0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px ${p.border}`,
            }}
         >
            {children}
         </Box>
      </Link>
   );
}

/* ─── CardLabel / CardTitle / CardBody ──────────────────────────────────── */
export function CardLabel({ children, accent = 'teal' }: { children: ReactNode; accent?: Accent }) {
   return (
      <Text
         fontFamily='body'
         fontSize='2xs'
         fontWeight='semibold'
         letterSpacing='0.12em'
         textTransform='uppercase'
         color={PALETTE[accent].text}
         opacity={0.9}
      >
         {children}
      </Text>
   );
}

export function CardTitle({ children }: { children: ReactNode }) {
   return (
      <Text fontFamily='body' fontSize={{ base: 'lg', md: 'xl' }} fontWeight='semibold' color='white' lineHeight='1.3' letterSpacing='-0.02em' mt={1}>
         {children}
      </Text>
   );
}

export function CardDesc({ children }: { children: ReactNode }) {
   return (
      <Text fontFamily='body' fontSize='sm' color='rgba(255,255,255,0.45)' lineHeight='1.7' mt={2}>
         {children}
      </Text>
   );
}

/* ─── Chip — small pill tag ─────────────────────────────────────────────── */
export function Chip({ children, accent = 'teal' }: { children: ReactNode; accent?: Accent }) {
   const p = PALETTE[accent];
   return (
      <Box
         as='span'
         px={2.5}
         py={0.5}
         borderRadius='full'
         fontSize='xs'
         fontWeight='medium'
         color={p.text}
         bg={p.bg}
         borderWidth='1px'
         borderColor={p.border}
         display='inline-block'
      >
         {children}
      </Box>
   );
}

/* ─── OpenLink — the "→ Open" row ───────────────────────────────────────── */
export function OpenLink({ accent = 'teal' }: { accent?: Accent }) {
   return (
      <Flex align='center' gap={1} mt='auto' pt={4} color={PALETTE[accent].text} opacity={0.7} fontSize='xs' fontWeight='medium'>
         <Text>Open</Text>
         <Icon as={ArrowRightIcon} boxSize={3} />
      </Flex>
   );
}

/* ─── SearchVisual — glowing search bar with result rows ─────────────────── */
export function SearchVisual({ accent = 'teal', query = 'CS 283', rows }: {
   accent?: Accent;
   query?: string;
   rows: { label: string; sub: string; right?: string }[];
}) {
   const p = PALETTE[accent];
   return (
      <Box>
         {/* Search bar */}
         <Flex
            align='center'
            gap={2}
            px={3}
            py={2.5}
            borderRadius='lg'
            borderWidth='1px'
            borderColor={p.border}
            bg={p.bg}
            mb={3}
            boxShadow={`0 0 20px ${p.glow}`}
         >
            <Box w='14px' h='14px' borderRadius='full' borderWidth='1.5px' borderColor={p.dim} flexShrink={0} />
            <Text fontSize='sm' fontWeight='semibold' color={p.text} flex='1'>{query}</Text>
            <Box px={1.5} py={0.5} borderRadius='sm' bg={p.bg} borderWidth='1px' borderColor={p.border}>
               <Text fontSize='2xs' color={p.text} fontWeight='bold'>12ms</Text>
            </Box>
         </Flex>
         {/* Result rows */}
         {rows.map((r, i) => (
            <Flex
               key={i}
               py={2}
               px={2}
               borderRadius='md'
               mb={1}
               bg={i === 0 ? p.bg : 'rgba(255,255,255,0.03)'}
               borderWidth='1px'
               borderColor={i === 0 ? p.border : 'rgba(255,255,255,0.06)'}
               align='center'
               justify='space-between'
               gap={3}
            >
               <Box>
                  <Text fontSize='xs' fontWeight='semibold' color={i === 0 ? p.text : 'rgba(255,255,255,0.7)'}>{r.label}</Text>
                  <Text fontSize='2xs' color='rgba(255,255,255,0.35)'>{r.sub}</Text>
               </Box>
               {r.right && <Text fontSize='2xs' color='rgba(255,255,255,0.35)' flexShrink={0}>{r.right}</Text>}
            </Flex>
         ))}
      </Box>
   );
}

/* ─── StatGrid — big number tiles ───────────────────────────────────────── */
export function StatGrid({ stats, accent = 'teal' }: {
   accent?: Accent;
   stats: { value: string; label: string }[];
}) {
   const p = PALETTE[accent];
   return (
      <Grid templateColumns={`repeat(${stats.length}, 1fr)`} gap={2}>
         {stats.map(s => (
            <Box key={s.label} p={3} borderRadius='xl' bg={p.bg} borderWidth='1px' borderColor={p.border} textAlign='center'>
               <Text fontSize='2xl' fontWeight='black' color={p.text} lineHeight='1'>{s.value}</Text>
               <Text fontSize='2xs' color='rgba(255,255,255,0.35)' mt={1}>{s.label}</Text>
            </Box>
         ))}
      </Grid>
   );
}

/* ─── ScoreRow — company/item with a score bubble ───────────────────────── */
export function ScoreRow({ name, sub, score, accent = 'teal' }: {
   name: string;
   sub: string;
   score: number;
   accent?: Accent;
}) {
   const p = PALETTE[accent];
   return (
      <Flex align='center' gap={3} py={2.5} px={2} borderRadius='lg' bg='rgba(255,255,255,0.03)' borderWidth='1px' borderColor='rgba(255,255,255,0.06)' mb={1.5}>
         <Flex
            w='44px'
            h='44px'
            borderRadius='lg'
            bg={p.bg}
            borderWidth='1px'
            borderColor={p.border}
            align='center'
            justify='center'
            flexShrink={0}
         >
            <Text fontSize='xl' fontWeight='black' color={p.text} lineHeight='1'>{score}</Text>
         </Flex>
         <Box>
            <Text fontSize='sm' fontWeight='semibold' color='rgba(255,255,255,0.85)'>{name}</Text>
            <Text fontSize='xs' color='rgba(255,255,255,0.35)'>{sub}</Text>
         </Box>
      </Flex>
   );
}

/* ─── FlowSteps — numbered pipeline visual ──────────────────────────────── */
export function FlowSteps({ steps, accent = 'teal' }: {
   accent?: Accent;
   steps: { icon: ReactNode; label: string; sub: string }[];
}) {
   const p = PALETTE[accent];
   return (
      <Flex direction={{ base: 'column', sm: 'row' }} gap={3} align='stretch'>
         {steps.map((s, i) => (
            <Flex key={i} direction='row' align='center' gap={3} flex='1'>
               <Flex direction='column' align='center' gap={2} flex='1'>
                  <Flex
                     w='48px'
                     h='48px'
                     borderRadius='xl'
                     bg={p.bg}
                     borderWidth='1px'
                     borderColor={p.border}
                     align='center'
                     justify='center'
                     flexShrink={0}
                  >
                     {s.icon}
                  </Flex>
                  <Box textAlign='center'>
                     <Text fontSize='xs' fontWeight='semibold' color='rgba(255,255,255,0.8)'>{s.label}</Text>
                     <Text fontSize='2xs' color='rgba(255,255,255,0.35)' mt={0.5}>{s.sub}</Text>
                  </Box>
               </Flex>
               {i < steps.length - 1 && (
                  <Box
                     flexShrink={0}
                     display={{ base: 'none', sm: 'block' }}
                  >
                     <Text color={p.dim} fontSize='lg'>›</Text>
                  </Box>
               )}
            </Flex>
         ))}
      </Flex>
   );
}

/* ─── WeekGrid — mini calendar ───────────────────────────────────────────── */
export function WeekGrid() {
   const days = ['M', 'T', 'W', 'R', 'F'];
   const slots = [
      { h: 0, d: 0, color: '#2dd4bf', label: 'CS 283' },
      { h: 0, d: 2, color: '#2dd4bf', label: 'CS 283' },
      { h: 2, d: 1, color: '#818cf8', label: 'MATH' },
      { h: 2, d: 3, color: '#818cf8', label: 'MATH' },
      { h: 3, d: 0, color: '#f87171', label: 'CS 360' },
      { h: 3, d: 2, color: '#f87171', label: 'CS 360' },
   ];
   const rows = 5;

   return (
      <Box>
         <Grid templateColumns={`repeat(${days.length}, 1fr)`} gap={1} mb={1}>
            {days.map(d => (
               <Box key={d} textAlign='center'>
                  <Text fontSize='2xs' color='rgba(255,255,255,0.3)' fontWeight='bold'>{d}</Text>
               </Box>
            ))}
         </Grid>
         <Grid templateColumns={`repeat(${days.length}, 1fr)`} gap={1}>
            {Array.from({ length: rows * days.length }).map((_, idx) => {
               const row = Math.floor(idx / days.length);
               const col = idx % days.length;
               const slot = slots.find(s => s.h === row && s.d === col);
               return (
                  <Box
                     key={idx}
                     h='28px'
                     borderRadius='sm'
                     bg={slot ? `${slot.color}20` : 'rgba(255,255,255,0.04)'}
                     borderWidth='1px'
                     borderColor={slot ? `${slot.color}60` : 'rgba(255,255,255,0.07)'}
                     display='flex'
                     alignItems='center'
                     justifyContent='center'
                     overflow='hidden'
                  >
                     {slot && (
                        <Text fontSize='2xs' fontWeight='bold' color={slot.color} truncate px={1}>
                           {slot.label}
                        </Text>
                     )}
                  </Box>
               );
            })}
         </Grid>
         <Flex mt={2.5} gap={2} flexWrap='wrap'>
            {[
               { color: '#2dd4bf', label: 'CS 283' },
               { color: '#818cf8', label: 'MATH 321' },
               { color: '#f87171', label: 'CS 360 ⚠ conflict' },
            ].map(l => (
               <Flex key={l.label} align='center' gap={1}>
                  <Box w='6px' h='6px' borderRadius='sm' bg={l.color} flexShrink={0} />
                  <Text fontSize='2xs' color='rgba(255,255,255,0.4)'>{l.label}</Text>
               </Flex>
            ))}
         </Flex>
      </Box>
   );
}

/* ─── NodeGraph — prereq graph ───────────────────────────────────────────── */
export function NodeGraph() {
   return (
      <svg width='100%' height='120' viewBox='0 0 380 120' style={{ overflow: 'visible' }}>
         <defs>
            <marker id='ng-arrow' markerWidth='6' markerHeight='6' refX='5' refY='3' orient='auto'>
               <path d='M0,0 L6,3 L0,6 Z' fill='rgba(255,255,255,0.2)' />
            </marker>
            <marker id='ng-arrow-active' markerWidth='6' markerHeight='6' refX='5' refY='3' orient='auto'>
               <path d='M0,0 L6,3 L0,6 Z' fill='#c084fc' />
            </marker>
            <filter id='node-glow'>
               <feGaussianBlur stdDeviation='3' result='blur' />
               <feMerge><feMergeNode in='blur' /><feMergeNode in='SourceGraphic' /></feMerge>
            </filter>
         </defs>

         {/* Edges */}
         <line x1='92' y1='30' x2='188' y2='55' stroke='rgba(255,255,255,0.15)' strokeWidth='1.5' markerEnd='url(#ng-arrow)' />
         <line x1='92' y1='90' x2='188' y2='65' stroke='rgba(255,255,255,0.15)' strokeWidth='1.5' markerEnd='url(#ng-arrow)' />
         <line x1='248' y1='60' x2='316' y2='60' stroke='#c084fc' strokeWidth='2' markerEnd='url(#ng-arrow-active)' />

         {/* Prereq nodes */}
         {[
            { x: 10, y: 14, label: 'CS 164' },
            { x: 10, y: 74, label: 'CS 171' },
         ].map(n => (
            <g key={n.label}>
               <rect x={n.x} y={n.y} width='82' height='32' rx='8' fill='rgba(255,255,255,0.04)' stroke='rgba(255,255,255,0.15)' strokeWidth='1' />
               <text x={n.x + 41} y={n.y + 21} textAnchor='middle' fontSize='12' fontWeight='600' fill='rgba(255,255,255,0.55)'>{n.label}</text>
            </g>
         ))}

         {/* AND gate */}
         <rect x='196' y='44' width='52' height='32' rx='7' fill='rgba(168,85,247,0.12)' stroke='rgba(168,85,247,0.4)' strokeWidth='1' />
         <text x='222' y='65' textAnchor='middle' fontSize='11' fontWeight='700' fill='#c084fc'>AND</text>

         {/* Target node */}
         <g filter='url(#node-glow)'>
            <rect x='320' y='44' width='52' height='32' rx='8' fill='rgba(168,85,247,0.18)' stroke='#c084fc' strokeWidth='1.5' />
            <text x='346' y='65' textAnchor='middle' fontSize='12' fontWeight='700' fill='#c084fc'>CS 283</text>
         </g>
      </svg>
   );
}

/* ─── RatingVisual — star rating with bar breakdown ─────────────────────── */
export function RatingVisual({ score, accent = 'yellow' }: { score: number; accent?: Accent }) {
   const p = PALETTE[accent];
   const bars = [
      { label: 'Rating', value: score / 5 },
      { label: 'Difficulty', value: 0.64 },
      { label: 'Recommend', value: 0.88 },
   ];
   return (
      <Box>
         <Flex align='baseline' gap={2} mb={3}>
            <Text fontSize='5xl' fontWeight='black' color={p.text} lineHeight='1'>{score}</Text>
            <Text fontSize='lg' color='rgba(255,255,255,0.3)' fontWeight='medium'>/ 5</Text>
         </Flex>
         {bars.map(b => (
            <Box key={b.label} mb={2}>
               <Flex justify='space-between' mb={0.5}>
                  <Text fontSize='xs' color='rgba(255,255,255,0.4)'>{b.label}</Text>
                  <Text fontSize='xs' color={p.text} fontWeight='semibold'>{Math.round(b.value * 100)}%</Text>
               </Flex>
               <Box h='4px' borderRadius='full' bg='rgba(255,255,255,0.07)'>
                  <Box h='full' borderRadius='full' bg={p.text} w={`${b.value * 100}%`} />
               </Box>
            </Box>
         ))}
      </Box>
   );
}

/* ─── StatBadge — hero stats row ────────────────────────────────────────── */
export function StatBadge({ value, label, accent = 'teal' }: { value: string; label: string; accent?: Accent }) {
   const p = PALETTE[accent];
   return (
      <Flex direction='column' align='center' gap={1} px={4} py={5} flex='1'>
         <Text
            fontFamily='body'
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight='bold'
            color={p.text}
            lineHeight='1'
            letterSpacing='-0.03em'
         >
            {value}
         </Text>
         <Text fontFamily='body' fontSize='xs' color='rgba(255,255,255,0.35)' textAlign='center'>
            {label}
         </Text>
      </Flex>
   );
}

/* ─── SectionDivider ─────────────────────────────────────────────────────── */
export function SectionDivider() {
   return <Box h='1px' bgGradient='linear(to-r, transparent, whiteAlpha.100, transparent)' />;
}
