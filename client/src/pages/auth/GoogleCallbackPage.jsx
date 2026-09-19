import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export function GoogleCallbackPage({ onCompleted, onError }) {
  const { handleGoogleCallback } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const executionRef = useRef(false);

  useEffect(() => {
    if (executionRef.current) return;
    executionRef.current = true;

    async function processCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');

      if (errorParam) {
        setStatus('error');
        setErrorMessage(
          errorParam === 'access_denied'
            ? 'Sign in was cancelled or permission was denied.'
            : `Google sign-in error: ${errorParam}`
        );
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code was found in the redirect callback.');
        return;
      }

      try {
        await handleGoogleCallback(code);
        setStatus('success');
        window.history.replaceState({}, document.title, '/');
        setTimeout(() => {
          navigate('/', { replace: true });
          onCompleted?.();
        }, 300);
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message || 'Failed to complete Google authentication.');
        onError?.(err);
      }
    }

    processCallback();
  }, [handleGoogleCallback, onCompleted, onError]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-800 text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            {status === 'processing' ? (
              <svg
                className="h-7 w-7 animate-spin text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : status === 'success' ? (
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-rose-500" />
            )}
          </div>

          <CardTitle className="text-xl font-bold">
            {status === 'processing' && 'Connecting to Google'}
            {status === 'success' && 'Signed in Successfully'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>

          <CardDescription>
            {status === 'processing' &&
              'Validating your credentials and establishing a secure session...'}
            {status === 'success' && 'Redirecting you to your SettleX dashboard...'}
            {status === 'error' && errorMessage}
          </CardDescription>
        </CardHeader>

        {status === 'error' && (
          <CardContent className="pt-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                window.history.replaceState({}, document.title, '/');
                navigate('/', { replace: true });
              }}
              icon={ArrowLeft}
            >
              Return to Sign In
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
