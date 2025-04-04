import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getAuthLoginByTokenOptions } from "#client/react-query.gen";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { Home as HomeIcon } from "lucide-react";

const AuthStatusContainer = (
  { title, message, isLoading, error, disabled = false },
) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        padding: "64px 24px",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 480,
          width: "100%",
          height: 280,
          display: "flex",
          flexDirection: "column",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              width: "100%",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isLoading && <CircularProgress size={40} sx={{ mb: 3 }} />}
            <Typography
              variant="h6"
              gutterBottom
              color={error ? "error" : "primary"}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                maxHeight: "80px",
                overflow: "auto",
                px: 1,
              }}
            >
              {message}
            </Typography>
          </Box>
          <Box sx={{ width: "100%", mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/"
              startIcon={<HomeIcon />}
              disabled={disabled}
              fullWidth
            >
              {error ? "Return to Home" : "Go to Home"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
export const Route = createFileRoute("/login/$jwtPayload")({
  loader: async ({ params: { jwtPayload }, context: { queryClient } }) => {
    await queryClient.fetchQuery({
      ...getAuthLoginByTokenOptions({
        path: { token: jwtPayload },
      }),
    }).then((data) => {
      if (data?.access_token) {
        localStorage.setItem("access_token", data.access_token);
        throw redirect({
          to: "/",
          reloadDocument: true,
        });
      }
    });
  },
  pendingComponent: () => (
    <AuthStatusContainer
      title="Authenticating..."
      message="Please wait while we authenticate your credentials. Please don't navigate away from this page."
      isLoading={true}
      disabled={true}
    />
  ),
  errorComponent: ({ error }) => (
    <AuthStatusContainer
      title="Authentication Error"
      message={error?.response?.data?.message ||
        "An unknown error occurred during authentication"}
      error={true}
    />
  ),
  component: () => (
    <AuthStatusContainer
      title="Processing..."
      message="Please wait a moment"
      isLoading={true}
    />
  ),
});
