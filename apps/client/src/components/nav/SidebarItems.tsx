import { forwardRef } from 'react';
import type React from 'react';
import { Link, Box, Flex, Icon, Separator, Text } from '@chakra-ui/react';
import { Link as TLink, useNavigate, useRouterState } from '@tanstack/react-router';
import { GithubIcon, MessageCircleIcon, DatabaseIcon, ShaftIcon } from '@/components/icons';
import { useColorModeValue } from '@/components/ui/color-mode';
import { FeedbackDialog } from '@/components/common/Feedback';
import { DatabaseManagerDialog } from '@/components/common/DatabaseManager';
import { Tooltip } from '@/components/ui/tooltip';
import { NAV_GROUPS } from './items';

interface SidebarItemsProps {
   onClose?: () => void;
   minimized: boolean;
}

interface NavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement | HTMLDivElement> {
   icon: React.ElementType;
   label: string;
   minimized: boolean;
   isActive?: boolean;
   badge?: string;
}

const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
   ({ icon: IconComp, label, minimized, isActive = false, badge, ...props }, ref) => {
      const activeBg = useColorModeValue('rgba(0,0,0,0.06)', 'rgba(255,255,255,0.08)');
      const activeBorder = useColorModeValue('rgba(0,0,0,0.12)', 'rgba(255,255,255,0.12)');
      const hoverBg = useColorModeValue('rgba(0,0,0,0.04)', 'rgba(255,255,255,0.05)');

      return (
         <Flex
            ref={ref}
            as='button'
            w='full'
            align='center'
            justify={minimized ? 'center' : 'flex-start'}
            gap={2.5}
            px={minimized ? 0 : 3}
            py={2}
            borderRadius='lg'
            borderWidth='1px'
            borderColor={isActive ? activeBorder : 'transparent'}
            bg={isActive ? activeBg : 'transparent'}
            color={isActive ? 'fg' : 'fg.muted'}
            fontWeight={isActive ? 'semibold' : 'medium'}
            _hover={{ bg: isActive ? activeBg : hoverBg, color: 'fg', borderColor: isActive ? activeBorder : 'transparent' }}
            transition='all 0.15s ease'
            cursor='pointer'
            textAlign='left'
            outline='none'
            flexShrink={0}
            {...(props as any)}
         >
            <Icon
               as={IconComp}
               boxSize={4}
               color={isActive ? 'blue.500' : 'fg.muted'}
               flexShrink={0}
            />
            {!minimized && (
               <>
                  <Text fontSize='sm' flex='1' lineHeight='1' truncate>
                     {label}
                  </Text>
                  {badge && (
                     <Box
                        fontSize='2xs'
                        fontWeight='bold'
                        px={1.5}
                        py={0.5}
                        borderRadius='sm'
                        letterSpacing='wider'
                        bg='orange.subtle'
                        color='orange.fg'
                     >
                        {badge.toUpperCase()}
                     </Box>
                  )}
               </>
            )}
         </Flex>
      );
   },
);

const PRIMARY_GROUP_IDS = ['coop', 'academics'];

