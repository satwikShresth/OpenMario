import { Navigate, Outlet } from "react-router";
import Nav from "./nav";
//import { isLoggedIn, clearToken } from '../../hooks/useAuth';
import React, { useEffect, Suspense } from "react";
//import { postAuthMeMutation } from "#client/react-query.gen";
import { useMutation } from "@tanstack/react-query";
import { Box, Container } from "@mui/material";
//import { StoreProvider, useUserStore } from '../../hooks/useUserContext';

const AuthValidator = ({ children }: { children: React.ReactNode }) => {
  //const { user, setUser, clearUser } = useUserStore();
  //const validateMutation = useMutation(postAuthMeMutation());
  //
  //useEffect(() => {
  //  if (!user) {
  //    validateMutation.mutateAsync({ throwOnError: true })
  //      .then((response) => {
  //        setUser(response);
  //      })
  //      .catch((error) => {
  //        console.error(error);
  //        clearUser();
  //        clearToken();
  //        Navigate({ to: "/login", replace: true })
  //      })
  //  }
  //}, []);

  return <>{children}</>;
};

export const ProtectRoute = ({ children }: { children: React.ReactNode }) =>
//isLoggedIn()
//  ? (
//    <StoreProvider>
//      <Suspense fallback={<div>Loading...</div>}>
//        <AuthValidator>
//          {children}
//        </AuthValidator>
//      </Suspense>
//    </StoreProvider>
//  )
//  : 
(
  //<StoreProvider>
  { children }
  //</StoreProvider>
)


export default () => (
  //<ProtectRoute>
  <>
    <Nav />
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, mt: 4 }}>
        <Outlet />
      </Box>
    </Container>
  </>
  //</ProtectRoute >
)
