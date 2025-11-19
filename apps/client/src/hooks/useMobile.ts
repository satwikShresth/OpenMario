import { useEffect, useState } from 'react';

let debounce_timer;

const MOBILE_THRESHOLD = 1020;

export function useMobile() {
   const [isMobile, setIsMobile] = useState(
      globalThis.innerWidth < MOBILE_THRESHOLD,
   );

   useEffect(() => {
      globalThis.addEventListener('resize', updateWidth);
      return () => globalThis.removeEventListener('resize', updateWidth);
   });

   function updateWidth() {
      if (debounce_timer) {
         clearTimeout(debounce_timer);
      }
      setTimeout(() => {
         if (!isMobile && globalThis.innerWidth < MOBILE_THRESHOLD) {
            setIsMobile(true);
         }
         if (isMobile && globalThis.innerWidth > MOBILE_THRESHOLD) {
            setIsMobile(false);
         }
      }, 1);
   }

   return isMobile;
}
