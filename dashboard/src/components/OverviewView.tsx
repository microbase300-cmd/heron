import React from 'react';
import { 
  TrendingUp, 
  Lock, 
  Wallet, 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { WalletSummary, Investment, User } from '../types';
import { PortfolioYieldChart } from './charts/PortfolioYieldChart';
import { AssetAllocationChart } from './charts/AssetAllocationChart';

interface OverviewViewProps {
  summary: WalletSummary | null;
  investments: Investment[];
  user: User | null;
  onNavigate: (tab: string) => void;
  onOpenDeposit: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  summary,
  investments,
  user,
  onNavigate,
  onOpenDeposit
}) => {
  const activeInvestments = investments.filter(i => i.status === 'active');
  const totalNAV = summary?.totalPortfolioValue ?? (user?.balance ?? 0);
  const btcEquivalent = (totalNAV / 68420).toFixed(4);
  const ethEquivalent = (totalNAV / 3540).toFixed(3);

  return (
    <div className="space-y-8">
      {/* Top Banner: NAV & 24h Delta */}
      <div className="relative overflow-hidden rounded-2xl glass-card-featured p-5 sm:p-8 border border-gold/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-glow/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Net Asset Value • Sovereign Reserve</span>
            </div>
            <div className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight flex flex-wrap items-baseline gap-3 sm:gap-4">
              ${totalNAV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs sm:text-sm font-sans font-semibold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-glow border border-emerald-500/30 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +15.5% Accrued
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-white/50 font-mono">
              <span>≈ {btcEquivalent} BTC</span>
              <span>•</span>
              <span>≈ {ethEquivalent} ETH</span>
              <span>•</span>
              <span className="text-emerald-glow flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Cold Custody
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDeposit}
              className="px-5 py-3 rounded-xl bg-gold hover:bg-gold-light text-[#0b0d0d] text-xs font-bold tracking-wide transition-all shadow-xl shadow-gold/20 flex items-center gap-2"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Deposit Capital
            </button>
            <button
              onClick={() => onNavigate('invest')}
              className="px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] hover:border-gold/30 text-white text-xs font-bold tracking-wide transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-gold" />
              New Investment ↗
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-white/50 text-xs font-mono mb-2">
            <span>Available Balance</span>
            <Wallet className="w-4 h-4 text-gold" />
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            ${(summary?.availableBalance ?? user?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-white/40 mt-1">Instant withdrawal readiness</div>
        </div>

        <div className="p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-white/50 text-xs font-mono mb-2">
            <span>In Smart Escrow</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            ${(summary?.lockedInInvestments ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">
            {activeInvestments.length} active investment{activeInvestments.length === 1 ? '' : 's'} compounding
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-white/50 text-xs font-mono mb-2">
            <span>Yield Disbursed</span>
            <TrendingUp className="w-4 h-4 text-emerald-glow" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-glow">
            +${(summary?.totalProfitAccrued ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-white/40 mt-1">Net programmatic profit payout</div>
        </div>

        <div className="p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-white/50 text-xs font-mono mb-2">
            <span>Affiliate Revenue</span>
            <Users className="w-4 h-4 text-gold-light" />
          </div>
          <div className="text-2xl font-serif font-bold text-gold">
            ${(summary?.totalReferralEarnings ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-white/40 mt-1">Up to 30% instant network tier</div>
        </div>
      </div>

      {/* Row 1: Interactive Recharts Visualizations (Yield Curve + Asset Allocation) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioYieldChart
            totalNAV={totalNAV}
            profitAccrued={summary?.totalProfitAccrued ?? 0}
          />
        </div>
        <div className="lg:col-span-1">
          <AssetAllocationChart
            available={summary?.availableBalance ?? user?.balance ?? 0}
            escrow={summary?.lockedInInvestments ?? 0}
            yieldProfit={summary?.totalProfitAccrued ?? 0}
            referral={summary?.totalReferralEarnings ?? 0}
          />
        </div>
      </div>

      {/* Row 2: Programmatic Return Horizons & Active Compounding Investments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Institutional Compounding Architecture */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div style={{ isolation: 'isolate', transform: 'translateZ(0)' }}>
              <h3 className="font-serif text-lg font-bold text-white" style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'geometricPrecision' }}>Programmatic Return Horizons</h3>
              <p className="text-xs text-white/50">Mathematical yield multipliers across the 4 smart contract cycles</p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/30">
              Deterministic APY
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[10px] font-mono text-white/40 uppercase">Amateur</div>
              <div className="text-2xl font-serif text-white font-bold my-1">4.5%</div>
              <div className="text-[11px] text-gold font-mono">24 Hours</div>
              <div className="text-[10px] text-white/40 mt-2">$100 – $1,999</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[10px] font-mono text-white/40 uppercase">Standard</div>
              <div className="text-2xl font-serif text-white font-bold my-1">9.5%</div>
              <div className="text-[11px] text-gold font-mono">48 Hours</div>
              <div className="text-[10px] text-white/40 mt-2">$2,000 – $5,999</div>
            </div>

            <div className="p-4 rounded-xl bg-gold/5 border border-gold/30">
              <div className="text-[10px] font-mono text-gold uppercase font-bold">Premium VIP</div>
              <div className="text-2xl font-serif text-gold font-bold my-1">15.5%</div>
              <div className="text-[11px] text-gold font-mono">72 Hours</div>
              <div className="text-[10px] text-white/50 mt-2">$6,000 – $10,999</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[10px] font-mono text-white/40 uppercase">Retirement</div>
              <div className="text-2xl font-serif text-emerald-glow font-bold my-1">22.5%</div>
              <div className="text-[11px] text-emerald-glow font-mono">96 Hours</div>
              <div className="text-[10px] text-white/40 mt-2">$11,000 – Unlimited</div>
            </div>
          </div>

          {/* Graphical Growth Progression Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-xs text-white/50 mb-2 font-mono">
              <span>Maturity Timeline</span>
              <span>Yield Velocity Index</span>
            </div>
            <div className="h-3 rounded-full bg-white/[0.05] p-0.5 overflow-hidden flex gap-1">
              <div className="h-full bg-white/20 rounded-full w-1/4" title="Amateur 24h"></div>
              <div className="h-full bg-white/40 rounded-full w-1/4" title="Standard 48h"></div>
              <div className="h-full bg-gold rounded-full w-1/4 shadow-sm shadow-gold/50" title="Premium 72h"></div>
              <div className="h-full bg-emerald-glow rounded-full w-1/4 shadow-sm shadow-emerald-glow/50" title="Retirement 96h"></div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Investments Quick Tracker */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold" />
                Live Compounding
              </h3>
              <button 
                onClick={() => onNavigate('mandates')}
                className="text-xs text-gold hover:underline flex items-center gap-1 font-mono"
              >
                View All ({activeInvestments.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeInvestments.length > 0 ? (
              <div className="space-y-4">
                {activeInvestments.slice(0, 2).map(inv => (
                  <div key={inv.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-gold/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif text-white font-bold">{inv.planName}</span>
                      <span className="text-[10px] font-mono font-bold text-gold px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20">
                        {inv.durationHours}h • {(inv.rate * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex justify-between text-xs my-2">
                      <span className="text-white/50">Committed:</span>
                      <span className="text-white font-mono font-semibold">${inv.amount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-xs my-2">
                      <span className="text-white/50">Est. Payout:</span>
                      <span className="text-emerald-glow font-mono font-bold">${inv.totalPayout.toLocaleString()}</span>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] font-mono text-white/50 mb-1">
                        <span>Escrow Progress</span>
                        <span>{inv.progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-gold to-emerald-glow transition-all duration-1000 rounded-full"
                          style={{ width: `${Math.max(5, inv.progressPercent)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto text-white/40">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-sm font-serif text-white/80">No Active Investments</div>
                <p className="text-xs text-white/40 max-w-xs mx-auto">
                  Deploy liquidity into 24h, 48h, 72h, or 96h cycles to begin earning programmatic yields.
                </p>
                <button
                  onClick={() => onNavigate('invest')}
                  className="mt-2 px-4 py-2 rounded-lg bg-gold/15 hover:bg-gold/25 border border-gold/30 text-gold text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                >
                  Explore Plans ↗
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/[0.08] mt-4 flex items-center justify-between text-xs text-white/40 font-mono">
            <span>Automated Payout Pipeline</span>
            <span className="text-emerald-glow flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
