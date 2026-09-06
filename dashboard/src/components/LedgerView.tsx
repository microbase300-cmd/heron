import React, { useState } from 'react';
import { ReceiptText, ArrowDownLeft, ArrowUpRight, TrendingUp, Users, Lock, CheckCircle2, Copy, Check } from 'lucide-react';
import { Transaction } from '../types';

interface LedgerViewProps {
  transactions: Transaction[];
}

export const LedgerView: React.FC<LedgerViewProps> = ({ transactions }) => {
  const [filter, setFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-3.5 h-3.5 text-[#0ECB81]" />;
      case 'withdrawal': return <ArrowUpRight className="w-3.5 h-3.5 text-[#F6465D]" />;
      case 'yield_payout': return <TrendingUp className="w-3.5 h-3.5 text-[#F0B90B]" />;
      case 'referral_bonus': return <Users className="w-3.5 h-3.5 text-[#FCD535]" />;
      case 'investment_lock': return <Lock className="w-3.5 h-3.5 text-[#F0B90B]" />;
      default: return <ReceiptText className="w-3.5 h-3.5 text-[#848E9C]" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-[#EAECEF] tracking-tight">Cryptographic Audit Ledger</h2>
          <p className="text-xs text-[#848E9C] font-mono mt-0.5">Immutable record of all deposits, withdrawals, timelocks, and yield disbursements</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-lg bg-[#181A20] border border-[#2B313A] text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'yield_payout', label: 'Yield Payouts' },
            { id: 'investment_lock', label: 'Investment Locks' },
            { id: 'referral_bonus', label: 'Affiliate' },
            { id: 'withdrawal', label: 'Withdrawals' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
                filter === f.id ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm' : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-[#1E2329] border border-[#2B313A] overflow-hidden shadow-xl">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[#848E9C] uppercase bg-[#181A20] border-b border-[#2B313A]">
                <tr>
                  <th className="py-3.5 px-6 font-medium">Type</th>
                  <th className="py-3.5 px-4 font-medium">Description</th>
                  <th className="py-3.5 px-4 font-medium">Transaction Proof</th>
                  <th className="py-3.5 px-4 font-medium text-right">Amount</th>
                  <th className="py-3.5 px-4 font-medium text-center">Status</th>
                  <th className="py-3.5 px-6 font-medium text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313A]">
                {filtered.map(t => {
                  const isPositive = t.type === 'deposit' || t.type === 'yield_payout' || t.type === 'referral_bonus';
                  return (
                    <tr key={t.id} className="hover:bg-[#181A20] transition-colors">
                      <td className="py-4 px-6 text-[#EAECEF] font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#181A20] border border-[#2B313A] flex items-center justify-center">
                            {getIcon(t.type)}
                          </div>
                          <span className="capitalize">{t.type.replace('_', ' ')}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-[#848E9C] max-w-xs truncate">
                        {t.note}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-[#848E9C] hover:text-[#F0B90B] transition-colors">
                          <span className="font-mono text-[11px] truncate max-w-[120px]">{t.txHash}</span>
                          <button
                            onClick={() => handleCopyHash(t.txHash, t.id)}
                            className="p-1 rounded hover:bg-[#2B313A]"
                            title="Copy Tx Hash"
                          >
                            {copiedId === t.id ? <Check className="w-3 h-3 text-[#0ECB81]" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right font-sans text-sm font-bold">
                        <span className={isPositive ? 'text-[#0ECB81]' : 'text-[#EAECEF]'}>
                          {isPositive ? '+' : '-'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {t.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right text-[#848E9C] text-[11px]">
                        {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-[#848E9C] text-xs font-mono">
            No transactions found for this filter.
          </div>
        )}
      </div>
    </div>
  );
};
