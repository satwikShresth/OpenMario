import { Store, useStore } from '@tanstack/react-store';

export type MenuState = 'open' | 'minimized';

type SidebarState = {
   menuState: MenuState;
   drawerOpen: boolean;
};

const sidebarStore = new Store<SidebarState>({
   menuState:
      window.innerWidth < 768
         ? 'open'
         : ((sessionStorage.getItem('om_menu_state') as MenuState) ?? 'open'),
   drawerOpen: false
});

export const useSidebarStore = () => ({
   menuState: useStore(sidebarStore, s => s.menuState),
   isMinimized: useStore(sidebarStore, s => s.menuState === 'minimized'),
   drawerOpen: useStore(sidebarStore, s => s.drawerOpen),
   setDrawerOpen: (open: boolean) =>
      sidebarStore.setState(s => ({ ...s, drawerOpen: open })),
   setMenuState: (state: MenuState) => {
      sessionStorage.setItem('om_menu_state', state);
      sidebarStore.setState(s => ({ ...s, menuState: state }));
   },
   toggle: () => {
      const doToggle = () =>
         sidebarStore.setState(s => {
            const next = s.menuState === 'open' ? 'minimized' : 'open';
            sessionStorage.setItem('om_menu_state', next);
            return { ...s, menuState: next };
         });
      if ('startViewTransition' in document) {
         (
            document as Document & {
               startViewTransition: (cb: () => void) => void;
            }
         ).startViewTransition(doToggle);
      } else {
         doToggle();
      }
   }
});
