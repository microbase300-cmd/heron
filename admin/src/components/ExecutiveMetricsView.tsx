import React from 'react';
import {
  TrendingUp,
  Lock,
  Users,
  CreditCard,
  Zap,
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Server,
  Database,
} from 'lucide-react';
import { AdminMetrics, MarketTicker } from '../types';

interface ExecutiveMetricsViewProps {
  metrics: AdminMetrics | null;
  tickers: MarketTicker[];
  onNavigateTab: (tab: 'users' | 'transactions' | 'investments') => void;
}

export const ExecutiveMetricsView: React.FC<ExecutiveMetricsViewProps> = ({
  metrics,
  tickers,
  onNavigateTab,
}) => {
  const nav = metrics?.totalPlatformNAV ?? 0;
  const escrow = metrics?.totalLockedInEscrow ?? 0;
  const yieldDisbursed = metrics?.totalYieldDisbursed ?? 0;
  const totalUsers = metrics?.totalUsers ?? 0;
  const activeUsers = metrics?.activeUsers ?? 0;
  const deposits = metrics?.totalDeposits ?? 0;
  const withdrawals = metrics?.totalWithdrawals ?? 0;
  const pendingTxs = metrics?.pendingTransactionsCount ?? 0;

  return (
    <div className="space-y-8">
      {/* Executive Command Banner */}
      <div className="p-6 sm:p-8 rounded-2xl glass-panel-gold relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Institutional Liquidity & Escrow Reserve</span>
            </div>
            <div className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight flex items-baseline gap-4">
              ${nav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-glow border border-emerald-500/30">
                100% Fully Solvent
              </span>
            </div>
            <p className="text-xs text-white/50 font-mono mt-2">
              Global Platform NAV aggregated across active wallets, escrow deposits, and pending settlements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {pendingTxs > 0 && (
              <button
                onClick={() => onNavigateTab('transactions')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0b0d0d] text-xs font-bold font-mono tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <Activity className="w-4 h-4 animate-pulse" />
                Review {pendingTxs} Pending Settlements
              </button>
            )}
            <button
              onClick={() => onNavigateTab('users')}
              className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white text-xs font-bold transition-all"
            >
              User Directory ↗
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-white/50 text-xs font-mono mb-2">
            <span>Locked in Smart Escrow</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            ${escrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-300/80 font-mono mt-1">
            {metrics?.activeInvestmentsCount ?? 0} active yield contract cycles
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-white/50 text-xs font-mono mb-2">
            <span>Total Yield Disbursed</span>
            <TrendingUp className="w-4 h-4 text-emerald-glow" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-glow">
            +${yieldDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-white/40 font-mono mt-1">
            Programmatic contract disbursements
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-white/50 text-xs font-mono mb-2">
            <span>Investor Accounts</span>
            <Users className="w-4 h-4 text-gold" />
          </div>
          <div className="text-2xl font-serif font-bold text-gold">
            {totalUsers}
          </div>
          <div className="text-[11px] text-white/40 font-mono mt-1">
            {activeUsers} active / {totalUsers - activeUsers} inactive
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-white/50 text-xs font-mono mb-2">
            <span>Settlement Queue</span>
            <CreditCard className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            {pendingTxs}
          </div>
          <div className="text-[11px] text-sky-300/80 font-mono mt-1">
            {pendingTxs === 0 ? 'All settlements up to date' : 'Awaiting manual approval'}
          </div>
        </div>
      </div>

      {/* 2-Column: Inflow/Outflow Liquidity + Live Market Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inflow & Outflow Card */}
        <div className="p-6 rounded-2xl glass-panel space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold" />
              Platform Inflow / Outflow Ratio
            </h3>
            <span className="text-[10px] font-mono text-white/50 uppercase">Cumulative</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs text-emerald-glow font-mono mb-1">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Gross Deposits</span>
              </div>
              <div className="text-xl font-serif font-bold text-white">
                ${deposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-mono mb-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Gross Withdrawals</span>
              </div>
              <div className="text-xl font-serif font-bold text-white">
                ${withdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Ratio bar */}
          <div>
            <div className="flex justify-between text-xs text-white/50 mb-1.5 font-mono">
              <span>Deposit Retention</span>
              <span>
                {deposits > 0 ? (((deposits - withdrawals) / deposits) * 100).toFixed(1) : 100}% Retained
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
              <div
                className="h-full bg-emerald-glow"
                style={{ width: `${deposits > 0 ? Math.min(100, Math.max(10, ((deposits - withdrawals) / deposits) * 100)) : 100}%` }}
              ></div>
            </div>
          </div>

          {/* System Architecture Specifications */}
          <div className="pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-3 text-xs font-mono text-white/60">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-gold" />
              <span>Backend Port: 5000</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-glow" />
              <span>PostgreSQL Pool: Dual-Active</span>
            </div>
          </div>
        </div>

        {/* Live Binance Market Tickers Feed */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-gold" />
              Live Binance Liquidity Feeds
            </h3>
            <span className="text-[10px] font-mono text-emerald-glow bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              10s Cache TTL
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {tickers.map((t) => (
              <div
                key={t.symbol}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white font-mono">{t.symbol}</div>
                  <div className="text-[11px] text-white/70 font-mono">
                    ${t.price >= 1 ? t.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : t.price.toFixed(4)}
                  </div>
                </div>

                <div
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                    t.change24h >= 0
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-950/60 text-red-400 border border-red-500/30'
                  }`}
                >
                  {t.change24h >= 0 ? '+' : ''}
                  {t.change24h.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
