import React, { useState } from 'react';
import { Mail, KeyRound, Lock, ArrowLeft } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function ForgotPasswordModal({ isOpen, onClose, onRequestOtp, onResetPassword, onSuccess }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onRequestOtp({ email });
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to request reset OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please provide the valid 6-digit reset code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onResetPassword({ email, otp, newPassword });
      handleClose();
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? 'Reset Password' : 'Enter Reset Code'}
      description={
        step === 1
          ? 'Enter your registered email address to receive a recovery code.'
          : `We sent a 6-digit reset code to ${email}`
      }
    >
      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-4 mt-2">
          <Input
            id="forgot-email"
            label="Email Address"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            prefixIcon={Mail}
            required
          />

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Send Recovery Code
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4 mt-2">
          <Input
            id="reset-otp"
            label="6-Digit Reset Code"
            type="text"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            prefixIcon={KeyRound}
            required
          />

          <Input
            id="reset-new-password"
            label="New Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError('');
            }}
            prefixIcon={Lock}
            required
          />

          <Input
            id="reset-confirm-password"
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError('');
            }}
            prefixIcon={Lock}
            required
          />

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Reset Password & Sign In
          </Button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to email</span>
          </button>
        </form>
      )}
    </Modal>
  );
}
