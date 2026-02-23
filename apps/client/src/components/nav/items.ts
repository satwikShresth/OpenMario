import type { AppIcon } from '@/components/icons';
import { SalaryIcon, BriefcaseIcon, UsersIcon, BookOpenIcon, ListIcon, CalendarIcon } from '@/components/icons';

export interface SubNavItem {
   label: string;
   href: string;
   /** Override default startsWith(href) active detection */
   isActive?: (pathname: string) => boolean;
}

export interface NavItem {
   label: string;
   href: string;
   icon: AppIcon;
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
      icon: SalaryIcon,
   },
   {
      label: 'Companies',
      href: '/companies',
      icon: BriefcaseIcon,
   },
   {
      label: 'Professors',
      href: '/professors',
      icon: UsersIcon,
   },
   {
      label: 'Explore',
      href: '/courses/explore',
      icon: BookOpenIcon,
   },
   {
      label: 'Plan',
      href: '/courses/plan',
      icon: CalendarIcon,
      badge: {
         text: 'Beta',
         colorPalette: 'orange',
         variant: 'subtle',
      },
   },
   {
      label: 'Profile',
      href: '/courses/profile',
      icon: ListIcon,
   },
];
