import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { adminApi } from '../services/api';
import { AdminUser } from '../types';

interface AdminLoginProps {
  onSuccess: (user: AdminUser) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-[#181A20] flex items-center justify-center p-4 relative overflow-hidden text-[#EAECEF]">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F0B90B]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0ECB81]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <img
            src="/heron_logo.jpg"
            alt="Heron Assets Trustees"
            className="inline-block w-16 h-16 rounded-full object-cover border border-[#F0B90B]/50 mb-4 shadow-xl shadow-[#F0B90B]/20"
          />
          <h1 className="font-sans text-2xl font-extrabold text-[#EAECEF] tracking-tight">
            HERON ASSETS TRUSTEES
          </h1>
          <p className="text-xs font-mono text-[#F0B90B] uppercase tracking-widest mt-1">
            Executive Operations & Settlement Portal
          </p>
        </div>

        {/* Login Form Box */}
        <div className="glass-panel p-8 rounded-xl border border-[#2B313A] shadow-2xl relative bg-[#1E2329]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#848E9C] mb-6 pb-3 border-b border-[#2B313A]">
            <Lock className="w-3.5 h-3.5 text-[#F0B90B]" />
            <span>Restricted Level 4 Executive Clearance</span>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-[#F6465D]/15 border border-[#F6465D]/30 text-[#F6465D] text-xs flex items-center gap-2.5 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#F6465D]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
                Executive Work Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@heronassets.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm bg-[#2B313A] border-[#363D47] text-[#EAECEF]"
                />
                <Mail className="w-4 h-4 text-[#848E9C] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
                Master Security Keyphrase
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm bg-[#2B313A] border-[#363D47] text-[#EAECEF]"
                />
                <KeyRound className="w-4 h-4 text-[#848E9C] absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg btn-binance font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
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
        </div>
      </div>
    </div>
  );
};