export function SidebarItems({ onClose, minimized }: SidebarItemsProps) {
   const pathname = useRouterState({ select: s => s.location.pathname });
   const navigate = useNavigate();

   const handleWatchShaft = () => {
      localStorage.removeItem('shaft-seen');
      onClose?.();
      navigate({ to: '/' });
   };
   const subActiveBg = useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.07)');
   const subHoverBg = useColorModeValue('rgba(0,0,0,0.03)', 'rgba(255,255,255,0.04)');
   const trackColor = useColorModeValue('rgba(0,0,0,0.10)', 'rgba(255,255,255,0.10)');

   const primaryGroups = NAV_GROUPS.filter(g => PRIMARY_GROUP_IDS.includes(g.id));
   const bottomGroups = NAV_GROUPS.filter(g => !PRIMARY_GROUP_IDS.includes(g.id));

   const renderGroupItems = (items: typeof NAV_GROUPS[number]['items']) =>
      items.map(item => {
         const isActive = item.activeWhen
            ? item.activeWhen(pathname)
            : pathname.startsWith(item.href);
         const showChildren = isActive && !minimized && item.children?.length;

         return (
            <Box key={item.label}>
               <Tooltip content={item.label} disabled={!minimized}>
                  <TLink
                     to={item.href}
                     onClick={onClose}
                     style={{ textDecoration: 'none', display: 'block' }}
                  >
                     <NavButton
                        icon={item.icon}
                        label={item.label}
                        minimized={minimized}
                        isActive={isActive}
                        badge={item.badge?.text}
                     />
                  </TLink>
               </Tooltip>

               {showChildren && (
                  <Flex
                     direction='column'
                     gap={0.5}
                     mt={0.5}
                     ml={3}
                     pl={3}
                     borderLeftWidth='1.5px'
                     borderColor={trackColor}
                  >
                     {item.children!.map(child => {
                        const childActive = child.isActive
                           ? child.isActive(pathname)
                           : pathname.startsWith(child.href);
                        return (
                           <TLink
                              key={child.href}
                              to={child.href}
                              onClick={onClose}
                              style={{ textDecoration: 'none', display: 'block' }}
                           >
                              <Flex
                                 w='full'
                                 align='center'
                                 px={2}
                                 py={1.5}
                                 borderRadius='md'
                                 bg={childActive ? subActiveBg : 'transparent'}
                                 color={childActive ? 'fg' : 'fg.muted'}
                                 fontWeight={childActive ? 'medium' : 'normal'}
                                 _hover={{ bg: subHoverBg, color: 'fg' }}
                                 transition='all 0.15s ease'
                                 cursor='pointer'
                              >
                                 <Text fontSize='sm' lineHeight='1'>
                                    {child.label}
                                 </Text>
                              </Flex>
                           </TLink>
                        );
                     })}
                  </Flex>
               )}
            </Box>
         );
      });

   return (
      <Flex direction='column' h='full' justify='space-between' px={minimized ? 1.5 : 3} py={1}>
         {/* Primary nav — Co-op & Academics */}
         <Flex direction='column' gap={1}>
            {primaryGroups.map((group, groupIdx) => (
               <Box key={group.id}>
                  {groupIdx > 0 && <Separator my={1.5} />}
                  {!minimized && (
                     <Text
                        fontSize='2xs'
                        fontWeight='semibold'
                        letterSpacing='wider'
                        textTransform='uppercase'
                        color='fg.subtle'
                        px={3}
                        pb={0.5}
                     >
                        {group.label}
                     </Text>
                  )}
                  <Flex direction='column' gap={0.5}>
                     {renderGroupItems(group.items)}
                  </Flex>
               </Box>
            ))}
         </Flex>

         {/* Bottom — Profile + utilities */}
         <Flex direction='column' gap={0.5} pb={2}>
            {bottomGroups.map(group => (
               <Box key={group.id}>
                  <Separator mb={1.5} mt={1} />
                  {!minimized && (
                     <Text
                        fontSize='2xs'
                        fontWeight='semibold'
                        letterSpacing='wider'
                        textTransform='uppercase'
                        color='fg.subtle'
                        px={3}
                        pb={0.5}
                     >
                        {group.label}
                     </Text>
                  )}
                  <Flex direction='column' gap={0.5}>
                     {renderGroupItems(group.items)}
                  </Flex>
               </Box>
            ))}

            <Separator mb={1.5} mt={1} />

            <Tooltip content='Watch the Shaft' disabled={!minimized}>
               <NavButton
                  icon={ShaftIcon}
                  label='Watch the Shaft'
                  minimized={minimized}
                  onClick={handleWatchShaft}
               />
            </Tooltip>

            <Tooltip content='Database' disabled={!minimized}>
               <DatabaseManagerDialog
                  trigger={
                     <NavButton icon={DatabaseIcon} label='Database' minimized={minimized} />
                  }
               />
            </Tooltip>

            <Tooltip content='Feedback' disabled={!minimized}>
               <FeedbackDialog
                  trigger={
                     <NavButton icon={MessageCircleIcon} label='Feedback' minimized={minimized} />
                  }
               />
            </Tooltip>

            <Tooltip content='GitHub' disabled={!minimized}>
               <Link
                  href='https://github.com/satwikShresth/openmario'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ display: 'block', textDecoration: 'none' }}
               >
                  <NavButton icon={GithubIcon} label='GitHub' minimized={minimized} />
               </Link>
            </Tooltip>
         </Flex>
      </Flex>
   );
}
