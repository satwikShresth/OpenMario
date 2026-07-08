import { useRouter } from '@tanstack/react-router';
import { withViewTransition } from '@/lib/viewTransition';

/**
 * Chains TanStack Router's React `startTransition` with the View Transitions API.
 * Must render after `<Transitioner />` (via `InnerWrap`) so it wraps the latest handler.
 */
export function ViewTransitionEnhancer() {
   const router = useRouter();
   const reactStartTransition = router.startTransition;

   router.startTransition = (fn) => {
      withViewTransition(() => reactStartTransition(fn), ['page']);
   };

   return null;
}
