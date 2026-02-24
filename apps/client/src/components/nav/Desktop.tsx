import { Badge, createTreeCollection, Flex, Icon, Text, TreeView } from '@chakra-ui/react';
import { Link, useRouterState } from '@tanstack/react-router';
import { NAV_GROUPS } from './items';
import type { NavItem } from './items';

type NavNode = {
   id: string;
   name: string;
   href?: string;
   icon?: NavItem['icon'];
   badge?: NavItem['badge'];
   activeWhen?: (pathname: string) => boolean;
   children?: NavNode[];
};

const rootNode: NavNode = {
   id: '__root__',
   name: 'root',
   children: NAV_GROUPS.map(group => ({
      id: group.id,
      name: group.label,
      children: group.items.map(item => ({
         id: item.href,
         name: item.label,
         href: item.href,
         icon: item.icon,
         badge: item.badge,
         activeWhen: item.activeWhen,
         children: item.children?.map(child => ({
            id: child.href,
            name: child.label,
            href: child.href,
         })),
      })),
   })),
};

const collection = createTreeCollection<NavNode>({ rootNode });

const DesktopNav = () => {
   const pathname = useRouterState({ select: s => s.location.pathname });

   const selectedValue: string[] = [];
   const expandedValue: string[] = [];

   for (const group of NAV_GROUPS) {
      let groupHasActive = false;
      for (const item of group.items) {
         if (item.children?.length) {
            const activeChild = item.children.find(c => pathname.startsWith(c.href));
            if (activeChild) {
               expandedValue.push(item.href);
               groupHasActive = true;
            }
         } else {
            const isActive = item.activeWhen
               ? item.activeWhen(pathname)
               : pathname.startsWith(item.href);
            if (isActive) {
               selectedValue.push(item.href);
               groupHasActive = true;
            }
         }
      }
      if (groupHasActive) expandedValue.push(group.id);
   }

   return (
      <TreeView.Root
         collection={collection}
         selectedValue={selectedValue}
         expandedValue={expandedValue}
         defaultExpandedValue={NAV_GROUPS.map(g => g.id)}
      >
         <TreeView.Tree>
            <TreeView.Node
               render={({ node, nodeState }) => {
                  const navNode = node as NavNode;

                  if (nodeState.isBranch) {
                     if (!navNode.href) {
                        return (
                           <TreeView.BranchControl cursor='default' _hover={{}}>
                              <TreeView.BranchText>
                                 <Text
                                    fontSize='2xs'
                                    fontWeight='semibold'
                                    letterSpacing='wider'
                                    textTransform='uppercase'
                                    color='fg.subtle'
                                    px={1}
                                 >
                                    {navNode.name}
                                 </Text>
                              </TreeView.BranchText>
                           </TreeView.BranchControl>
                        );
                     }

                     return (
                        <TreeView.BranchControl>
                           {navNode.icon && <Icon as={navNode.icon} boxSize={4} />}
                           <TreeView.BranchText>{navNode.name}</TreeView.BranchText>
                           <TreeView.BranchIndicator />
                        </TreeView.BranchControl>
                     );
                  }

                  return (
                     <TreeView.Item asChild>
                        <Link to={navNode.href!} style={{ textDecoration: 'none' }}>
                           <Flex align='center' gap={2.5} px={2} py={1.5}>
                              {navNode.icon && (
                                 <Icon as={navNode.icon} boxSize={4} flexShrink={0} />
                              )}
                              <Text fontSize='sm' flex='1'>
                                 {navNode.name}
                              </Text>
                              {navNode.badge && (
                                 <Badge
                                    colorPalette={navNode.badge.colorPalette}
                                    variant={navNode.badge.variant}
                                    size='xs'
                                 >
                                    {navNode.badge.text}
                                 </Badge>
                              )}
                           </Flex>
                        </Link>
                     </TreeView.Item>
                  );
               }}
            />
         </TreeView.Tree>
      </TreeView.Root>
   );
};

export default DesktopNav;
