import { useEffect, useState } from 'react';
import { AxiosError, isAxiosError } from 'axios';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { LoginForm } from '@/components/Auth/Login';
import { ErrorToast } from '@/components/ui/error-toast';
import { useAuth } from '@/hooks/useAuth';
import type { LoginCredentials } from '@/types/auth';

interface ApiErrorResponse {
  message?: string;
}

function mapLoginError(error: unknown): string {
  if (!isAxiosError(error)) {
    return 'Unable to sign in. Please try again.';
  }

  const apiError = error as AxiosError<ApiErrorResponse>;

  const status = apiError.response?.status;
  const backendMessage = apiError.response?.data?.message;

  if (status === 400) {
    return backendMessage || 'Please review your email and password format.';
  }

  if (status === 401) {
    return backendMessage || 'Invalid email or password.';
  }

  if (status === 429) {
    return backendMessage || 'Too many attempts. Please wait and try again.';
  }

  if (status && status >= 500) {
    return 'Server error while signing in. Please try again shortly.';
  }

  return backendMessage || 'Unable to sign in with provided credentials.';
}

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [toastErrorMessage, setToastErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastErrorMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToastErrorMessage(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toastErrorMessage]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (credentials: LoginCredentials, rememberMe: boolean) => {
    setToastErrorMessage(null);

    try {
      await login(credentials, rememberMe);
      const destination = (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname;
      navigate(destination || '/', { replace: true });
    } catch (error) {
      setToastErrorMessage(mapLoginError(error));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <LoginForm onSubmit={handleSubmit} />
      {toastErrorMessage ? (
        <ErrorToast message={toastErrorMessage} onClose={() => setToastErrorMessage(null)} />
      ) : null}
    </div>
  );
}
