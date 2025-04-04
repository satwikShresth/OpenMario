import { useState } from "react";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Fade,
  IconButton,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { Mail, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "#/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

function LoginModal({ open, handleClose }) {
  const [status, setStatus] = useState("idle"); // 'idle', 'success', 'error'
  const { login, logout, error, resetError, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  const currentEmail = watch("email");

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      resetError();
      setStatus("idle");

      // Call the login mutation which sends the magic link
      await login({ email: data.email });

      // If we get here, the API call was successful and the magic link was sent
      setStatus("success");
      console.log("Magic link sent successfully to:", data.email);

      // Close modal after showing success message
      setTimeout(() => {
        handleClose();
        setStatus("idle");
      }, 3000);
    } catch (err) {
      console.error("Login failed:", err);
      setStatus("error");

      // Reset error state after a few seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }
  };

  // Handler for modal close - reset status and errors
  const handleModalClose = () => {
    resetError();
    setStatus("idle");
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 400 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            border: status === "error" ? "2px solid #f44336" : "none",
            transition: "border 0.3s ease",
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" component="h2">
              Log In
            </Typography>
            <IconButton onClick={handleModalClose} edge="end">
              <X size={20} />
            </IconButton>
          </Box>

          {/* Success Message */}
          {status === "success" && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
            >
              Email has been sent to {currentEmail}
            </Alert>
          )}

          {/* Error Message */}
          {status === "error" && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {error || "Login failed. Please try again."}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 3 }}>
              <TextField
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: .8 }}>
                    <Box sx={{ transform: "translateY(-1px)" }}>
                      <Mail size={18} />
                    </Box>
                    Email
                  </Box>
                }
                fullWidth
                variant="outlined"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={status === "success"}
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting || isLoading || status === "success"}
              color={status === "success" ? "success" : "primary"}
              sx={{
                py: 1.5,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {isSubmitting || isLoading
                ? "Sending Login Link..."
                : status === "success"
                ? "Magic Link Sent"
                : "Continue with Email"}
            </Button>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
}

export default LoginModal;
