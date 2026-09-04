import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle2, Lock, ShieldCheck, ArrowRight, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import { Investment } from '../types';

interface MandatesViewProps {
  investments: Investment[];
  onRefresh: () => void;
  onOpenInvest: () => void;
}

export const MandatesView: React.FC<MandatesViewProps> = ({
  investments,
  onRefresh,
  onOpenInvest
}) => {
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Real-time second tick for precision countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (expiresAt: string, status: string) => {
    if (status === 'completed') return 'Matured & Disbursed';
    const diff = new Date(expiresAt).getTime() - currentTime;
    if (diff <= 0) return 'Matured (Disbursing...)';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const filtered = investments.filter(inv => {
    if (filter === 'active') return inv.status === 'active';
    if (filter === 'completed') return inv.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-tight">Active Escrow Mandates</h2>
          <p className="text-xs text-white/50 font-mono mt-0.5">Automated smart contracts locking capital across defined cycle horizons</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] flex gap-1 text-xs">
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'active' ? 'bg-gold text-[#0b0d0d] font-bold shadow-sm' : 'text-white/60 hover:text-white'}`}
            >
              Active ({investments.filter(i => i.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'completed' ? 'bg-gold text-[#0b0d0d] font-bold shadow-sm' : 'text-white/60 hover:text-white'}`}
            >
              Completed ({investments.filter(i => i.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-gold text-[#0b0d0d] font-bold shadow-sm' : 'text-white/60 hover:text-white'}`}
            >
              All ({investments.length})
            </button>
          </div>

          <button 
            onClick={onRefresh}
            title="Refresh Status"
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mandate Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(inv => {
            const countdownStr = formatCountdown(inv.expiresAt, inv.status);
            const isCompleted = inv.status === 'completed';

            // Calculate live progress percentage
            const started = new Date(inv.startedAt).getTime();
            const expires = new Date(inv.expiresAt).getTime();
            const progress = isCompleted ? 100 : Math.min(100, Math.max(0, Math.round(((currentTime - started) / (expires - started)) * 100)));

            return (
              <div 
                key={inv.id} 
                className={`p-6 rounded-2xl glass-card relative overflow-hidden transition-all ${
                  isCompleted ? 'border-white/[0.06] opacity-80' : 'border-gold/30 hover:border-gold/60 shadow-xl shadow-black/40'
                }`}
              >
                {/* Top Badge & Duration */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-bold text-xs">
                      {inv.durationHours}h
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-white">{inv.planName}</h3>
                      <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                        Lockup Horizon: {inv.durationHours} Hours
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isCompleted 
                      ? 'bg-white/[0.06] text-white/60 border border-white/[0.1]' 
                      : 'bg-emerald-950/60 text-emerald-glow border border-emerald-500/30'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {isCompleted ? 'Disbursed' : 'In Timelock'}
                  </span>
                </div>

                {/* Capital & Yield Numbers */}
                <div className="grid grid-cols-3 gap-2 p-4 rounded-xl bg-black/40 border border-white/[0.05] my-4">
                  <div>
                    <div className="text-[10px] text-white/40 font-mono uppercase">Principal</div>
                    <div className="text-base font-serif font-bold text-white mt-0.5">
                      ${inv.amount.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-white/40 font-mono uppercase">Return Rate</div>
                    <div className="text-base font-serif font-bold text-gold mt-0.5">
                      +{(inv.rate * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-white/40 font-mono uppercase">Total Payout</div>
                    <div className="text-base font-serif font-bold text-emerald-glow mt-0.5">
                      ${inv.totalPayout.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Live Countdown Clock Widget */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] my-4">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-white/50 flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-gold animate-pulse" />
                      Time Remaining Until Disbursement
                    </span>
                    <span className="text-gold font-bold font-mono text-sm tracking-wider">
                      {countdownStr}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isCompleted ? 'bg-emerald-glow' : 'bg-gradient-to-r from-gold via-amber-400 to-emerald-glow'
                      }`}
                      style={{ width: `${Math.max(4, progress)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-white/40 mt-2">
                    <span>Started: {new Date(inv.startedAt).toLocaleDateString()}</span>
                    <span>Matures: {new Date(inv.expiresAt).toLocaleDateString()} {new Date(inv.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Bottom Assurance */}
                <div className="flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/[0.06] font-mono">
                  <span className="flex items-center gap-1 text-white/50">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-glow" /> Smart Contract Audited
                  </span>
                  <span>Disbursement: Automated 100%</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-2xl glass-card text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto text-gold">
            <Timer className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-white">No Mandates Found</h3>
          <p className="text-xs text-white/50 leading-relaxed">
            You currently have no {filter} capital allocations. Deploy your available balance into the Amateur (24h), Standard (48h), Premium (72h), or Retirement (96h) plan to start earning.
          </p>
          <button
            onClick={onOpenInvest}
            className="px-6 py-3 rounded-xl bg-gold hover:bg-gold-light text-[#0b0d0d] text-xs font-bold tracking-wide transition-all shadow-lg shadow-gold/20 inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Deploy Capital Into Plans ↗
          </button>
        </div>
      )}
    </div>
  );
};
