import { createRouter, RouterProvider, stringifySearchWith } from '@tanstack/react-router';
import * as TanStackQueryProvider from '@/integrations/tanstack-query/root-provider';
import { parseSearchWith } from '@tanstack/react-router';
import { ErrorComponent, LoadingComponent, NotFoundComponent } from '@/components/common';
import { Provider } from '@/components/ui/provider';
import reportWebVitals from '@/reportWebVitals.ts';
import { Toaster } from '@/components/ui/toaster';
import { routeTree } from '@/routeTree.gen';
import ReactDOM from 'react-dom/client';
import { parse, stringify } from 'jsurl2';
import { enableMapSet } from 'immer';
import { StrictMode } from 'react';
import './styles.css';

const router = createRouter({
   routeTree,
   context: TanStackQueryProvider.getContext(),
   defaultPreload: 'intent',
   scrollRestoration: true,
   stringifySearch: stringifySearchWith(stringify),
   parseSearch: parseSearchWith(parse),
   defaultStructuralSharing: true,
   defaultPreloadStaleTime: 0,
   defaultErrorComponent: (props) => <ErrorComponent {...props} />,
   defaultNotFoundComponent: (props) => <NotFoundComponent {...props} />,
   defaultPendingComponent: (props) => <LoadingComponent {...props} />,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
   interface Register {
      router: typeof router;
   }
}
enableMapSet();

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
   const root = ReactDOM.createRoot(rootElement);
   root.render(
      <StrictMode>
         <Provider>
            <Toaster />
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
