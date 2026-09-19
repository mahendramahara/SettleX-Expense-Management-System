import React, { useState, useEffect, useRef } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function OtpVerificationModal({ isOpen, onClose, email, onSuccess, onResend, onVerify }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setError('');
      setResendCooldown(60);
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (isOpen && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, resendCooldown]);

  const handleChange = (index, value) => {
    const sanitized = value.replace(/\D/g, '');
    if (!sanitized) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    const char = sanitized.slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError('');

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);

    const focusTarget = Math.min(pasted.length, 5);
    inputRefs.current[focusTarget]?.focus();
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    const otpCode = digits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onVerify({ email, otp: otpCode });
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError('');
    try {
      await onResend({ email });
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Your Account"
      description={`A 6-digit verification code was sent to ${email}`}
    >
      <form onSubmit={handleSubmit} className="mt-4 space-y-5">
        <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-12 text-center text-lg font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
          ))}
        </div>

        {error && <p className="text-center text-xs text-rose-500 font-medium">{error}</p>}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isSubmitting}
          disabled={digits.some((d) => !d)}
        >
          Verify & Sign In
        </Button>

        <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending}
            className="flex items-center gap-1 font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
          >
            {isResending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
            <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
