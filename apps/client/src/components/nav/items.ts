interface NavItem {
   label: string
   href: string
   section: string
   badge?: {
      text: string
      colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink'
      variant?: 'solid' | 'subtle' | 'outline' | 'surface' | 'plain'
   }
}

export const NAV_ITEMS: NavItem[] = [
   {
      label: 'Salary',
      href: '/salary',
      section: ''
   },
   {
      label: 'Courses',
      href: '/courses',
      section: ''
   },
   {
      label: 'Plan',
      href: '/plan',
      section: '',
      badge: {
         text: 'Experimental',
         colorPalette: 'orange',
         variant: 'subtle'
      }
   }
];
