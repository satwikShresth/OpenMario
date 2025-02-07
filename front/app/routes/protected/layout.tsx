import { Navigate, Outlet } from "react-router";
import Nav from "./nav";
import { isLoggedIn, clearToken } from '../../hooks/useAuth';
import React, { useEffect } from "react";
import { postAuthMeMutation } from "#client/react-query.gen";
import { useMutation } from "@tanstack/react-query";
import { StoreProvider, useUserStore } from '../../hooks/useUserContext';

// Separate component for auth validation to use after StoreProvider
const AuthValidator = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser, clearUser } = useUserStore();

  const validateMutation = useMutation({
    ...postAuthMeMutation(),
    onSuccess: (data) => {
      setUser(data);
    },
    onError: (error) => {
      console.error(error);
      clearUser();
      clearToken();
      return <Navigate to="/login" replace />;
    },
  });

  useEffect(() => {
    // Only validate if there's no user data
    if (!user) {
      validateMutation.mutate({});
    }
  }, []); // Remove user from dependencies

  return <>{children}</>;
};

export function ProtectRoute({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <StoreProvider>
      <AuthValidator>
        {children}
      </AuthValidator>
    </StoreProvider>
  );
}

export default () => {
  return (
    <ProtectRoute>
      <Nav />
      <Outlet />
    </ProtectRoute>
  );
}
