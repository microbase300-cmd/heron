import React, { useState } from 'react';
import { Users, Copy, Check, Sparkles, TrendingUp, ShieldCheck, Share2 } from 'lucide-react';
import { ReferralData } from '../types';

interface ReferralsViewProps {
  data: ReferralData | null;
}

export const ReferralsView: React.FC<ReferralsViewProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const referralLink = data?.referralLink || 'http://localhost:5173/register?ref=HERON-8821';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-bold text-white tracking-tight">Institutional Affiliate Network</h2>
        <p className="text-xs text-white/50 font-mono mt-0.5">Earn up to 30% instant commission on referred capital allocations across all 4 tiers.</p>
      </div>

      {/* Referral Link Hero Box */}
      <div className="p-8 rounded-2xl glass-card-featured border-gold/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono text-gold uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Your Client Invitation Link
            </span>
            <div className="text-2xl font-serif font-bold text-white">
              Share institutional investments. Receive instant wallet payouts.
            </div>
            <p className="text-xs text-white/50 max-w-xl">
              Commissions are automatically credited to your available balance the exact moment a referred investor confirms their investment.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row items-center gap-2">
            <div className="w-full sm:w-80 px-4 py-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-white truncate">
              {referralLink}
            </div>
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gold hover:bg-gold-light text-[#0b0d0d] font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-gold/20"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-card">
          <div className="text-[11px] font-mono text-white/50 uppercase">Total Affiliate Earnings</div>
          <div className="text-3xl font-serif font-bold text-gold my-1">
            ${(data?.totalCommissionEarned ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-white/40">Zero withdrawal threshold</div>
        </div>

        <div className="p-5 rounded-2xl glass-card">
          <div className="text-[11px] font-mono text-white/50 uppercase">Referred Clients</div>
          <div className="text-3xl font-serif font-bold text-white my-1">
            {data?.totalReferrals ?? 0}
          </div>
          <div className="text-[10px] text-white/40">Active downline members</div>
        </div>

        <div className="p-5 rounded-2xl glass-card">
          <div className="text-[11px] font-mono text-white/50 uppercase">Maximum Tier Rate</div>
          <div className="text-3xl font-serif font-bold text-emerald-glow my-1">
            30.0%
          </div>
          <div className="text-[10px] text-white/40">On Retirement Plan allocations</div>
        </div>
      </div>

      {/* 4 Tier Rate Cards */}
      <div className="space-y-3">
        <h3 className="text-base font-serif font-bold text-white">Commission Architecture by Tier</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <div className="text-xs font-mono text-white/40 uppercase">Tier 01: Amateur Plan</div>
            <div className="text-3xl font-serif font-bold text-white my-1">8%</div>
            <div className="text-[11px] text-gold font-mono">$100 – $1,999</div>
            <p className="text-[10px] text-white/40 mt-2">Instant credit on 24h entry allocations</p>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <div className="text-xs font-mono text-white/40 uppercase">Tier 02: Standard Plan</div>
            <div className="text-3xl font-serif font-bold text-white my-1">16%</div>
            <div className="text-[11px] text-gold font-mono">$2,000 – $5,999</div>
            <p className="text-[10px] text-white/40 mt-2">Instant credit on 48h capital cycles</p>
          </div>

          <div className="p-5 rounded-xl bg-gold/5 border border-gold/30">
            <div className="text-xs font-mono text-gold uppercase font-bold">Tier 03: Premium Plan</div>
            <div className="text-3xl font-serif font-bold text-gold my-1">24%</div>
            <div className="text-[11px] text-gold font-mono">$6,000 – $10,999</div>
            <p className="text-[10px] text-white/50 mt-2">VIP partner payout on 72h cycles</p>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <div className="text-xs font-mono text-white/40 uppercase">Tier 04: Retirement Plan</div>
            <div className="text-3xl font-serif font-bold text-emerald-glow my-1">30%</div>
            <div className="text-[11px] text-emerald-glow font-mono">$11,000 – Unlimited</div>
            <p className="text-[10px] text-white/40 mt-2">Maximum payout on sovereign reserve capital</p>
          </div>
        </div>
      </div>

      {/* Downline & Commissions Log */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <h3 className="font-serif text-lg font-bold text-white">Recent Referral Payouts</h3>
        {data && data.commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-white/40 uppercase border-b border-white/[0.08]">
                <tr>
                  <th className="pb-3 font-medium">Referred Client</th>
                  <th className="pb-3 font-medium">Investment Tier</th>
                  <th className="pb-3 font-medium">Allocation</th>
                  <th className="pb-3 font-medium">Rate</th>
                  <th className="pb-3 font-medium text-right">Commission Disbursed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {data.commissions.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 text-white font-medium">{c.referredUserEmail}</td>
                    <td className="py-3 text-gold uppercase">{c.planId}</td>
                    <td className="py-3 text-white">${c.depositAmount.toLocaleString()}</td>
                    <td className="py-3 text-white/60">{(c.rate * 100).toFixed(0)}%</td>
                    <td className="py-3 text-emerald-glow font-bold text-right">+${c.commissionAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-white/40 text-xs font-mono">
            No referral commissions registered yet. Share your invite link to begin earning.
          </div>
        )}
      </div>
    </div>
  );
};
