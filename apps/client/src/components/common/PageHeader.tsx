import { Flex, Icon, IconButton, Image, Skeleton, Text } from '@chakra-ui/react';
import { Link, useMatches, useNavigate } from '@tanstack/react-router';
import { LuChevronRight, LuMenu, LuMoon, LuSun } from 'react-icons/lu';
import { useState, useEffect } from 'react';
import { useColorMode, useColorModeValue } from '@/components/ui/color-mode';
import { Tooltip } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks';
import { useSidebarStore } from '@/components/nav/sidebarStore';

function HomeButton() {
   return (
      <Link to='/salary' style={{ flexShrink: 0, textDecoration: 'none' }}>
         <Image
            src='/om-logo.png'
            h='20px'
            w='auto'
            alt='OpenMario'
            fit='contain'
            flexShrink={0}
            mt='4px'
         />
      </Link>
   );
}

type Crumb = { title: string; pathname: string };

function Breadcrumbs() {
   const matches = useMatches();
   const isMobile = useMobile();
   const navigate = useNavigate();
   const [crumbs, setCrumbs] = useState<Crumb[]>([]);
   const [loading, setLoading] = useState(true);

   const separatorColor = useColorModeValue('gray.300', 'gray.600');
   const activeColor = useColorModeValue('gray.800', 'gray.100');
   const mutedColor = useColorModeValue('gray.400', 'gray.500');

   useEffect(() => {
      let cancelled = false;

      const labeled: { pathname: string; getLabel: () => string | Promise<string> }[] = [];
      let prev: unknown = undefined;
      for (const m of matches) {
         const getLabel = (m.context as any).getLabel;
         if (getLabel && getLabel !== prev) {
            labeled.push({ pathname: m.pathname, getLabel });
         }
         prev = getLabel;
      }

      setLoading(true);
      Promise.all(
         labeled.map(async ({ pathname, getLabel }) => ({
            pathname,
            title: await Promise.resolve(getLabel()),
         }))
      ).then(resolved => {
         if (!cancelled) {
            setCrumbs(resolved);
            setLoading(false);
         }
      });

      return () => { cancelled = true; };
   }, [matches]);

   if (loading && crumbs.length === 0) {
      return <Skeleton h='20px' w='140px' borderRadius='sm' />;
   }

   const showEllipsis = isMobile && crumbs.length > 2;
   const visibleCrumbs = showEllipsis ? crumbs.slice(-2) : crumbs;

   return (
      <Flex align='center' gap={1} minW={0} overflow='hidden'>
         {!showEllipsis && <HomeButton />}

         {showEllipsis && (
            <>
               <Text
                  fontSize='sm'
                  color={mutedColor}
                  cursor='pointer'
                  onClick={() => navigate({ to: '/salary' })}
                  flexShrink={0}
               >
                  ...
               </Text>
               <Icon as={LuChevronRight} color={separatorColor} boxSize={3} flexShrink={0} />
            </>
         )}

         {!showEllipsis && crumbs.length > 0 && (
            <Icon as={LuChevronRight} color={separatorColor} boxSize={3} flexShrink={0} />
         )}

         {visibleCrumbs.map((crumb, i) => {
            const isLast = i === visibleCrumbs.length - 1;
            return (
               <Flex key={crumb.pathname} align='center' gap={1} minW={0} overflow='hidden'>
                  {isLast ? (
                     <Text
                        fontSize='sm'
                        fontWeight='medium'
                        color={activeColor}
                        textTransform='capitalize'
                        truncate
                        maxW={{ base: '140px', md: '220px' }}
                     >
                        {crumb.title}
                     </Text>
                  ) : (
                     <>
                        <Text
                           as='span'
                           fontSize='sm'
                           fontWeight='normal'
                           color={mutedColor}
                           textDecoration='underline'
                           textUnderlineOffset='2px'
                           textTransform='capitalize'
                           cursor='pointer'
                           _hover={{ color: activeColor }}
                           truncate
                           maxW={{ base: '100px', md: '160px' }}
                           onClick={() => navigate({ to: crumb.pathname as any })}
                        >
                           {crumb.title}
                        </Text>
                        <Icon as={LuChevronRight} color={separatorColor} boxSize={3} flexShrink={0} />
                     </>
                  )}
               </Flex>
            );
         })}
      </Flex>
   );
}

export function PageHeader() {
   const { colorMode, toggleColorMode } = useColorMode();
   const { setDrawerOpen } = useSidebarStore();
   const borderColor = useColorModeValue('rgba(0,0,0,0.08)', 'rgba(255,255,255,0.08)');
   const bg = useColorModeValue('rgba(255,255,255,0.85)', 'rgba(9,9,11,0.85)');

   return (
      <Flex
         as='header'
         h='52px'
         align='center'
         justify='space-between'
         px={{ base: 4, md: 5 }}
         gap={3}
         flexShrink={0}
         bg={bg}
         borderBottomWidth='1px'
         borderColor={borderColor}
         position='sticky'
         top={0}
         zIndex='docked'
         css={{ backdropFilter: 'blur(12px)' }}
      >
         <Flex align='center' gap={2} minW={0} flex={1} overflow='hidden'>
            {/* Tablet-only hamburger — lives here so it never overlaps the logo */}
            <IconButton
               aria-label='Open menu'
               variant='ghost'
               size='sm'
               borderRadius='lg'
               display={{ base: 'none', sm: 'flex', md: 'none' }}
               color='fg.muted'
               _hover={{ color: 'fg', bg: 'bg.muted' }}
               flexShrink={0}
               onClick={() => setDrawerOpen(true)}
            >
               <LuMenu size={16} />
            </IconButton>
            <Breadcrumbs />
         </Flex>

         <Tooltip content={colorMode === 'light' ? 'Dark mode' : 'Light mode'} placement='left'>
            <IconButton
               aria-label='Toggle color mode'
               variant='ghost'
               size='sm'
               borderRadius='lg'
               onClick={toggleColorMode}
               flexShrink={0}
               color='fg.muted'
               _hover={{ color: 'fg', bg: 'bg.muted' }}
            >
               {colorMode === 'light' ? <LuMoon size={15} /> : <LuSun size={15} />}
            </IconButton>
         </Tooltip>
      </Flex>
   );
}
