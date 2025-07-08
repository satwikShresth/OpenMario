import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export const ErrorPage = ({ error, resetErrorBoundary }: ErrorPageProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ to: "/salary" });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  console.error(error.message || error.toString());

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 8,
          textAlign: "center",
          borderRadius: 2,
        }}
      >
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <AlertTriangle size={48} color="#f44336" />
        </Box>

        <Typography variant="h4" component="h1" gutterBottom>
          Oops! Something went wrong
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          We encountered an unexpected error. You will be redirected to the home
          page in 5 seconds.
        </Typography>

        <LinearProgress variant="determinate" value={0} sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Home size={18} />}
            onClick={() => navigate({ to: "/salary" })}
          >
            Go to Home
          </Button>

          {resetErrorBoundary && (
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={18} />}
              onClick={resetErrorBoundary}
            >
              Try Again
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};
