import { StrictMode } from 'react';
import { Provider } from '@/components/ui/provider';
import ReactDOM from 'react-dom/client';
import { createRouter, RouterProvider, stringifySearchWith } from '@tanstack/react-router';
import { parse, stringify } from 'jsurl2';

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import './styles.css';
import reportWebVitals from './reportWebVitals.ts';
import { parseSearchWith } from '@tanstack/react-router';
import { enableMapSet } from 'immer';

enableMapSet();
// import { client } from './client/client.gen';

// // Request interceptor - logs outgoing requests
// client.interceptors.request.use(async (request) => {
//    console.log('→ Request:', {
//       method: request.method,
//       url: request.url,
//       headers: Object.fromEntries(request.headers.entries()),
//    });
//
//    return request;
// });
//
// // Response interceptor - logs incoming responses
// client.interceptors.response.use(async (response) => {
//    console.log('← Response:', {
//       status: response.status,
//       statusText: response.statusText,
//       url: response.url,
//       headers: Object.fromEntries(response.headers.entries()),
//    });
//
//    return response;
// });

// Create a new router instance
const router = createRouter({
   routeTree,
   context: {
      ...TanStackQueryProvider.getContext(),
   },
   defaultPreload: 'intent',
   scrollRestoration: true,
   stringifySearch: stringifySearchWith(stringify),
   parseSearch: parseSearchWith(parse),
   defaultStructuralSharing: true,
   defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
   interface Register {
      router: typeof router;
   }
}

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
   const root = ReactDOM.createRoot(rootElement);
   root.render(
      <StrictMode>
         <Provider>
            <TanStackQueryProvider.Provider>
               <RouterProvider router={router} />
            </TanStackQueryProvider.Provider>
         </Provider>
      </StrictMode>,
   );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
