import type { IconType } from 'react-icons';
import { FiDollarSign, FiBriefcase, FiUsers, FiBookOpen, FiList, FiCalendar } from 'react-icons/fi';

export interface SubNavItem {
   label: string;
   href: string;
   /** Override default startsWith(href) active detection */
   isActive?: (pathname: string) => boolean;
}

export interface NavItem {
   label: string;
   href: string;
   icon: IconType;
   badge?: {
      text: string;
      colorPalette?:
         | 'gray'
         | 'red'
         | 'orange'
         | 'yellow'
         | 'green'
         | 'teal'
         | 'blue'
         | 'cyan'
         | 'purple'
         | 'pink';
      variant?: 'solid' | 'subtle' | 'outline' | 'surface' | 'plain';
   };
   /** Sub-items shown indented below the parent when the parent is active */
   children?: SubNavItem[];
   /** Override the default startsWith(href) active check */
   activeWhen?: (pathname: string) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
   {
      label: 'Salary',
      href: '/salary',
      icon: FiDollarSign,
   },
   {
      label: 'Companies',
      href: '/companies',
      icon: FiBriefcase,
   },
   {
      label: 'Professors',
      href: '/professors',
      icon: FiUsers,
   },
   {
      label: 'Explore',
      href: '/courses/explore',
      icon: FiBookOpen,
   },
   {
      label: 'Plan',
      href: '/courses/plan',
      icon: FiCalendar,
      badge: {
         text: 'Beta',
         colorPalette: 'orange',
         variant: 'subtle',
      },
   },
   {
      label: 'Profile',
      href: '/courses/profile',
      icon: FiList,
   },
];
