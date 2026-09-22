import React, { useState } from 'react';
import { Users, Copy, Check, Sparkles, TrendingUp, ShieldCheck, Share2 } from 'lucide-react';
import { ReferralData } from '../types';

interface ReferralsViewProps {
  data: ReferralData | null;
}

export const ReferralsView: React.FC<ReferralsViewProps> = ({ data }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Dynamic origin fallback so the link matches the exact host the user is currently on
  const rawCode = data?.referralCode || 'HERON-8821';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://app.heronassetstrusteess.com';
  const referralLink = data?.referralLink && !data.referralLink.includes('localhost')
    ? data.referralLink 
    : `${currentOrigin}/?ref=${rawCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rawCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg sm:text-xl font-sans font-bold text-[#EAECEF] tracking-tight">Institutional Affiliate Network</h2>
        <p className="text-xs text-[#848E9C] font-mono mt-0.5">Earn up to 30% instant commission on referred capital allocations across all 4 tiers.</p>
      </div>

      {/* Referral Link & Unique Code Hero Box */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#1E2329] border border-[#2B313A] relative overflow-hidden shadow-xl space-y-6">
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-[#F0B90B] uppercase tracking-widest flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#F0B90B]" /> Your Sovereign Invitation Suite
          </span>
          <div className="text-xl sm:text-2xl font-sans font-bold text-[#EAECEF] tracking-tight">
            Share institutional investments. Receive instant wallet payouts.
          </div>
          <p className="text-xs text-[#848E9C] max-w-2xl leading-relaxed">
            When prospective investors click your referral link, the registration portal opens and automatically applies your unique code. Commissions are credited to your balance the moment their capital is confirmed.
          </p>
        </div>

        {/* Dual Cards: Invitation Link + Unique Code */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
          {/* 1. Full Referral Link */}
          <div className="lg:col-span-8 p-4 rounded-xl bg-[#181A20] border border-[#2B313A] flex flex-col justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#848E9C] font-semibold flex items-center gap-1.5 mb-1.5">
                <Share2 className="w-3 h-3 text-[#F0B90B]" /> Direct Invitation Link (Auto-Registration)
              </div>
              <div className="w-full px-3.5 py-2.5 rounded-lg bg-[#121418] border border-[#2B313A] font-mono text-xs text-[#0ECB81] truncate select-all">
                {referralLink}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-[#848E9C] font-mono hidden sm:inline">
                Pre-fills referral code upon click
              </span>
              <button
                onClick={handleCopyLink}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-md shadow-[#F0B90B]/15 active:scale-95 cursor-pointer ml-auto"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied Link!' : 'Copy Invitation Link'}</span>
              </button>
            </div>
          </div>

          {/* 2. Standalone Unique Referral Code */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-[#181A20] border border-[#2B313A] flex flex-col justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#848E9C] font-semibold flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="w-3 h-3 text-[#0ECB81]" /> Unique Referral Code
              </div>
              <div className="w-full px-3.5 py-2.5 rounded-lg bg-[#121418] border border-[#0ECB81]/40 font-mono text-sm font-bold text-[#EAECEF] tracking-wider text-center select-all truncate">
                {rawCode}
              </div>
            </div>
            <div className="pt-1">
              <button
                onClick={handleCopyCode}
                className="w-full py-2 rounded-lg bg-[#2B313A] hover:bg-[#363D47] hover:border-[#0ECB81]/40 border border-transparent text-[#EAECEF] font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#0ECB81]" /> : <Copy className="w-3.5 h-3.5" />}
                <span className={copiedCode ? 'text-[#0ECB81]' : ''}>{copiedCode ? 'Copied Code!' : 'Copy Code Only'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-[#1E2329] border border-[#2B313A]">
          <div className="text-[11px] font-mono text-[#848E9C] uppercase">Total Affiliate Earnings</div>
          <div className="text-2xl font-sans font-bold text-[#F0B90B] my-1 tracking-tight">
            ${(data?.totalCommissionEarned ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#848E9C]">Zero withdrawal threshold</div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[#1E2329] border border-[#2B313A]">
          <div className="text-[11px] font-mono text-[#848E9C] uppercase">Referred Clients</div>
          <div className="text-2xl font-sans font-bold text-[#EAECEF] my-1 tracking-tight">
            {data?.totalReferrals ?? 0}
          </div>
          <div className="text-[10px] text-[#848E9C]">Active downline members</div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[#1E2329] border border-[#2B313A]">
          <div className="text-[11px] font-mono text-[#848E9C] uppercase">Maximum Tier Rate</div>
          <div className="text-2xl font-sans font-bold text-[#0ECB81] my-1 tracking-tight">
            30.0%
          </div>
          <div className="text-[10px] text-[#848E9C]">On Retirement Plan allocations</div>
        </div>
      </div>

      {/* 4 Tier Rate Cards */}
      <div className="space-y-3">
        <h3 className="text-base font-sans font-semibold text-[#EAECEF] tracking-tight">Commission Architecture by Tier</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A]">
            <div className="text-[10px] font-mono text-[#848E9C] uppercase font-semibold">Tier 01: Amateur Plan</div>
            <div className="text-2xl font-sans font-bold text-[#EAECEF] my-0.5 tracking-tight">8%</div>
            <div className="text-[11px] text-[#F0B90B] font-mono font-medium">$100 – $1,999</div>
            <p className="text-[10px] text-[#848E9C] mt-1.5">Instant credit on 24h entry allocations</p>
          </div>

          <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A]">
            <div className="text-[10px] font-mono text-[#848E9C] uppercase font-semibold">Tier 02: Standard Plan</div>
            <div className="text-2xl font-sans font-bold text-[#EAECEF] my-0.5 tracking-tight">16%</div>
            <div className="text-[11px] text-[#F0B90B] font-mono font-medium">$2,000 – $5,999</div>
            <p className="text-[10px] text-[#848E9C] mt-1.5">Instant credit on 48h capital cycles</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/40 shadow-sm shadow-[#F0B90B]/5">
            <div className="text-[10px] font-mono text-[#F0B90B] uppercase font-bold">Tier 03: Premium Plan</div>
            <div className="text-2xl font-sans font-bold text-[#F0B90B] my-0.5 tracking-tight">24%</div>
            <div className="text-[11px] text-[#F0B90B] font-mono font-bold">$6,000 – $10,999</div>
            <p className="text-[10px] text-[#EAECEF]/70 mt-1.5 font-medium">VIP partner payout on 72h cycles</p>
          </div>

          <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A]">
            <div className="text-[10px] font-mono text-[#848E9C] uppercase font-semibold">Tier 04: Retirement Plan</div>
            <div className="text-2xl font-sans font-bold text-[#0ECB81] my-0.5 tracking-tight">30%</div>
            <div className="text-[11px] text-[#0ECB81] font-mono font-medium">$11,000 – Unlimited</div>
            <p className="text-[10px] text-[#848E9C] mt-1.5">Maximum payout on sovereign reserve capital</p>
          </div>
        </div>
      </div>

      {/* Downline & Commissions Log */}
      <div className="p-6 rounded-2xl bg-[#1E2329] border border-[#2B313A] space-y-4 shadow-xl">
        <h3 className="font-sans text-base font-semibold text-[#EAECEF] tracking-tight">Recent Referral Payouts</h3>
        {data && data.commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[#848E9C] uppercase border-b border-[#2B313A]">
                <tr>
                  <th className="pb-3 font-medium">Referred Client</th>
                  <th className="pb-3 font-medium">Investment Tier</th>
                  <th className="pb-3 font-medium">Allocation</th>
                  <th className="pb-3 font-medium">Rate</th>
                  <th className="pb-3 font-medium text-right">Commission Disbursed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313A]">
                {data.commissions.map(c => (
                  <tr key={c.id} className="hover:bg-[#181A20] transition-colors">
                    <td className="py-3 text-[#EAECEF] font-medium">{c.referredUserEmail}</td>
                    <td className="py-3 text-[#F0B90B] uppercase font-semibold">{c.planId}</td>
                    <td className="py-3 text-[#EAECEF]">${c.depositAmount.toLocaleString()}</td>
                    <td className="py-3 text-[#848E9C]">{(c.rate * 100).toFixed(0)}%</td>
                    <td className="py-3 text-[#0ECB81] font-bold text-right">+${c.commissionAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-[#848E9C] text-xs font-mono">
            No referral commissions registered yet. Share your invite link to begin earning.
          </div>
        )}
      </div>
    </div>
  );
};
