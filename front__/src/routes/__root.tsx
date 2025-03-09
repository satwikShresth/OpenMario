import Nav from '#/components/nav'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SnackbarProvider } from 'notistack';
import { Container, Box } from '@mui/material';

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <Nav />
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, mt: 4 }}>
          <Outlet />
        </Box>
      </Container>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
