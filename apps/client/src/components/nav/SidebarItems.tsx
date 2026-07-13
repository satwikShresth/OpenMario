import { forwardRef } from 'react'
import type React from 'react'
import { Link, Box, Flex, Icon, Text } from '@chakra-ui/react'
import { Link as TLink, useRouterState } from '@tanstack/react-router'
import { GithubIcon, MessageCircleIcon } from '@/components/icons'
import { useColorModeValue } from '@/components/ui/color-mode'
import { FeedbackDialog } from '@/components/common/Feedback'
import { Tooltip } from '@/components/ui/tooltip'
import { Tag } from '@/components/ui'
import { NAV_GROUPS } from './items'

interface SidebarItemsProps {
   onClose?: () => void
   minimized: boolean
}

interface NavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement | HTMLDivElement> {
   icon: React.ElementType
   label: string
   minimized: boolean
   isActive?: boolean
   badge?: string
}

const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
   ({ icon: IconComp, label, minimized, isActive = false, badge, ...props }, ref) => {
      const hoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.80')

      return (
         <Flex
            ref={ref}
            as='button'
            w='full'
            align='center'
            justify={minimized ? 'center' : 'flex-start'}
            gap={2.5}
            minH='36px'
            h={minimized ? '36px' : 'auto'}
            px={minimized ? 2 : 2.5}
            py={minimized ? 0 : 2}
            borderRadius='lg'
            borderWidth={0}
            bg={isActive ? 'teal.subtle' : 'transparent'}
            color={isActive ? 'teal.fg' : 'fg.muted'}
            fontWeight={isActive ? 'medium' : 'normal'}
            fontSize='sm'
            lineHeight='snug'
            _hover={{
               bg: isActive ? 'teal.subtle' : hoverBg,
               color: isActive ? 'teal.fg' : 'fg',
            }}
            transition='background 0.15s ease, color 0.15s ease'
            cursor='pointer'
            textAlign='left'
            outline='none'
            flexShrink={0}
            {...(props as any)}
         >
            <Icon
               as={IconComp}
               boxSize={4}
               color={isActive ? 'teal.fg' : 'fg.muted'}
               flexShrink={0}
            />
            {!minimized && (
               <>
                  <Text fontSize='sm' flex='1' lineHeight='1.2' truncate>
                     {label}
                  </Text>
                  {badge && (
                     <Tag
                        size='sm'
                        colorPalette='orange'
                        variant='subtle'
                        flexShrink={0}
                     >
                        {badge}
                     </Tag>
                  )}
               </>
            )}
         </Flex>
      )
   },
)

const PRIMARY_GROUP_IDS = ['coop', 'academics']

export function SidebarItems({ onClose, minimized }: SidebarItemsProps) {
   const pathname = useRouterState({ select: s => s.location.pathname })

   const subActiveBg = useColorModeValue('teal.50', 'whiteAlpha.100')
   const subHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.80')

   const primaryGroups = NAV_GROUPS.filter(g => PRIMARY_GROUP_IDS.includes(g.id))
   const bottomGroups = NAV_GROUPS.filter(g => !PRIMARY_GROUP_IDS.includes(g.id))

   const renderGroupItems = (items: (typeof NAV_GROUPS)[number]['items']) =>
      items.map(item => {
         const isActive = item.activeWhen
            ? item.activeWhen(pathname)
            : pathname.startsWith(item.href)
         const showChildren = isActive && !minimized && item.children?.length

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
                  <Flex direction='column' gap={0.5} mt={1} ml={4} pl={3}>
                     {item.children!.map(child => {
                        const childActive = child.isActive
                           ? child.isActive(pathname)
                           : pathname.startsWith(child.href)
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
                                 px={2.5}
                                 py={1.5}
                                 borderRadius='md'
                                 bg={childActive ? subActiveBg : 'transparent'}
                                 color={childActive ? 'teal.fg' : 'fg.muted'}
                                 fontWeight={childActive ? 'medium' : 'normal'}
                                 _hover={{ bg: subHoverBg, color: childActive ? 'teal.fg' : 'fg' }}
                                 transition='all 0.15s ease'
                                 cursor='pointer'
                              >
                                 <Text fontSize='sm' lineHeight='1.2'>
                                    {child.label}
                                 </Text>
                              </Flex>
                           </TLink>
                        )
                     })}
                  </Flex>
               )}
            </Box>
         )
      })

   const utilityItems = (
      <Flex direction='column' gap={0.5}>
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
   )

   return (
      <Flex direction='column' h='full' minH={0} flex={1} px={minimized ? 1.5 : 2} py={2}>
         <Flex direction='column' flex={1} minH={0} overflowY='auto' gap={4}>
            {primaryGroups.map(group => (
               <Box key={group.id}>
                  {!minimized && (
                     <Text
                        fontSize='xs'
                        fontWeight='medium'
                        color='fg.subtle'
                        px={2.5}
                        pb={1.5}
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

         <Flex direction='column' flexShrink={0} gap={2} pt={2}>
            {bottomGroups.map(group => (
               <Box key={group.id}>
                  {!minimized && (
                     <Text
                        fontSize='xs'
                        fontWeight='medium'
                        color='fg.subtle'
                        px={2.5}
                        pb={1.5}
                     >
                        {group.label}
                     </Text>
                  )}
                  <Flex direction='column' gap={0.5}>
                     {renderGroupItems(group.items)}
                  </Flex>
               </Box>
            ))}

            {utilityItems}
         </Flex>
      </Flex>
   )
}
