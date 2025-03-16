import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppThemeProvider from '#/utils/useThemeProvider';
import './app.css'
import { SnackbarProvider } from 'notistack';

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
    return (
      <div>
        <p>Not found!</p>
      </div>
    )
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
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} autoHideDuration={8000}>
          <RouterProvider router={router} />
        </SnackbarProvider>
      </QueryClientProvider>
    </AppThemeProvider>
  )
}

export default App

