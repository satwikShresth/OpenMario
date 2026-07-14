import type { AppIcon } from '@/components/icons';
import {
   SalaryIcon,
   BriefcaseIcon,
   UsersIcon,
   BookOpenIcon,
   ListIcon,
   CalendarIcon,
   McpIcon,
} from '@/components/icons';

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

export interface NavGroup {
   id: string;
   label: string;
   items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
   {
      id: 'coop',
      label: 'Co-op',
      items: [
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
      ],
   },
   {
      id: 'academics',
      label: 'Academics',
      items: [
         {
            label: 'Explore Courses',
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
            activeWhen: pathname =>
               pathname === '/courses/plan' ||
               pathname.startsWith('/courses/plan/'),
            children: [
               {
                  label: 'Plan of Study',
                  href: '/courses/plan',
                  isActive: pathname => {
                     const p = pathname.replace(/\/+$/, '') || '/'
                     return p === '/courses/plan'
                  },
               },
               {
                  label: 'Quarter Schedule',
                  href: '/courses/plan/schedule',
                  isActive: pathname => {
                     const p = pathname.replace(/\/+$/, '') || '/'
                     return (
                        p === '/courses/plan/schedule' ||
                        p.startsWith('/courses/plan/schedule/')
                     )
                  },
               },
            ],
         },
         {
            label: 'Professors',
            href: '/professors',
            icon: UsersIcon,
         },
      ],
   },
   {
      id: 'profile',
      label: 'Profile',
      items: [
         {
            label: 'Profile',
            href: '/courses/profile',
            icon: ListIcon,
         },
         {
            label: 'MCP',
            href: '/mcp',
            icon: McpIcon,
            badge: {
               text: 'New',
               colorPalette: 'teal',
               variant: 'subtle',
            },
         },
      ],
   },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap(g => g.items);
