import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate, useNavigate } from 'react-router';
import { postAuthMeOptions, postAuthSignupMutation, postAuthLogoutMutation, postAuthAccessTokenMutation } from '#client/react-query.gen';


export const isLoggedIn = () => localStorage.getItem('access_token') !== null;
export const clearToken = () => localStorage.removeItem('access_token');
export const isLoggedInRedirector = (fn: () => {}) => isLoggedIn() ? fn() : Navigate({ to: '/', replace: true })

export const useAuth = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    ...postAuthMeOptions(),
    enabled: isLoggedIn()
  });

  const signUpMutation = useMutation(postAuthSignupMutation());
  const loginMutation = useMutation(postAuthAccessTokenMutation());
  const logoutMutation = useMutation(postAuthLogoutMutation());


  const register = (data: any) => {
    signUpMutation.mutateAsync({
      body: data,
      throwOnError: true
    })
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        setError(error.response?.status === 409 ? 'Username already exists' : 'Failed to create account');
        console.error('Signup error:', error);
      })
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      });
  };

  const login = (credentials: any) => {
    loginMutation.mutateAsync({
      body: credentials,
      throwOnError: true
    })
      .then((response) => {
        localStorage.setItem('access_token', response.access_token);
        navigate('/');
      })
      .catch((error) => {
        setError(error.response?.status === 401 ? 'Invalid credentials' : 'Login failed');
        console.error('Login error:', error);
      })
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      });
  };

  const logout = () => {
    logoutMutation.mutateAsync({
      throwOnError: true
    })
      .catch((error) => {
        console.error('Logout error:', error);
      })
      .finally(() => {
        localStorage.removeItem('access_token');
        queryClient.removeQueries({ queryKey: ['currentUser'] });
        navigate('/');
      });
  };

  return {
    user,
    isLoading,
    error,
    register,
    login,
    logout,
    resetError: () => setError('')
  };
};
