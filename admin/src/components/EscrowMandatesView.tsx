import React, { useState } from 'react';
import {
  Layers,
  Clock,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Investment } from '../types';
import { adminApi } from '../services/api';

interface EscrowMandatesViewProps {
  investments: Investment[];
  onRefreshInvestments: () => void;
}

export const EscrowMandatesView: React.FC<EscrowMandatesViewProps> = ({
  investments,
  onRefreshInvestments,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const activeMandates = investments.filter((i) => i.status === 'active');
  const completedMandates = investments.filter((i) => i.status === 'completed');

  const handleForceMature = async (inv: Investment) => {
    if (
      !window.confirm(
        `🚨 EXECUTIVE OVERRIDE: Force immediate maturity for ${inv.planName} (ID: ${inv.id})?\n\nTotal payout of $${inv.totalPayout.toLocaleString()} will be credited immediately to User ${inv.userId}.`
      )
    ) {
      return;
    }

    setProcessingId(inv.id);
    try {
      const res = await adminApi.forceMatureInvestment(inv.id);
      alert(`Success: ${res.message} ($${res.totalPayout.toLocaleString()} disbursed)`);
      onRefreshInvestments();
    } catch (err: any) {
      alert(err.message || 'Failed to force-mature investment.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-gold" />
            Smart Escrow & Compounding Investments
          </h2>
          <p className="text-xs text-white/50 font-mono">
            Direct inspection of high-yield escrow contracts and automated maturity queues.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{activeMandates.length} Active in Escrow</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{completedMandates.length} Matured & Settled</span>
          </div>
        </div>
      </div>

      {/* Active Investments Grid */}
      <div className="space-y-3">
        <h3 className="font-serif text-sm font-bold text-white/80 uppercase tracking-wider font-mono">
          Active Escrow Contracts ({activeMandates.length})
        </h3>

        {activeMandates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMandates.map((inv) => (
              <div
                key={inv.id}
                className="p-5 rounded-2xl glass-panel border border-white/[0.08] hover:border-gold/30 transition-all space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-white text-base">{inv.planName}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-gold px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20">
                    {(inv.rate * 100).toFixed(1)}% / {inv.durationHours}h
                  </span>
                </div>

                <div className="text-[11px] font-mono text-white/50">
                  Investor: <span className="text-white font-semibold">{inv.userId}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-white/40 text-[10px]">Principal</div>
                    <div className="text-white font-bold">${inv.amount.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                    <div className="text-emerald-400 text-[10px]">Total Payout</div>
                    <div className="text-emerald-glow font-bold">${inv.totalPayout.toLocaleString()}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-white/50 mb-1">
                    <span>Maturity Progress</span>
                    <span>{inv.progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold to-emerald-glow transition-all duration-500"
                      style={{ width: `${Math.max(5, inv.progressPercent)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Force Mature Override Button */}
                <button
                  onClick={() => handleForceMature(inv)}
                  disabled={processingId === inv.id}
                  className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {processingId === inv.id ? 'Disbursing...' : 'Force Immediate Maturity'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl text-center text-white/40 font-mono text-xs">
            No active investor escrow investments at this time.
          </div>
        )}
      </div>

      {/* Completed Investments History */}
      {completedMandates.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="font-serif text-sm font-bold text-white/80 uppercase tracking-wider font-mono">
            Matured & Settled Investments ({completedMandates.length})
          </h3>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] text-white/50 font-mono uppercase border-b border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4">Investment ID</th>
                  <th className="py-3 px-4">Investor</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Committed</th>
                  <th className="py-3 px-4">Payout Disbursed</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {completedMandates.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono text-white/70">{m.id}</td>
                    <td className="py-3 px-4 font-mono text-white/50">{m.userId}</td>
                    <td className="py-3 px-4 font-serif font-bold text-white">{m.planName}</td>
                    <td className="py-3 px-4 font-mono">${m.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-glow">
                      +${m.totalPayout.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        MATURED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
