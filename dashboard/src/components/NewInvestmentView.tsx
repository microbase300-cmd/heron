import React, { useState } from 'react';
import { ShieldCheck, Check, Sparkles, AlertCircle, ArrowRight, Wallet, Lock } from 'lucide-react';
import { PlanConfig, PlanId, User, DEFAULT_PLANS } from '../types';
import { api } from '../services/api';

interface NewInvestmentViewProps {
  plans: PlanConfig[];
  user: User | null;
  onSuccess: () => void;
  onOpenDeposit: () => void;
}

const isUncapped = (max: number | null | undefined): boolean => {
  return max === null || max === undefined || max === Infinity || !isFinite(Number(max)) || Number(max) >= 99999999;
};

const formatPlanMax = (max: number | null | undefined): string => {
  if (isUncapped(max)) return 'Unlimited';
  const num = Number(max);
  return isNaN(num) ? 'Unlimited' : `$${num.toLocaleString()}`;
};

const formatPlanMin = (min: number | null | undefined): string => {
  const num = Number(min);
  return isNaN(num) ? '$100' : `$${num.toLocaleString()}`;
};

export const NewInvestmentView: React.FC<NewInvestmentViewProps> = ({
  plans,
  user,
  onSuccess,
  onOpenDeposit
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>('standard');
  const [amount, setAmount] = useState<number>(3500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Guarantee non-empty plan array fallback
  const effectivePlans = plans && plans.length > 0 ? plans : DEFAULT_PLANS;
  const selectedPlan = effectivePlans.find(p => p.id === selectedPlanId) || effectivePlans[0] || DEFAULT_PLANS[0];

  const planRate = typeof selectedPlan?.rate === 'number' ? selectedPlan.rate : 0.095;
  const planReferralRate = typeof selectedPlan?.referralRate === 'number' ? selectedPlan.referralRate : 0.16;
  const planName = selectedPlan?.name || 'Selected Plan';
  const planDuration = typeof selectedPlan?.durationHours === 'number' ? selectedPlan.durationHours : 48;
  const planMin = typeof selectedPlan?.min === 'number' ? selectedPlan.min : 100;
  const planMax = selectedPlan?.max;

  // Auto-switch plan when amount changes or adjust amount when plan clicked
  const handleSelectPlan = (p: PlanConfig) => {
    setSelectedPlanId(p.id);
    const pMin = typeof p.min === 'number' ? p.min : 100;
    if (amount < pMin || (!isUncapped(p.max) && typeof p.max === 'number' && amount > p.max)) {
      setAmount(pMin);
    }
  };

  const handleAmountChange = (val: number) => {
    const safeVal = isNaN(val) ? 0 : val;
    setAmount(safeVal);
    // Find matching tier automatically
    for (const p of effectivePlans) {
      const pMin = typeof p.min === 'number' ? p.min : 100;
      if (safeVal >= pMin && (isUncapped(p.max) || safeVal <= (p.max as number))) {
        setSelectedPlanId(p.id);
        break;
      }
    }
  };

  const safeAmount = (isNaN(amount) || amount === null || amount === undefined) ? 0 : amount;
  const expectedProfit = Number((safeAmount * planRate).toFixed(2));
  const totalPayout = Number((safeAmount + expectedProfit).toFixed(2));
  const referralBonus = Number((safeAmount * planReferralRate).toFixed(2));

  const availableBalance = typeof user?.balance === 'number' && !isNaN(user.balance) ? user.balance : 0;
  const isInsufficient = safeAmount > availableBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (safeAmount < planMin) {
      setError(`Minimum deposit for ${planName} is $${planMin.toLocaleString()}`);
      return;
    }
    if (!isUncapped(planMax) && typeof planMax === 'number' && safeAmount > planMax) {
      setError(`Maximum deposit for ${planName} is $${planMax.toLocaleString()}`);
      return;
    }
    if (isInsufficient) {
      setError(`Insufficient available balance. You have $${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.createInvestment(selectedPlan.id, safeAmount);
      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Investment failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-sans font-bold text-[#EAECEF] tracking-tight">Deploy Institutional Capital</h2>
        <p className="text-xs text-[#848E9C] font-mono mt-0.5">Select an investment horizon. Yields accrue automatically via cryptographic smart escrow.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#F6465D]/10 border border-[#F6465D]/30 text-[#F6465D] text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#F6465D]" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-[#0ECB81]/10 border border-[#0ECB81]/30 text-[#0ECB81] text-xs flex items-center gap-3">
          <Check className="w-4 h-4 shrink-0 text-[#0ECB81]" />
          <span>{successMsg} Redirecting to active investments...</span>
        </div>
      )}

      {/* 4 Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {effectivePlans.map(p => {
          const isSelected = selectedPlanId === p.id;
          const isFeatured = p.id === 'premium';

          return (
            <div
              key={p.id}
              onClick={() => handleSelectPlan(p)}
              className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 relative flex flex-col justify-between border ${
                isSelected 
                  ? 'bg-[#242A32] border-2 border-[#F0B90B] shadow-xl shadow-[#F0B90B]/10' 
                  : isFeatured 
                    ? 'bg-[#1E2329] border-[#F0B90B]/40 hover:border-[#F0B90B]/70' 
                    : 'bg-[#1E2329] border-[#2B313A] hover:border-[#F0B90B]/40'
              }`}
            >
              {isFeatured && (
                <span className="absolute top-0 right-0 bg-[#F0B90B] text-[#181A20] text-[9px] font-mono font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest shadow-sm">
                  VIP High-Yield
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#848E9C]">
                    Horizon Tier
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-[#F0B90B] text-[#181A20]' : 'bg-[#2B313A] text-[#F0B90B] border border-[#F0B90B]/20'
                  }`}>
                    {p.durationHours} Hours
                  </span>
                </div>

                <h3 className="font-sans text-lg font-bold text-[#EAECEF] mb-0.5 tracking-tight">{p.name}</h3>
                <p className="text-[11px] text-[#848E9C] min-h-[32px]">{p.description}</p>

                <div className="my-3.5 pb-3.5 border-b border-[#2B313A]">
                  <div className="text-2xl sm:text-3xl font-sans font-bold text-[#F0B90B] tracking-tight">
                    {(p.rate * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-[#848E9C] font-mono uppercase mt-0.5">
                    Guaranteed net yield after {p.durationHours}h
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-[#848E9C]">
                    <span>Min:</span>
                    <span className="text-[#EAECEF] font-semibold">{formatPlanMin(p.min)}</span>
                  </div>
                  <div className="flex justify-between text-[#848E9C]">
                    <span>Max:</span>
                    <span className="text-[#EAECEF] font-semibold">{formatPlanMax(p.max)}</span>
                  </div>
                  <div className="flex justify-between text-[#F0B90B]">
                    <span>Referral:</span>
                    <span className="font-semibold">{((typeof p.referralRate === 'number' ? p.referralRate : 0.1) * 100).toFixed(0)}% Instant</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-[#2B313A] flex items-center justify-between">
                <span className="text-xs font-medium text-[#848E9C]">
                  {isSelected ? 'Selected' : 'Select Plan'}
                </span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  isSelected ? 'bg-[#F0B90B] border-[#F0B90B] text-[#181A20]' : 'border-[#363D47]'
                }`}>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calculator & Investment Execution Box */}
      <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-[#1E2329] border border-[#2B313A] shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Input & Slider */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#848E9C] mb-2">
                <span>Enter Investment Capital (USD)</span>
                <span className="flex items-center gap-1.5 text-[#EAECEF]">
                  <Wallet className="w-3.5 h-3.5 text-[#F0B90B]" />
                  Available: ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center rounded-xl bg-[#181A20] border border-[#2B313A] px-4 py-3 focus-within:border-[#F0B90B] transition-colors">
                <span className="text-2xl font-sans text-[#F0B90B] font-bold mr-3">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                  min={100}
                  step={50}
                  className="w-full bg-transparent text-3xl font-sans font-bold text-[#EAECEF] outline-none"
                />
              </div>

              <input
                type="range"
                min={100}
                max={50000}
                step={50}
                value={Math.min(amount, 50000)}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
                className="w-full mt-4 h-1.5 bg-[#2B313A] rounded-lg appearance-none cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-[#848E9C] mt-1">
                <span>$100 (Amateur)</span>
                <span>$2,000 (Standard)</span>
                <span>$6,000 (Premium)</span>
                <span>$11,000+ (Retirement)</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {[500, 2500, 7500, 15000, 30000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAmountChange(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    amount === val 
                      ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm' 
                      : 'bg-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] border border-[#363D47]'
                  }`}
                >
                  ${val.toLocaleString()}
                </button>
              ))}
            </div>

            {isInsufficient && (
              <div className="p-3 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] text-xs flex items-center justify-between">
                <span>Available liquidity is lower than target allocation.</span>
                <button
                  type="button"
                  onClick={onOpenDeposit}
                  className="px-2.5 py-1 rounded bg-[#F0B90B] text-[#181A20] font-bold text-[11px] uppercase tracking-wide hover:bg-[#FCD535] active:scale-95"
                >
                  Deposit Now
                </button>
              </div>
            )}

            {/* Plan Quick Selector Bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#848E9C]">Auto-Detected Plan:</span>
              <span className="text-xs font-mono font-bold text-[#F0B90B] px-2.5 py-1 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30">
                {planName} ({(planRate * 100).toFixed(1)}% yield • {planDuration}h)
              </span>
            </div>
          </div>

          {/* Right: Real-time Return Projection */}
          <div className="p-6 rounded-xl bg-[#181A20] border border-[#2B313A] space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-3">
              <span className="text-xs font-mono uppercase text-[#848E9C]">Projected Return Schedule</span>
              <span className="text-xs font-mono font-bold text-[#F0B90B] px-2.5 py-0.5 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30">
                {planName} • {planDuration}h
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-[#848E9C] font-mono uppercase">Capital Allocated</div>
                <div className="text-xl font-sans font-bold text-[#EAECEF] mt-0.5">
                  ${safeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#848E9C] font-mono uppercase">Guaranteed Yield</div>
                <div className="text-xl font-sans font-bold text-[#0ECB81] mt-0.5">
                  +${expectedProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#848E9C] font-mono uppercase">Total Maturity Disbursement</div>
                <div className="text-2xl font-sans font-bold text-[#F0B90B] mt-0.5">
                  ${totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#848E9C] font-mono uppercase">Referral Payout Capacity</div>
                <div className="text-base font-sans font-bold text-[#848E9C] mt-0.5">
                  ${referralBonus.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({(planReferralRate * 100).toFixed(0)}%)
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isInsufficient}
              className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isInsufficient 
                  ? 'bg-[#2B313A] text-[#5E6673] cursor-not-allowed' 
                  : 'bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] shadow-xl shadow-[#F0B90B]/15 active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <span>Locking Escrow Contract...</span>
              ) : isInsufficient ? (
                <span>Insufficient Liquidity — Deposit to Continue</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Deploy ${safeAmount.toLocaleString()} into {planName} ↗</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
