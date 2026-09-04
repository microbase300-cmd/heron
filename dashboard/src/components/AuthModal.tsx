import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        onSuccess(res.user);
      } else {
        const res = await api.register(name, email, password, referralCode);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login('investor@heronassets.com', 'Heron2026!');
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Demo access failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-md rounded-2xl glass-card-featured border-gold/40 p-8 shadow-2xl shadow-black">
        {/* Logo */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/40 flex items-center justify-center text-gold font-serif text-2xl font-bold mx-auto shadow-lg shadow-gold/15">
            H
          </div>
          <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Client Access' : 'Create Investor Account'}
          </h3>
          <p className="text-xs text-white/50 font-mono">
            {mode === 'login' ? 'Authenticate to access portfolio intelligence' : 'Open a sovereign digital asset mandate account'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] flex gap-1 mb-6 text-xs font-mono">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`w-1/2 py-2 rounded-lg font-bold transition-all ${
              mode === 'login' ? 'bg-gold text-[#0b0d0d] shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
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
          )}

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

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono text-white/50 mb-1">Referral Code (Optional)</label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="e.g. HERON-8821"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs uppercase font-mono"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-gold-light hover:brightness-105 text-[#0b0d0d] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Enter Client Dashboard ↗' : 'Register Account ↗'}
          </button>
        </form>

        {/* Instant Demo Account Button */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] text-center space-y-2">
          <div className="text-[11px] font-mono text-white/40">Looking to review the platform immediately?</div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-gold/40 text-gold text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>One-Click Institutional Demo Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
