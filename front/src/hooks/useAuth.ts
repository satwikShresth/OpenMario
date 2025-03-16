import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { postAuthLoginMutation } from "#client/react-query.gen";

// Create a custom event for auth state changes
export const AUTH_CHANGE_EVENT = "auth-state-change";

export const isLoggedIn = () => localStorage.getItem("access_token") !== null;

export const clearToken = () => {
  localStorage.removeItem("access_token");
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const setToken = (token) => {
  localStorage.setItem("access_token", token);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const useAuth = () => {
  const [error, setError] = useState("");
  const [authState, setAuthState] = useState(isLoggedIn());
  const postloginMutation = useMutation(postAuthLoginMutation());

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthState(isLoggedIn());
    };

    setAuthState(isLoggedIn());

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

    window.addEventListener("storage", (event) => {
      if (event.key === "access_token") {
        handleAuthChange();
      }
    });

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const login = async (body: { email: string }) => {
    return await postloginMutation
      .mutateAsync({
        body,
        throwOnError: true,
      })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        const errorMessage =
          error?.response?.data?.message ||
          "Failed to send login link. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      });
  };

  return {
    error,
    login,
    isLoading: postloginMutation.isPending,
    isSuccess: postloginMutation.isSuccess,
    isLoggedIn: authState,
    logout: clearToken,
    resetError: () => setError(""),
  };
};
