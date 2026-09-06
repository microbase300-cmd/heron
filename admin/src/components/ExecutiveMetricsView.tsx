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
      <div className="p-6 sm:p-8 rounded-xl glass-panel-gold relative overflow-hidden bg-gradient-to-r from-[#1E2329] to-[#2B313A]/60 border border-[#F0B90B]/30 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#F0B90B] uppercase tracking-widest mb-2 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#F0B90B]" />
              <span>Institutional Liquidity & Escrow Reserve</span>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-[#EAECEF] tracking-tight flex items-baseline gap-3">
              ${nav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                100% Fully Solvent
              </span>
            </div>
            <p className="text-xs text-[#848E9C] font-mono mt-1.5">
              Global Platform NAV aggregated across active wallets, escrow deposits, and pending settlements.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {pendingTxs > 0 && (
              <button
                onClick={() => onNavigateTab('transactions')}
                className="px-3.5 py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-bold font-mono tracking-wide transition-all shadow-md shadow-[#F0B90B]/20 flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                Review {pendingTxs} Pending Settlements
              </button>
            )}
            <button
              onClick={() => onNavigateTab('users')}
              className="px-3.5 py-2 rounded-lg bg-[#2B313A] hover:bg-[#363D47] border border-[#363D47] text-[#EAECEF] text-xs font-semibold transition-all"
            >
              User Directory ↗
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-xl glass-panel bg-[#1E2329] border border-[#2B313A] hover:border-[#F0B90B]/40 transition-all">
          <div className="flex items-center justify-between text-[#848E9C] text-[11px] font-mono mb-1.5">
            <span>Locked in Smart Escrow</span>
            <Lock className="w-3.5 h-3.5 text-[#F0B90B]" />
          </div>
          <div className="text-xl sm:text-2xl font-sans font-bold text-[#EAECEF] tracking-tight">
            ${escrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#F0B90B]/90 font-mono mt-1">
            {metrics?.activeInvestmentsCount ?? 0} active yield contract cycles
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl glass-panel bg-[#1E2329] border border-[#2B313A] hover:border-[#0ECB81]/40 transition-all">
          <div className="flex items-center justify-between text-[#848E9C] text-[11px] font-mono mb-1.5">
            <span>Total Yield Disbursed</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#0ECB81]" />
          </div>
          <div className="text-xl sm:text-2xl font-sans font-bold text-[#0ECB81] tracking-tight">
            +${yieldDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#848E9C] font-mono mt-1">
            Programmatic contract disbursements
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl glass-panel bg-[#1E2329] border border-[#2B313A] hover:border-[#F0B90B]/40 transition-all">
          <div className="flex items-center justify-between text-[#848E9C] text-[11px] font-mono mb-1.5">
            <span>Investor Accounts</span>
            <Users className="w-3.5 h-3.5 text-[#F0B90B]" />
          </div>
          <div className="text-xl sm:text-2xl font-sans font-bold text-[#F0B90B] tracking-tight">
            {totalUsers}
          </div>
          <div className="text-[10px] text-[#848E9C] font-mono mt-1">
            {activeUsers} active / {totalUsers - activeUsers} inactive
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl glass-panel bg-[#1E2329] border border-[#2B313A] hover:border-[#387bf0]/40 transition-all">
          <div className="flex items-center justify-between text-[#848E9C] text-[11px] font-mono mb-1.5">
            <span>Settlement Queue</span>
            <CreditCard className="w-3.5 h-3.5 text-[#387bf0]" />
          </div>
          <div className="text-xl sm:text-2xl font-sans font-bold text-[#EAECEF] tracking-tight">
            {pendingTxs}
          </div>
          <div className="text-[10px] text-[#387bf0] font-mono mt-1">
            {pendingTxs === 0 ? 'All settlements up to date' : 'Awaiting manual approval'}
          </div>
        </div>
      </div>

      {/* 2-Column: Inflow/Outflow Liquidity + Live Market Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inflow & Outflow Card */}
        <div className="p-5 sm:p-6 rounded-xl glass-panel bg-[#1E2329] border border-[#2B313A] space-y-5">
          <div className="flex items-center justify-between border-b border-[#2B313A] pb-3.5">
            <h3 className="font-sans text-base font-semibold text-[#EAECEF] flex items-center gap-2 tracking-tight">
              <Zap className="w-4 h-4 text-[#F0B90B]" />
              Platform Inflow / Outflow Ratio
            </h3>
            <span className="text-[9px] font-mono text-[#848E9C] uppercase">Cumulative</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-lg bg-[#2B313A] border border-[#363D47]">
              <div className="flex items-center gap-1.5 text-xs text-[#0ECB81] font-mono mb-1">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Gross Deposits</span>
              </div>
              <div className="text-lg sm:text-xl font-sans font-bold text-[#EAECEF] tracking-tight">
                ${deposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#2B313A] border border-[#363D47]">
              <div className="flex items-center gap-1.5 text-xs text-[#F6465D] font-mono mb-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Gross Withdrawals</span>
              </div>
              <div className="text-lg sm:text-xl font-sans font-bold text-[#EAECEF] tracking-tight">
                ${withdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Ratio bar */}
          <div>
            <div className="flex justify-between text-xs text-[#848E9C] mb-1.5 font-mono">
              <span>Deposit Retention</span>
              <span className="text-[#EAECEF] font-bold">
                {deposits > 0 ? (((deposits - withdrawals) / deposits) * 100).toFixed(1) : 100}% Retained
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#2B313A] overflow-hidden flex">
              <div
                className="h-full bg-[#0ECB81]"
                style={{ width: `${deposits > 0 ? Math.min(100, Math.max(10, ((deposits - withdrawals) / deposits) * 100)) : 100}%` }}
              ></div>
            </div>
          </div>

          {/* System Architecture Specifications */}
          <div className="pt-4 border-t border-[#2B313A] grid grid-cols-2 gap-3 text-xs font-mono text-[#848E9C]">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#F0B90B]" />
              <span>Backend Port: 5000</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#0ECB81]" />
              <span>PostgreSQL Pool: Dual-Active</span>
            </div>
          </div>
        </div>

        {/* Live Binance Market Tickers Feed */}
        <div className="p-6 rounded-xl glass-panel bg-[#1E2329] border border-[#2B313A] space-y-4">
          <div className="flex items-center justify-between border-b border-[#2B313A] pb-4">
            <h3 className="font-sans text-lg font-bold text-[#EAECEF] flex items-center gap-2 tracking-tight">
              <Activity className="w-4 h-4 text-[#F0B90B]" />
              Live Binance Liquidity Feeds
            </h3>
            <span className="text-[10px] font-mono text-[#0ECB81] bg-[#0ECB81]/15 border border-[#0ECB81]/30 px-2 py-0.5 rounded-full font-bold">
              10s Cache TTL
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {tickers.map((t) => (
              <div
                key={t.symbol}
                className="p-3 rounded-lg bg-[#2B313A] border border-[#363D47] flex items-center justify-between hover:border-[#F0B90B]/30 transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-[#EAECEF] font-mono">{t.symbol}</div>
                  <div className="text-[11px] text-[#848E9C] font-mono">
                    ${t.price >= 1 ? t.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : t.price.toFixed(4)}
                  </div>
                </div>

                <div
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    t.change24h >= 0
                      ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                      : 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30'
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

