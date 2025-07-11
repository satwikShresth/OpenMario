import { useState } from "react";
import Nav from "#/components/layout/Nav";
import Footer from "#/components/layout/Footer";
import LoginModal from "#/components/layout/Login";
import {
  createRootRouteWithContext,
  Outlet,
  retainSearchParams,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Box, Container } from "@mui/material";
import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => {
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    const handleOpenLoginModal = () => setLoginModalOpen(true);
    const handleCloseLoginModal = () => setLoginModalOpen(false);

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Nav onLoginClick={handleOpenLoginModal} />
        <Container maxWidth="xl">
          <Box sx={{ mb: 4, mt: 4 }}>
            <Outlet />
          </Box>
        </Container>
        <Footer />

        {/* Login Modal */}
        <LoginModal
          open={loginModalOpen}
          handleClose={handleCloseLoginModal}
        />

        <TanStackRouterDevtools position="bottom-left" />
        <ReactQueryDevtools initialIsOpen={false} />
      </Box>
    );
  },
});
