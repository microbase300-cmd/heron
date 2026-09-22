import React, { useState, useEffect } from 'react';
import { Lock, Mail, User as UserIcon, AlertCircle, KeyRound, CheckCircle2, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialReferralCode?: string;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialReferralCode = '', onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registerStep, setRegisterStep] = useState<'form' | 'otp'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState(initialReferralCode);
  const [isReferralLocked, setIsReferralLocked] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Auto-detect referral code from initialReferralCode or URL or sessionStorage
  useEffect(() => {
    let codeToUse = initialReferralCode?.trim() || '';
    if (!codeToUse && typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const refUrl = urlParams.get('ref') || urlParams.get('referral');
        if (refUrl) {
          codeToUse = refUrl.trim().toUpperCase();
        } else {
          const stored = sessionStorage.getItem('heron_pending_referral');
          if (stored) codeToUse = stored.trim().toUpperCase();
        }
      } catch {}
    }

    if (codeToUse) {
      setReferralCode(codeToUse);
      setIsReferralLocked(true);
      setMode('register'); // Switch to register mode automatically when referred!
    }
  }, [initialReferralCode, isOpen]);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid institutional email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendRegistrationOtp(email);
      setDevOtp(res.devOtp || null);
      setInfoMessage(res.message);
      setRegisterStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.register(name, email, password, otpCode.trim(), referralCode || undefined);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email, password);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-md rounded-2xl glass-card-featured border-gold/40 p-8 shadow-2xl shadow-black">
        {/* Logo */}
        <div className="text-center space-y-2 mb-6">
          <img 
            src="/heron_logo.jpg" 
            alt="Heron Assets Trustee" 
            className="w-12 h-12 rounded-full object-cover border border-gold/50 mx-auto shadow-lg shadow-gold/25" 
          />
          <h3 className="font-sans text-2xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Client Access' : registerStep === 'otp' ? 'Security Verification' : 'Create Investor Account'}
          </h3>
          <p className="text-xs text-white/50 font-mono">
            {mode === 'login'
              ? 'Authenticate to access portfolio intelligence'
              : registerStep === 'otp'
              ? `Enter the 6-digit authorization code sent to ${email}`
              : 'Open a sovereign digital asset investment account'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] flex gap-1 mb-6 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setRegisterStep('form');
              setError(null);
            }}
            className={`w-1/2 py-2 rounded-lg font-bold transition-all ${
              mode === 'login' ? 'bg-gold text-[#0b0d0d] shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setRegisterStep('form');
              setError(null);
            }}
            className={`w-1/2 py-2 rounded-lg font-bold transition-all ${
              mode === 'register' ? 'bg-gold text-[#0b0d0d] shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{infoMessage}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-white/50 mb-1">Institutional Email</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-white/30 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/50 mb-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-white/30 absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-gold-light hover:brightness-105 text-[#0b0d0d] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Enter Client Dashboard ↗'}
            </button>
          </form>
        ) : registerStep === 'form' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-white/50 mb-1">Full Legal Name</label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 text-white/30 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alexander Sterling"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/50 mb-1">Institutional Email</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-white/30 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/50 mb-1">Create Access Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-white/30 absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••••• (min. 6 characters)"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono text-white/50">Referral Code (Optional)</label>
                {referralCode && (
                  <span className="text-[10px] font-mono text-[#0ECB81] flex items-center gap-1 font-bold">
                    <Check className="w-3 h-3" /> Auto-Applied via Invite
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => {
                    setReferralCode(e.target.value.toUpperCase());
                    setIsReferralLocked(false);
                  }}
                  placeholder="e.g. HERON-REF-9A7B3E2F41"
                  className={`w-full px-4 py-2.5 rounded-xl glass-input text-xs uppercase font-mono tracking-wider transition-all ${
                    referralCode
                      ? 'border-[#0ECB81]/60 bg-[#0ECB81]/5 text-[#0ECB81] font-bold focus:border-[#0ECB81]'
                      : 'text-white'
                  }`}
                />
                {referralCode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono font-bold text-[#0ECB81] bg-[#0ECB81]/15 px-2 py-0.5 rounded-md border border-[#0ECB81]/30">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Affiliate Partner</span>
                  </div>
                )}
              </div>
              {referralCode && (
                <p className="text-[10px] font-mono text-[#0ECB81]/90 mt-1">
                  ✓ You are registering directly under this partner's institutional network.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-gold-light hover:brightness-105 text-[#0b0d0d] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-gold/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Sending Code...' : 'Request Verification OTP ↗'}</span>
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-1">
              <div className="text-[11px] font-mono text-white/50">Verification Code Sent To:</div>
              <div className="text-xs font-sans font-bold text-gold">{email}</div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] font-mono leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <span>📩 Check Inbox & Spam Folder</span>
              </div>
              <p>We've dispatched your 6-digit code. If it doesn't appear in your main inbox within 30 seconds, please check your <strong>Spam / Junk</strong> folder.</p>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/50 mb-1 text-center">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                required
                autoFocus
                className="w-full text-center text-xl font-mono font-bold tracking-widest py-3 rounded-xl glass-input text-gold"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRegisterStep('form')}
                className="w-1/3 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-mono transition-all flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-light hover:brightness-105 text-[#0b0d0d] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-gold/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Verifying...' : 'Verify & Open Account'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
