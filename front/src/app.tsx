import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppThemeProvider from '#/utils/useThemeProvider';
import './app.css';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import ErrorBoundary from './components/Error/Boundary';
import { ErrorPage } from './components/Error/Page';
import { QueryBoundary } from './components/Error/QueryBoundry';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
})

const router = createRouter({
  routeTree,
  context: {
    queryClient
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultNotFoundComponent: () => {
    return <ErrorPage error={new Error("Page not found")} />
  },
  defaultErrorComponent: ({ error }) => {
    return <ErrorPage error={error as Error} />
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const App = () => {
  return (
    <AppThemeProvider>
      <CssBaseline />
      <ErrorBoundary>
        <QueryBoundary>
          <QueryClientProvider client={queryClient}>
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              autoHideDuration={8000}
            >
              <RouterProvider router={router} />
            </SnackbarProvider>
          </QueryClientProvider>
        </QueryBoundary>
      </ErrorBoundary>
    </AppThemeProvider>
  )
}

export default App
