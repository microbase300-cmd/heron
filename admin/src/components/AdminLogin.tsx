import React, { useState } from 'react';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { adminApi } from '../services/api';
import { AdminUser } from '../types';

interface AdminLoginProps {
  onSuccess: (user: AdminUser) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('admin@heronassets.com');
  const [password, setPassword] = useState('Heron2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await adminApi.login(email, password);
      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Verify executive credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070909] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-glow/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 text-gold mb-4 shadow-xl shadow-gold/10">
            <Shield className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white tracking-wider">
            HERON DIGITAL CAPITAL
          </h1>
          <p className="text-xs font-mono text-gold uppercase tracking-widest mt-1">
            Executive Operations & Settlement Portal
          </p>
        </div>

        {/* Login Form Box */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl relative">
          <div className="flex items-center gap-2 text-xs font-mono text-white/50 mb-6 pb-3 border-b border-white/[0.08]">
            <Lock className="w-3.5 h-3.5 text-gold" />
            <span>Restricted Level 4 Executive Clearance</span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-white/60 mb-1.5">
                Executive Work Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@heronassets.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/60 mb-1.5">
                Master Security Keyphrase
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
                <KeyRound className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gold hover:bg-gold-light text-[#0b0d0d] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating Clearance...</span>
              ) : (
                <>
                  <span>Authorize Operations Access</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Reminder */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] text-[11px] font-mono text-white/40 text-center">
            Default Root: <span className="text-white/70">admin@heronassets.com</span> • <span className="text-gold">Heron2026!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
