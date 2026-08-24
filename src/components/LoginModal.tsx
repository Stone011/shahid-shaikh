import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Lock, User, Eye, EyeOff, X, Sliders, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';
import { RecoveryModal } from './RecoveryModal';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login } = usePortfolio();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await login(username, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.message || 'Invalid username or password. Please try again.');
    }
  };

  const handleOpenRecovery = () => {
    setIsRecoveryOpen(true);
  };

  const handleCloseRecovery = () => {
    setIsRecoveryOpen(false);
  };

  const handleBackToLoginFromRecovery = () => {
    setIsRecoveryOpen(false);
  };

  return (
    <>
      {isRecoveryOpen ? (
        <RecoveryModal
          isOpen={isRecoveryOpen}
          onClose={() => {
            setIsRecoveryOpen(false);
            setIsLoginModalOpen(false);
          }}
          onBackToLogin={handleBackToLoginFromRecovery}
        />
      ) : (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 text-white animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
                <Sliders className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-white uppercase tracking-wider">
                ADMIN LOGIN
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your credentials to customize portfolio projects, catalogues, and layout sections.
              </p>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Username / Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username (e.g. shahid shaikh)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs placeholder:text-zinc-600 transition-colors"
                    autoFocus
                  />
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs placeholder:text-zinc-600 transition-colors font-mono"
                  />
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-xl shadow-amber-500/20 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? 'VERIFYING...' : 'LOGIN TO CUSTOMIZE'}
              </button>

              {/* Forgot Username or Password Link */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleOpenRecovery}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 transition-colors font-mono cursor-pointer hover:underline"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Forgot username or password?</span>
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Protected Owner Session • 2FA Recovery Supported</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

