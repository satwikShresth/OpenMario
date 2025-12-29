import type { Plugin } from 'vite';

/**
 * Polyfill plugin for Fast Refresh runtime when using rolldown-vite
 * This ensures $RefreshReg$ and $RefreshSig$ are available globally
 */
export function fastRefreshPolyfill(): Plugin {
   return {
      name: 'fast-refresh-polyfill',
      transformIndexHtml(html) {
         // Inject Fast Refresh runtime polyfill before any scripts
         const polyfill = `
         <script>
            if (typeof globalThis !== 'undefined') {
               if (!globalThis.$RefreshReg$) {
                  globalThis.$RefreshReg$ = () => {};
               }
               if (!globalThis.$RefreshSig$) {
                  globalThis.$RefreshSig$ = () => (type) => type;
               }
            }
         </script>
         `;
         return html.replace('<head>', `<head>${polyfill}`);
      }
   };
}
