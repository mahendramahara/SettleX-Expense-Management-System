import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Logo } from '../ui/Logo';

export function LoginForm({ onSwitchToRegister, onOpenForgotPassword, onRequiresVerification }) {
  const { login, loginAdmin, loginWithGoogle, loginAsGuest, loginAsGuestAdmin } = useAuth();
  const [authMode, setAuthMode] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      if (authMode === 'admin') {
        await loginAdmin({ email, password });
      } else {
        await login({ email, password });
      }
    } catch (err) {
      if (
        err.data?.isUnverified ||
        err.data?.requiresVerification ||
        err.message?.toLowerCase().includes('verify')
      ) {
        onRequiresVerification?.(err.data?.email || email);
        return;
      }
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAdminLogin = () => {
    loginAsGuestAdmin();
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[460px] shadow-xl border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#0e172a]/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-3">
        <div className="flex justify-center mb-3">
          <Logo size="lg" />
        </div>
        <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 max-w-[260px] mx-auto border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => {
              setAuthMode('user');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              authMode === 'user'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Member</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('admin');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              authMode === 'admin'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        <CardTitle className="text-2xl font-black">
          {authMode === 'admin' ? 'Admin Console Login' : 'Welcome Back'}
        </CardTitle>
        <CardDescription>
          {authMode === 'admin'
            ? 'Sign in to access platform controls, user moderation, and system audits'
            : 'Sign in to manage group expenses and optimize debt settlements'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            id="login-email"
            label={authMode === 'admin' ? 'Admin Email Address' : 'Email Address'}
            type="email"
            placeholder={
              authMode === 'admin' ? 'admin@settlex.com' : 'demo@settlex.app'
            }
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            prefixIcon={Mail}
            required
          />

          <Input
            id="login-password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            prefixIcon={Lock}
            required
          />

          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            icon={ArrowRight}
            iconPosition="right"
          >
            {authMode === 'admin' ? 'Sign In as Administrator' : 'Sign In'}
          </Button>

          {authMode === 'user' && (
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={onOpenForgotPassword}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}
        </form>

        {authMode === 'admin' && (
          <div className="space-y-2 pt-2">
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-semibold">
                  Or explore admin preview
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full text-xs font-bold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/80 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/60 cursor-pointer"
              onClick={handleGuestAdminLogin}
              icon={Shield}
            >
              Sign In as Guest (Admin Preview)
            </Button>
            <p className="text-[11px] text-center text-slate-400">
              Explore admin dashboard, analytics, and moderation in read-only preview mode
            </p>
          </div>
        )}

        {authMode === 'user' && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-semibold">
                  Or quick access
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="secondary"
                className="w-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                onClick={loginAsGuest}
                icon={Sparkles}
              >
                Explore as Guest (BCA Defense Demo)
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2.5 text-slate-700 dark:text-slate-200 py-2.5"
                onClick={handleGoogleLogin}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="font-semibold text-xs sm:text-sm leading-none">
                  Continue with Google
                </span>
              </Button>
            </div>

            <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
              <span>Don't have an account? </span>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-bold text-primary hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
