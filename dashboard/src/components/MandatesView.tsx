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
  const [filter, setFilter] = useState<'all' | 'active' | 'matured' | 'completed' | 'cancelled'>('all');
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
    if (status === 'matured') return 'Matured — Queued For Disbursement';
    if (status === 'cancelled') return 'Contract Cancelled';
    const diff = new Date(expiresAt).getTime() - currentTime;
    if (diff <= 0) return 'Matured — Queued For Disbursement';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const filtered = investments.filter(inv => {
    if (filter === 'active') return inv.status === 'active';
    if (filter === 'matured') return inv.status === 'matured';
    if (filter === 'completed') return inv.status === 'completed';
    if (filter === 'cancelled') return inv.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-[#EAECEF] tracking-tight">Active Investments</h2>
          <p className="text-xs text-[#848E9C] font-sans mt-0.5">Automated smart contracts locking capital across defined cycle horizons</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-[#181A20] border border-[#2B313A] flex flex-wrap gap-1 text-xs font-sans">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${filter === 'all' ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm' : 'text-[#848E9C] hover:text-[#EAECEF]'}`}
            >
              All ({investments.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-md transition-all ${filter === 'active' ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm' : 'text-[#848E9C] hover:text-[#EAECEF]'}`}
            >
              Active ({investments.filter(i => i.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('matured')}
              className={`px-3 py-1.5 rounded-md transition-all ${filter === 'matured' ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm' : 'text-[#848E9C] hover:text-[#EAECEF]'}`}
            >
              Matured ({investments.filter(i => i.status === 'matured').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-md transition-all ${filter === 'completed' ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm' : 'text-[#848E9C] hover:text-[#EAECEF]'}`}
            >
              Settled ({investments.filter(i => i.status === 'completed').length})
            </button>
            {investments.some(i => i.status === 'cancelled') && (
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-3 py-1.5 rounded-md transition-all ${filter === 'cancelled' ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm' : 'text-[#848E9C] hover:text-[#EAECEF]'}`}
              >
                Cancelled ({investments.filter(i => i.status === 'cancelled').length})
              </button>
            )}
          </div>

          <button 
            onClick={onRefresh}
            title="Refresh Status"
            className="p-2 rounded-lg bg-[#181A20] hover:bg-[#2B313A] border border-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] transition-all shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Investment Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(inv => {
            const countdownStr = formatCountdown(inv.expiresAt, inv.status);
            const isCompleted = inv.status === 'completed';
            const isMatured = inv.status === 'matured';
            const isCancelled = inv.status === 'cancelled';

            // Calculate live progress percentage
            const started = new Date(inv.startedAt).getTime();
            const expires = new Date(inv.expiresAt).getTime();
            const progress = (isCompleted || isMatured)
              ? 100
              : isCancelled
              ? 0
              : Math.min(100, Math.max(0, Math.round(((currentTime - started) / (expires - started)) * 100)));

            return (
              <div 
                key={inv.id} 
                className={`p-6 rounded-2xl bg-[#1E2329] relative overflow-hidden transition-all border ${
                  isMatured
                    ? 'border-[#F0B90B] shadow-xl shadow-[#F0B90B]/10'
                    : isCancelled
                    ? 'border-[#F6465D]/30 bg-[#F6465D]/5'
                    : isCompleted
                    ? 'border-[#2B313A] opacity-80'
                    : 'border-[#2B313A] hover:border-[#F0B90B]/40 shadow-xl shadow-black/40'
                }`}
              >
                {/* Top Badge & Duration */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B] font-bold text-xs font-sans">
                      {inv.durationHours}h
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-lg text-[#EAECEF] tracking-tight">{inv.planName}</h3>
                      <div className="text-[10px] text-[#848E9C] font-mono uppercase tracking-wider">
                        Lockup Horizon: {inv.durationHours} Hours
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isMatured
                      ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30 animate-pulse'
                      : isCancelled
                      ? 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30'
                      : isCompleted 
                      ? 'bg-[#2B313A] text-[#848E9C] border border-[#363D47]' 
                      : 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                  }`}>
                    {isMatured && <Sparkles className="w-3 h-3 text-[#F0B90B]" />}
                    {isCancelled && <Lock className="w-3 h-3 text-[#F6465D]" />}
                    {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                    {!isMatured && !isCancelled && !isCompleted && <Lock className="w-3 h-3" />}
                    {isMatured ? 'Matured (Pending Release)' : isCancelled ? 'Cancelled' : isCompleted ? 'Disbursed' : 'In Timelock'}
                  </span>
                </div>

                {/* Capital & Yield Numbers */}
                <div className="grid grid-cols-3 gap-2 p-4 rounded-xl bg-[#181A20] border border-[#2B313A] my-4">
                  <div>
                    <div className="text-[10px] text-[#848E9C] font-mono uppercase">Principal</div>
                    <div className="text-base font-sans font-bold text-[#EAECEF] mt-0.5">
                      ${inv.amount.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-[#848E9C] font-mono uppercase">Return Rate</div>
                    <div className="text-base font-sans font-bold text-[#F0B90B] mt-0.5">
                      +{(inv.rate * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-[#848E9C] font-mono uppercase">Total Payout</div>
                    <div className="text-base font-sans font-bold text-[#0ECB81] mt-0.5">
                      ${inv.totalPayout.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Cancellation Notice Banner if Cancelled */}
                {isCancelled && (
                  <div className="p-3 rounded-xl bg-[#F6465D]/10 border border-[#F6465D]/20 text-xs font-mono space-y-1 my-3 text-[#F6465D]">
                    <div className="font-bold">Contract Terminated by Compliance:</div>
                    <div className="text-[#EAECEF]/80 italic text-[11px]">"{inv.cancellationReason || 'Rule violation'}"</div>
                  </div>
                )}

                {/* Live Countdown Clock Widget */}
                <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A] my-4">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#848E9C] flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-[#F0B90B] animate-pulse" />
                      {isMatured ? 'Maturity Status' : isCancelled ? 'Status' : 'Time Remaining'}
                    </span>
                    <span className={`font-bold font-mono text-sm tracking-wider ${isMatured ? 'text-[#F0B90B]' : isCancelled ? 'text-[#F6465D]' : 'text-[#F0B90B]'}`}>
                      {countdownStr}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#2B313A] overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isMatured ? 'bg-[#F0B90B]' : isCancelled ? 'bg-[#F6465D]' : isCompleted ? 'bg-[#0ECB81]' : 'bg-gradient-to-r from-[#F0B90B] to-[#0ECB81]'
                      }`}
                      style={{ width: `${Math.max(4, progress)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-[#848E9C] mt-2">
                    <span>Started: {new Date(inv.startedAt).toLocaleDateString()}</span>
                    <span>Matures: {new Date(inv.expiresAt).toLocaleDateString()} {new Date(inv.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Bottom Assurance */}
                <div className="flex items-center justify-between text-[11px] text-[#848E9C] pt-2 border-t border-[#2B313A] font-mono">
                  <span className="flex items-center gap-1 text-[#848E9C]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0ECB81]" /> Smart Contract Audited
                  </span>
                  <span>{isMatured ? 'Disbursement: Awaiting Release' : isCancelled ? 'Disbursement: Voided' : 'Disbursement: 100% Backed'}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-[#1E2329] border border-[#2B313A] text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-center justify-center mx-auto text-[#F0B90B]">
            <Timer className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-sans font-bold text-[#EAECEF] tracking-tight">No Investments Found</h3>
          <p className="text-xs text-[#848E9C] leading-relaxed font-sans">
            You currently have no {filter === 'all' ? '' : filter} capital allocations. Deploy your available balance into the Amateur (24h), Standard (48h), Premium (72h), or Retirement (96h) plan to start earning.
          </p>
          <button
            onClick={onOpenInvest}
            className="px-6 py-3 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-bold tracking-wide transition-all shadow-md shadow-[#F0B90B]/20 inline-flex items-center gap-2 font-sans active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Deploy Capital Into Plans ↗
          </button>
        </div>
      )}
    </div>
  );
};
