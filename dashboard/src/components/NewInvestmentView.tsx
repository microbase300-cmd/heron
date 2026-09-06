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

  // Auto-switch plan when amount changes or adjust amount when plan clicked
  const handleSelectPlan = (p: PlanConfig) => {
    setSelectedPlanId(p.id);
    if (amount < p.min || (p.max !== Infinity && amount > p.max)) {
      setAmount(p.min);
    }
  };

  const handleAmountChange = (val: number) => {
    setAmount(val);
    // Find matching tier automatically
    for (const p of effectivePlans) {
      if (val >= p.min && (p.max === Infinity || val <= p.max)) {
        setSelectedPlanId(p.id);
        break;
      }
    }
  };

  const planRate = selectedPlan?.rate || 0.095;
  const planReferralRate = selectedPlan?.referralRate || 0.16;
  const planName = selectedPlan?.name || 'Selected Plan';
  const planDuration = selectedPlan?.durationHours || 48;

  const expectedProfit = Number((amount * planRate).toFixed(2));
  const totalPayout = Number((amount + expectedProfit).toFixed(2));
  const referralBonus = Number((amount * planReferralRate).toFixed(2));

  const availableBalance = user?.balance ?? 0;
  const isInsufficient = amount > availableBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (amount < selectedPlan.min) {
      setError(`Minimum deposit for ${selectedPlan.name} is $${selectedPlan.min.toLocaleString()}`);
      return;
    }
    if (selectedPlan.max !== Infinity && amount > selectedPlan.max) {
      setError(`Maximum deposit for ${selectedPlan.name} is $${selectedPlan.max.toLocaleString()}`);
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
      const res = await api.createInvestment(selectedPlan.id, amount);
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
        <h2 className="text-xl font-serif font-bold text-white tracking-tight">Deploy Institutional Capital</h2>
        <p className="text-xs text-white/50 font-mono mt-0.5">Select an investment horizon. Yields accrue automatically via cryptographic smart escrow.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
          <Check className="w-4 h-4 shrink-0 text-emerald-glow" />
          <span>{successMsg} Redirecting to active mandates...</span>
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
              className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                isSelected 
                  ? 'bg-gradient-to-b from-[#18221c] to-[#0c110e] border-2 border-gold shadow-xl shadow-gold/10' 
                  : isFeatured 
                    ? 'glass-card border-gold/40' 
                    : 'glass-card hover:border-white/20'
              }`}
            >
              {isFeatured && (
                <span className="absolute top-0 right-0 bg-gold text-[#0b0d0d] text-[9px] font-mono font-bold uppercase px-3 py-1 rounded-bl-xl tracking-widest">
                  VIP High-Yield
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                    Horizon Tier
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-gold text-[#0b0d0d]' : 'bg-white/[0.06] text-gold border border-gold/20'
                  }`}>
                    {p.durationHours} Hours
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-white mb-1">{p.name}</h3>
                <p className="text-[11px] text-white/50 min-h-[32px]">{p.description}</p>

                <div className="my-4 pb-4 border-b border-white/[0.08]">
                  <div className="text-4xl font-serif font-bold text-gold">
                    {(p.rate * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-white/40 font-mono uppercase mt-0.5">
                    Guaranteed net yield after {p.durationHours}h
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-white/60">
                    <span>Min:</span>
                    <span className="text-white font-semibold">${p.min.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Max:</span>
                    <span className="text-white font-semibold">
                      {p.max === Infinity ? 'Unlimited' : `$${p.max.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gold">
                    <span>Referral:</span>
                    <span className="font-semibold">{(p.referralRate * 100).toFixed(0)}% Instant</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-medium text-white/70">
                  {isSelected ? 'Selected' : 'Select Plan'}
                </span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  isSelected ? 'bg-gold border-gold text-[#0b0d0d]' : 'border-white/20'
                }`}>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calculator & Investment Execution Box */}
      <form onSubmit={handleSubmit} className="p-8 rounded-2xl glass-card border-gold/30">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Input & Slider */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-2">
                <span>Enter Investment Capital (USD)</span>
                <span className="flex items-center gap-1.5 text-white/70">
                  <Wallet className="w-3.5 h-3.5 text-gold" />
                  Available: ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center rounded-xl bg-black/50 border border-white/[0.15] px-4 py-3 focus-within:border-gold transition-colors">
                <span className="text-2xl font-serif text-gold font-bold mr-3">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                  min={100}
                  step={50}
                  className="w-full bg-transparent text-3xl font-serif font-bold text-white outline-none"
                />
              </div>

              <input
                type="range"
                min={100}
                max={50000}
                step={50}
                value={Math.min(amount, 50000)}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
                className="w-full mt-4 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-white/40 mt-1">
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
                      ? 'bg-gold text-[#0b0d0d] font-bold' 
                      : 'bg-white/[0.04] text-white/60 hover:text-white border border-white/[0.08]'
                  }`}
                >
                  ${val.toLocaleString()}
                </button>
              ))}
            </div>

            {isInsufficient && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                <span>Available liquidity is lower than target allocation.</span>
                <button
                  type="button"
                  onClick={onOpenDeposit}
                  className="px-2.5 py-1 rounded bg-gold text-[#0b0d0d] font-bold text-[11px] uppercase tracking-wide hover:bg-gold-light"
                >
                  Deposit Now
                </button>
              </div>
            )}
          </div>

          {/* Right: Real-time Return Projection */}
          <div className="p-6 rounded-xl bg-black/40 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="text-xs font-mono uppercase text-white/50">Projected Return Schedule</span>
              <span className="text-xs font-mono font-bold text-gold px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30">
                {planName} • {planDuration}h
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-white/40 font-mono uppercase">Capital Allocated</div>
                <div className="text-xl font-serif font-bold text-white mt-0.5">
                  ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-white/40 font-mono uppercase">Guaranteed Yield</div>
                <div className="text-xl font-serif font-bold text-emerald-glow mt-0.5">
                  +${expectedProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-white/40 font-mono uppercase">Total Maturity Disbursement</div>
                <div className="text-2xl font-serif font-bold text-gold mt-0.5">
                  ${totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-white/40 font-mono uppercase">Referral Payout Capacity</div>
                <div className="text-base font-serif font-bold text-white/70 mt-0.5">
                  ${referralBonus.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({(planReferralRate * 100).toFixed(0)}%)
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isInsufficient}
              className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isInsufficient 
                  ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-gold to-gold-light hover:brightness-105 text-[#0b0d0d] shadow-xl shadow-gold/20'
              }`}
            >
              {loading ? (
                <span>Locking Escrow Contract...</span>
              ) : isInsufficient ? (
                <span>Insufficient Liquidity — Deposit to Continue</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Deploy ${amount.toLocaleString()} into {planName} ↗</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
