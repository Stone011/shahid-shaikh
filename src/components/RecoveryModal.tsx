import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  Mail,
  Phone,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Send,
  Sparkles,
  Key,
} from 'lucide-react';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

type RecoveryStep =
  | 'choose_option'
  | 'requesting_otp'
  | 'enter_otp'
  | 'show_username'
  | 'set_new_password'
  | 'password_changed';

type RecoveryPurpose = 'username' | 'password';

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  isOpen,
  onClose,
  onBackToLogin,
}) => {
  const [purpose, setPurpose] = useState<RecoveryPurpose>('password');
  const [step, setStep] = useState<RecoveryStep>('choose_option');

  // Contact info
  const [maskedEmail, setMaskedEmail] = useState<string>('s****@gmail.com');
  const [maskedPhone, setMaskedPhone] = useState<string>('******1234');

  // OTP state
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timers
  const [resendCountdown, setResendCountdown] = useState<number>(60);
  const [otpExpiryCountdown, setOtpExpiryCountdown] = useState<number>(300); // 5 minutes (300s)
  const [isResendAvailable, setIsResendAvailable] = useState<boolean>(false);
  const [isOtpExpired, setIsOtpExpired] = useState<boolean>(false);

  // Status & Feedback
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Username recovery result
  const [recoveredUsername, setRecoveredUsername] = useState<string>('');
  const [copiedUsername, setCopiedUsername] = useState<boolean>(false);

  // Password reset state
  const [recoveryToken, setRecoveryToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Fetch recovery info on mount
  useEffect(() => {
    if (!isOpen) return;

    const fetchRecoveryInfo = async () => {
      try {
        const res = await fetch('/api/auth/recovery/info');
        if (res.ok) {
          const data = await res.json();
          if (data.maskedEmail) setMaskedEmail(data.maskedEmail);
          if (data.maskedPhone) setMaskedPhone(data.maskedPhone);
        }
      } catch {
        // Fallback defaults
      }
    };

    fetchRecoveryInfo();
  }, [isOpen]);

  // Resend Countdown Timer
  useEffect(() => {
    if (step !== 'enter_otp') return;

    if (resendCountdown > 0) {
      const timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setIsResendAvailable(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, resendCountdown]);

  // OTP 5-Minute Expiry Countdown Timer
  useEffect(() => {
    if (step !== 'enter_otp') return;

    if (otpExpiryCountdown > 0) {
      const timer = setInterval(() => {
        setOtpExpiryCountdown((prev) => {
          if (prev <= 1) {
            setIsOtpExpired(true);
            setErrorMessage('OTP expired. Please click "Send OTP again" below.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, otpExpiryCountdown]);

  if (!isOpen) return null;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Trigger OTP Request
  const handleRequestOTP = async (selectedPurpose: RecoveryPurpose) => {
    setPurpose(selectedPurpose);
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage('Sending OTP...');
    setOtpValues(['', '', '', '', '', '']);
    setIsOtpExpired(false);
    setIsResendAvailable(false);
    setResendCountdown(60);
    setOtpExpiryCountdown(300); // 5 minutes

    try {
      const res = await fetch('/api/auth/recovery/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        if (data.maskedEmail) setMaskedEmail(data.maskedEmail);
        if (data.maskedPhone) setMaskedPhone(data.maskedPhone);
        setStatusMessage('OTP sent successfully to your verified email and phone.');
        setStep('enter_otp');

        // Focus first OTP box
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        if (data.locked) {
          setIsLocked(true);
        }
        setErrorMessage(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Network connection error. Please check your connection.');
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!isResendAvailable && !isOtpExpired) return;
    await handleRequestOTP(purpose);
  };

  // Handle OTP digit inputs
  const handleOtpChange = (index: number, val: string) => {
    if (isOtpExpired || isLocked) return;

    const sanitized = val.replace(/[^0-9]/g, '');
    if (!sanitized) {
      const updated = [...otpValues];
      updated[index] = '';
      setOtpValues(updated);
      return;
    }

    // Single digit input
    const char = sanitized.slice(-1);
    const updated = [...otpValues];
    updated[index] = char;
    setOtpValues(updated);

    // Auto focus next input
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits filled, automatically verify
    const combined = updated.join('');
    if (combined.length === 6) {
      handleVerifyOTP(combined);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const updated = ['', '', '', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        updated[i] = pasted[i];
      }
      setOtpValues(updated);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIdx]?.focus();

      if (pasted.length === 6) {
        handleVerifyOTP(pasted);
      }
    }
  };

  // Verify OTP Call
  const handleVerifyOTP = async (otpCode?: string) => {
    const code = otpCode || otpValues.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the OTP code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage('Verifying OTP...');

    try {
      const res = await fetch('/api/auth/recovery/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: code, purpose }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setStatusMessage('OTP verified successfully!');

        if (purpose === 'username') {
          setRecoveredUsername(data.username || data.maskedUsername || 'shahid shaikh');
          setStep('show_username');
        } else {
          setRecoveryToken(data.recoveryToken);
          setStep('set_new_password');
        }
      } else {
        if (data.expired) {
          setIsOtpExpired(true);
        }
        if (data.locked) {
          setIsLocked(true);
        }
        if (data.remainingAttempts !== undefined) {
          setAttemptsRemaining(data.remainingAttempts);
        }
        setErrorMessage(data.message || 'Invalid OTP. Please check and try again.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Verification failed due to a network error.');
    }
  };

  // Password Requirement Checks
  const passwordChecks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword,
  };

  const validCount = Object.values(passwordChecks).filter(Boolean).length;
  const isPasswordValid =
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.lowercase &&
    passwordChecks.number &&
    passwordChecks.special &&
    passwordChecks.match;

  // Strength score
  const getStrengthLabel = () => {
    if (newPassword.length === 0) return { label: 'Empty', color: 'bg-zinc-800', textColor: 'text-zinc-500' };
    if (validCount <= 2) return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-400' };
    if (validCount <= 4) return { label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-400' };
    return { label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
  };

  const strength = getStrengthLabel();

  // Reset Password Submission
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setErrorMessage('Please ensure your new password satisfies all security requirements.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage('Updating password securely...');

    try {
      const res = await fetch('/api/auth/recovery/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recoveryToken,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setStep('password_changed');
        setStatusMessage(null);
      } else {
        setErrorMessage(data.message || 'Failed to update password. Please try again.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Failed to connect to authentication server.');
    }
  };

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(recoveredUsername);
    setCopiedUsername(true);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Back / Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={step === 'choose_option' ? onBackToLogin : () => setStep('choose_option')}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-300 transition-colors p-1 -ml-1 cursor-pointer font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 'choose_option' ? 'Back to Login' : 'Back to Options'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-400">
            <ShieldCheck className="w-3 h-3" />
            <span>2FA OTP RECOVERY</span>
          </div>
        </div>

        {/* Dynamic Status / Error Messages */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-in shake duration-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">{errorMessage}</span>
              {attemptsRemaining !== null && attemptsRemaining > 0 && (
                <span className="text-[11px] text-red-300/80 mt-0.5 block">
                  Remaining attempts: {attemptsRemaining}
                </span>
              )}
            </div>
          </div>
        )}

        {statusMessage && !errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* =========================================================================
            STEP 1: CHOOSE OPTION (FORGOT USERNAME OR FORGOT PASSWORD)
           ========================================================================= */}
        {step === 'choose_option' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white">
                ACCOUNT RECOVERY
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Select an option to securely recover your login credentials using 2-Factor OTP verification.
              </p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Forgot Username */}
              <button
                type="button"
                onClick={() => handleRequestOTP('username')}
                disabled={isLoading}
                className="w-full text-left p-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-900 border border-white/10 hover:border-amber-500/50 transition-all duration-200 cursor-pointer group shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Forgot Username
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Verify OTP to securely reveal your administrative username.
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 2: Forgot Password */}
              <button
                type="button"
                onClick={() => handleRequestOTP('password')}
                disabled={isLoading}
                className="w-full text-left p-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-900 border border-white/10 hover:border-amber-500/50 transition-all duration-200 cursor-pointer group shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Forgot Password
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Verify OTP to set a new password for your account.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Masked destination preview note */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-white/[0.06] space-y-1.5 text-[11px] font-mono text-zinc-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verified Email:</span>
                </span>
                <span className="text-white font-semibold">{maskedEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verified Mobile:</span>
                </span>
                <span className="text-white font-semibold">{maskedPhone}</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: ENTER 6-DIGIT OTP
           ========================================================================= */}
        {step === 'enter_otp' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white">
                ENTER 6-DIGIT OTP
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                We sent a 6-digit one-time code to both your verified email &amp; phone.
              </p>
            </div>

            {/* Masked contact chips */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-[11px] font-mono text-zinc-400">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300">
                ✉️ {maskedEmail}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300">
                📱 {maskedPhone}
              </span>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
              {otpValues.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  disabled={isOtpExpired || isLocked || isLoading}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-bold rounded-xl border transition-all ${
                    digit
                      ? 'bg-amber-500/15 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-zinc-900/90 border-white/10 text-white focus:border-amber-500 focus:outline-none'
                  } ${isOtpExpired ? 'opacity-40 border-red-500/40' : ''}`}
                />
              ))}
            </div>

            {/* Expiry & Resend Countdown Status */}
            <div className="space-y-3 pt-2 text-center text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>OTP Valid for:</span>
                </span>
                <span className={otpExpiryCountdown < 60 ? 'text-red-400 font-bold' : 'text-zinc-300 font-bold'}>
                  {isOtpExpired ? 'EXPIRED' : formatTime(otpExpiryCountdown)}
                </span>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={() => handleVerifyOTP()}
                disabled={otpValues.join('').length !== 6 || isLoading || isOtpExpired || isLocked}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs tracking-widest uppercase transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'VERIFYING OTP...' : 'VERIFY OTP CODE'}
              </button>

              {/* Resend OTP Section */}
              <div className="pt-2">
                {isResendAvailable || isOtpExpired ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isOtpExpired ? 'Send OTP again' : 'Resend OTP now'}</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-zinc-500">
                    Resend OTP in <strong className="text-zinc-400">{resendCountdown}s</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3A: FORGOT USERNAME - SHOW RECOVERED USERNAME
           ========================================================================= */}
        {step === 'show_username' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white">
                IDENTITY VERIFIED
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Your administrative username has been retrieved successfully.
              </p>
            </div>

            {/* Recovered Username Box */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-amber-500/40 text-center space-y-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                YOUR ADMIN USERNAME IS
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg sm:text-xl font-mono font-bold text-amber-300 tracking-wide">
                  {recoveredUsername}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUsername}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy username"
                >
                  {copiedUsername ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {copiedUsername && (
                <span className="text-[10px] font-mono text-emerald-400 block animate-in fade-in">
                  Copied to clipboard!
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs tracking-widest uppercase transition-all shadow-xl shadow-amber-500/20 cursor-pointer"
            >
              PROCEED TO LOGIN
            </button>
          </div>
        )}

        {/* =========================================================================
            STEP 3B: FORGOT PASSWORD - SET NEW PASSWORD
           ========================================================================= */}
        {step === 'set_new_password' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div className="text-center mb-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
                CREATE NEW PASSWORD
              </h3>
              <p className="text-xs text-zinc-400">
                Choose a strong password to protect your portfolio CMS.
              </p>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs placeholder:text-zinc-600 font-mono transition-colors"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Strength Bar */}
            {newPassword.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-400">Password Strength:</span>
                  <span className={`font-bold ${strength.textColor}`}>{strength.label}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(validCount / 6) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs placeholder:text-zinc-600 font-mono transition-colors"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Requirements Checklist */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/[0.06] space-y-1.5 text-[10px] font-mono">
              <span className="text-zinc-400 uppercase block mb-1">Security Requirements:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <span className={passwordChecks.length ? 'text-emerald-400 flex items-center gap-1' : 'text-zinc-500 flex items-center gap-1'}>
                  {passwordChecks.length ? '✓' : '•'} Min 8 characters
                </span>
                <span className={passwordChecks.uppercase ? 'text-emerald-400 flex items-center gap-1' : 'text-zinc-500 flex items-center gap-1'}>
                  {passwordChecks.uppercase ? '✓' : '•'} 1 Uppercase (A-Z)
                </span>
                <span className={passwordChecks.lowercase ? 'text-emerald-400 flex items-center gap-1' : 'text-zinc-500 flex items-center gap-1'}>
                  {passwordChecks.lowercase ? '✓' : '•'} 1 Lowercase (a-z)
                </span>
                <span className={passwordChecks.number ? 'text-emerald-400 flex items-center gap-1' : 'text-zinc-500 flex items-center gap-1'}>
                  {passwordChecks.number ? '✓' : '•'} 1 Number (0-9)
                </span>
                <span className={passwordChecks.special ? 'text-emerald-400 flex items-center gap-1' : 'text-zinc-500 flex items-center gap-1'}>
                  {passwordChecks.special ? '✓' : '•'} 1 Special Char (!@#$)
                </span>
                <span className={passwordChecks.match ? 'text-emerald-400 flex items-center gap-1' : 'text-zinc-500 flex items-center gap-1'}>
                  {passwordChecks.match ? '✓' : '•'} Passwords Match
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isPasswordValid || isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs tracking-widest uppercase transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'UPDATING PASSWORD...' : 'CHANGE PASSWORD & SAVE'}
            </button>
          </form>
        )}

        {/* =========================================================================
            STEP 4: PASSWORD CHANGED SUCCESSFULLY
           ========================================================================= */}
        {step === 'password_changed' && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10 animate-in zoom-in-95">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white">
                Password changed successfully
              </h3>
              <p className="text-xs text-zinc-400 mt-2">
                Your administrative password has been updated. All previous password-reset sessions have been automatically invalidated.
              </p>
            </div>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs tracking-widest uppercase transition-all shadow-xl shadow-amber-500/20 cursor-pointer"
            >
              LOGIN WITH NEW PASSWORD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
