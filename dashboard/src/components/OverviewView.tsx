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
      <div className="relative overflow-hidden rounded-2xl bg-[#1E2329] p-5 sm:p-8 border border-[#2B313A] shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F0B90B]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-[#0ECB81]/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-[#F0B90B] uppercase tracking-widest mb-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#F0B90B]" />
              <span>Net Asset Value • Sovereign Reserve</span>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-[#EAECEF] tracking-tight flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
              ${totalNAV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +15.5% Accrued
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-[#848E9C] font-mono">
              <span>≈ {btcEquivalent} BTC</span>
              <span>•</span>
              <span>≈ {ethEquivalent} ETH</span>
              <span>•</span>
              <span className="text-[#0ECB81] flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Cold Custody
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenDeposit}
              className="px-4 py-2.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-bold tracking-wide transition-all shadow-md shadow-[#F0B90B]/15 flex items-center gap-1.5 active:scale-95"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Deposit Capital
            </button>
            <button
              onClick={() => onNavigate('invest')}
              className="px-4 py-2.5 rounded-lg bg-[#2B313A] hover:bg-[#363D47] border border-[#363D47] hover:border-[#F0B90B]/40 text-[#EAECEF] text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 active:scale-95"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#F0B90B]" />
              New Investment ↗
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-[#1E2329] border border-[#2B313A] hover:border-[#F0B90B]/30 transition-all">
          <div className="flex items-center justify-between text-[#848E9C] text-[11px] font-mono mb-1.5">
            <span>Available Balance</span>
            <Wallet className="w-3.5 h-3.5 text-[#F0B90B]" />
          </div>
          <div className="text-xl sm:text-2xl font-sans font-bold text-[#EAECEF] tracking-tight">
            ${(summary?.availableBalance ?? user?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#848E9C] mt-1">Instant withdrawal readiness</div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[#1E2329] border border-[#2B313A] hover:border-[#F0B90B]/30 transition-all">
          <div className="flex items-center justify-between text-[#848E9C] text-[11px] font-mono mb-1.5">
            <span>In Smart Escrow</span>
            <Lock className="w-3.5 h-3.5 text-[#F0B90B]" />
          </div>
          <div className="text-xl sm:text-2xl font-sans font-bold text-[#EAECEF] tracking-tight">
            ${(summary?.lockedInInvestments ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#F0B90B] mt-1 font-medium">
            {activeInvestments.length} active investment{activeInvestments.length === 1 ? '' : 's'} compounding
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[#1E2329] border border-[#2B313A] hover:border-[#0ECB81]/30 transition-all">
          <div className="flex items-center justify-between text-[#848E9C] text-[11px] font-mono mb-1.5">
            <span>Yield Disbursed</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#0ECB81]" />
          </div>
          <div className="text-xl sm:text-2xl font-sans font-bold text-[#0ECB81] tracking-tight">
            +${(summary?.totalProfitAccrued ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#848E9C] mt-1">Net programmatic profit payout</div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[#1E2329] border border-[#2B313A] hover:border-[#F0B90B]/30 transition-all">
          <div className="flex items-center justify-between text-[#848E9C] text-[11px] font-mono mb-1.5">
            <span>Affiliate Revenue</span>
            <Users className="w-3.5 h-3.5 text-[#F0B90B]" />
          </div>
          <div className="text-xl sm:text-2xl font-sans font-bold text-[#F0B90B] tracking-tight">
            ${(summary?.totalReferralEarnings ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#848E9C] mt-1">Up to 30% instant network tier</div>
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
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#1E2329] border border-[#2B313A] space-y-6">
          <div className="flex items-center justify-between border-b border-[#2B313A] pb-4">
            <div>
              <h3 className="font-sans text-base font-semibold text-[#EAECEF] tracking-tight">Programmatic Return Horizons</h3>
              <p className="text-[11px] text-[#848E9C] font-sans mt-0.5">Deterministic yield multipliers across the 4 smart contract cycles</p>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F0B90B]/10 text-[#F0B90B] border border-[#F0B90B]/30 font-bold">
              Deterministic APY
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
              <div className="text-[10px] font-mono text-[#848E9C] uppercase font-semibold">Amateur</div>
              <div className="text-xl font-sans text-[#EAECEF] font-bold my-0.5 tracking-tight">4.5%</div>
              <div className="text-[11px] text-[#F0B90B] font-mono font-medium">24 Hours</div>
              <div className="text-[10px] text-[#848E9C] mt-1.5">$100 – $1,999</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
              <div className="text-[10px] font-mono text-[#848E9C] uppercase font-semibold">Standard</div>
              <div className="text-xl font-sans text-[#EAECEF] font-bold my-0.5 tracking-tight">9.5%</div>
              <div className="text-[11px] text-[#F0B90B] font-mono font-medium">48 Hours</div>
              <div className="text-[10px] text-[#848E9C] mt-1.5">$2,000 – $5,999</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/40 shadow-sm shadow-[#F0B90B]/5">
              <div className="text-[10px] font-mono text-[#F0B90B] uppercase font-black">Premium VIP</div>
              <div className="text-xl font-sans text-[#F0B90B] font-extrabold my-0.5 tracking-tight">15.5%</div>
              <div className="text-[11px] text-[#F0B90B] font-mono font-bold">72 Hours</div>
              <div className="text-[10px] text-[#EAECEF]/70 mt-1.5 font-medium">$6,000 – $10,999</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
              <div className="text-[10px] font-mono text-[#848E9C] uppercase font-semibold">Retirement</div>
              <div className="text-xl font-sans text-[#0ECB81] font-bold my-0.5 tracking-tight">22.5%</div>
              <div className="text-[11px] text-[#0ECB81] font-mono font-medium">96 Hours</div>
              <div className="text-[10px] text-[#848E9C] mt-1.5">$11,000 – Unlimited</div>
            </div>
          </div>

          {/* Graphical Growth Progression Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-xs text-[#848E9C] mb-2 font-mono">
              <span>Maturity Timeline</span>
              <span>Yield Velocity Index</span>
            </div>
            <div className="h-2.5 rounded-full bg-[#181A20] p-0.5 overflow-hidden flex gap-1 border border-[#2B313A]">
              <div className="h-full bg-[#848E9C]/30 rounded-full w-1/4" title="Amateur 24h"></div>
              <div className="h-full bg-[#848E9C]/60 rounded-full w-1/4" title="Standard 48h"></div>
              <div className="h-full bg-[#F0B90B] rounded-full w-1/4 shadow-sm shadow-[#F0B90B]/50" title="Premium 72h"></div>
              <div className="h-full bg-[#0ECB81] rounded-full w-1/4 shadow-sm shadow-[#0ECB81]/50" title="Retirement 96h"></div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Investments Quick Tracker */}
        <div className="p-6 rounded-2xl bg-[#1E2329] border border-[#2B313A] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-4 mb-4">
              <h3 className="font-sans text-lg font-bold text-[#EAECEF] flex items-center gap-2 tracking-tight">
                <Clock className="w-4 h-4 text-[#F0B90B]" />
                Live Compounding
              </h3>
              <button 
                onClick={() => onNavigate('mandates')}
                className="text-xs text-[#F0B90B] hover:underline flex items-center gap-1 font-mono font-semibold"
              >
                View All ({activeInvestments.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeInvestments.length > 0 ? (
              <div className="space-y-4">
                {activeInvestments.slice(0, 2).map(inv => (
                  <div key={inv.id} className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A] hover:border-[#F0B90B]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-sans text-[#EAECEF] font-bold">{inv.planName}</span>
                      <span className="text-[10px] font-mono font-bold text-[#F0B90B] px-2 py-0.5 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/20">
                        {inv.durationHours}h • {(inv.rate * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex justify-between text-xs my-2">
                      <span className="text-[#848E9C]">Committed:</span>
                      <span className="text-[#EAECEF] font-mono font-semibold">${inv.amount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-xs my-2">
                      <span className="text-[#848E9C]">Est. Payout:</span>
                      <span className="text-[#0ECB81] font-mono font-bold">${inv.totalPayout.toLocaleString()}</span>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] font-mono text-[#848E9C] mb-1">
                        <span>Escrow Progress</span>
                        <span className="text-[#EAECEF] font-bold">{inv.progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#2B313A] overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#F0B90B] to-[#0ECB81] transition-all duration-1000 rounded-full"
                          style={{ width: `${Math.max(5, inv.progressPercent)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#181A20] border border-[#2B313A] flex items-center justify-center mx-auto text-[#848E9C]">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-sm font-sans font-semibold text-[#EAECEF]">No Active Investments</div>
                <p className="text-xs text-[#848E9C] max-w-xs mx-auto font-sans">
                  Deploy liquidity into 24h, 48h, 72h, or 96h cycles to begin earning programmatic yields.
                </p>
                <button
                  onClick={() => onNavigate('invest')}
                  className="mt-2 px-4 py-2 rounded-lg bg-[#F0B90B]/15 hover:bg-[#F0B90B]/25 border border-[#F0B90B]/30 text-[#F0B90B] text-xs font-bold transition-all inline-flex items-center gap-1.5"
                >
                  Explore Plans ↗
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#2B313A] mt-4 flex items-center justify-between text-xs text-[#848E9C] font-mono">
            <span>Automated Payout Pipeline</span>
            <span className="text-[#0ECB81] flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
