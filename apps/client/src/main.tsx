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
import { StrictMode } from 'react';
import { client, db, migrate } from './db';
import { PGliteProvider } from "@electric-sql/pglite-react"
import './styles.css';
import { termsCollection } from './helpers';
import { terms } from './db/schema';

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

// Migration handler with fallback
async function performMigration(retryCount = 0): Promise<void> {
   try {
      await migrate();
      await db
         .insert(terms)
         .values([
            { term: 'Spring', year: 2025, isActive: false, },
            { term: 'Summer', year: 2025, isActive: false, },
            { term: 'Fall', year: 2025, isActive: false, },
            { term: 'Winter', year: 2025, isActive: false }
         ]).onConflictDoNothing();
      await termsCollection.preload();
   } catch (error) {
      console.error('[PGlite] Migration failed:', error);
      
      if (retryCount < 1) {
         console.log('[PGlite] Clearing database and retrying...');
         
         try {
            // Clear the IndexedDB database
            const dbName = 'openmario-data';
            const deleteRequest = indexedDB.deleteDatabase(dbName);
            
            await new Promise((resolve, reject) => {
               deleteRequest.onsuccess = () => {
                  console.log('[PGlite] Database cleared successfully');
                  resolve(undefined);
               };
               deleteRequest.onerror = () => {
                  reject(new Error('Failed to clear database'));
               };
               deleteRequest.onblocked = () => {
                  console.warn('[PGlite] Database deletion blocked, forcing close...');
                  // Force a page reload to close all connections
                  window.location.reload();
               };
            });
            
            // Reload the page to reinitialize with fresh database
            window.location.reload();
         } catch (clearError) {
            console.error('[PGlite] Failed to clear database:', clearError);
            throw error;
         }
      } else {
         throw error;
      }
   }
}

// Show loading screen and perform migration
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
   const root = ReactDOM.createRoot(rootElement);
   
   // Render loading screen
   root.render(
      <StrictMode>
         <Provider>
            <LoadingComponent 
               title="Initializing Database" 
               message="Setting up your local database and running migrations. This may take a moment..."
               variant="processing"
            />
         </Provider>
      </StrictMode>
   );
   
   // Perform migration and then render the app
   performMigration()
      .then(() => {
         root.render(
            <StrictMode>
               <PGliteProvider db={client}>
                  <Provider>
                     <Toaster />
                     <TanStackQueryProvider.Provider>
                        <RouterProvider router={router} />
                     </TanStackQueryProvider.Provider>
                  </Provider>
               </PGliteProvider>
            </StrictMode>
         );
      })
      .catch((error) => {
         console.error('[PGlite] Fatal error:', error);
         root.render(
            <StrictMode>
               <Provider>
                  <ErrorComponent 
                     error={error}
                  />
               </Provider>
            </StrictMode>
         );
      });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
