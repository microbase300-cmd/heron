import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { Transaction } from '../types';
import { adminApi } from '../services/api';

interface TransactionDeskViewProps {
  transactions: Transaction[];
  onRefreshTransactions: () => void;
}

type TabType = 'all' | 'pending_deposits' | 'pending_withdrawals' | 'completed' | 'rejected';

export const TransactionDeskView: React.FC<TransactionDeskViewProps> = ({
  transactions,
  onRefreshTransactions,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');

  const totalPendingDepositAmount = pendingDeposits.reduce((acc, t) => acc + t.amount, 0);
  const totalPendingWithdrawalAmount = pendingWithdrawals.reduce((acc, t) => acc + t.amount, 0);

  const filtered = transactions.filter((t) => {
    let matchesTab = true;
    if (activeTab === 'pending_deposits') {
      matchesTab = t.type === 'deposit' && t.status === 'pending';
    } else if (activeTab === 'pending_withdrawals') {
      matchesTab = t.type === 'withdrawal' && t.status === 'pending';
    } else if (activeTab === 'completed') {
      matchesTab = t.status === 'completed';
    } else if (activeTab === 'rejected') {
      matchesTab = t.status === 'rejected';
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      t.id.toLowerCase().includes(term) ||
      t.userId.toLowerCase().includes(term) ||
      (t.txHash && t.txHash.toLowerCase().includes(term)) ||
      (t.note && t.note.toLowerCase().includes(term)) ||
      t.asset.toLowerCase().includes(term);

    return matchesTab && matchesSearch;
  });

  const handleApproveDeposit = async (tx: Transaction) => {
    if (!window.confirm(`Confirm inbound deposit of $${tx.amount.toLocaleString()} ${tx.asset} for User ${tx.userId}? Balance will be credited instantly.`)) return;
    setProcessingId(tx.id);
    try {
      await adminApi.approveTransaction(tx.id);
      onRefreshTransactions();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm deposit.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveWithdrawal = async (tx: Transaction) => {
    if (!window.confirm(`Authorize withdrawal disbursement of $${tx.amount.toLocaleString()} ${tx.asset} to client address?`)) return;
    setProcessingId(tx.id);
    try {
      await adminApi.approveTransaction(tx.id);
      onRefreshTransactions();
    } catch (err: any) {
      alert(err.message || 'Failed to approve withdrawal.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (tx: Transaction) => {
    const isWithdrawal = tx.type === 'withdrawal';
    const msg = isWithdrawal
      ? `Reject withdrawal of $${tx.amount.toLocaleString()}? The escrowed balance of $${tx.amount.toLocaleString()} will be automatically REFUNDED to the investor.`
      : `Reject inbound deposit record ${tx.id}?`;
    
    if (!window.confirm(msg)) return;
    setProcessingId(tx.id);
    try {
      await adminApi.rejectTransaction(tx.id);
      onRefreshTransactions();
    } catch (err: any) {
      alert(err.message || 'Failed to reject transaction.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and KPI Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold" />
            Settlement Desk & Liquidity Verification
          </h2>
          <p className="text-xs text-white/50 font-mono">
            Two-tier institutional clearance pipeline for inbound deposits & client disbursements.
          </p>
        </div>
      </div>

      {/* Settlement Queues Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => setActiveTab('pending_deposits')}
          className={`p-4 rounded-2xl glass-panel border transition-all cursor-pointer ${
            activeTab === 'pending_deposits' ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' : 'hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-mono uppercase text-white/60 tracking-wider">Inbound Deposits Queue</h3>
                <div className="text-lg font-mono font-bold text-white mt-0.5">
                  ${totalPendingDepositAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
              pendingDeposits.length > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse' : 'bg-white/5 text-white/40'
            }`}>
              {pendingDeposits.length} pending
            </span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('pending_withdrawals')}
          className={`p-4 rounded-2xl glass-panel border transition-all cursor-pointer ${
            activeTab === 'pending_withdrawals' ? 'border-amber-500/50 bg-amber-950/20 shadow-lg shadow-amber-500/10' : 'hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-mono uppercase text-white/60 tracking-wider">Outbound Withdrawals Queue</h3>
                <div className="text-lg font-mono font-bold text-white mt-0.5">
                  ${totalPendingWithdrawalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
              pendingWithdrawals.length > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' : 'bg-white/5 text-white/40'
            }`}>
              {pendingWithdrawals.length} awaiting approval
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] overflow-x-auto max-w-full">
          {[
            { id: 'all', label: `All Transactions (${transactions.length})` },
            { id: 'pending_deposits', label: `Pending Deposits (${pendingDeposits.length})` },
            { id: 'pending_withdrawals', label: `Pending Withdrawals (${pendingWithdrawals.length})` },
            { id: 'completed', label: 'Completed' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gold text-[#0b0d0d] font-bold shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search TX, User, Hash, Note..."
            className="pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs w-60"
          />
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] text-white/50 font-mono uppercase tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-4">Transaction / User</th>
                <th className="py-3.5 px-4">Type & Asset</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length > 0 ? (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{tx.id}</span>
                        {tx.txHash && (
                          <span className="text-[10px] text-gold/80 font-mono truncate max-w-[140px]" title={tx.txHash}>
                            ({tx.txHash})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/50 font-sans mt-0.5 max-w-sm truncate">
                        {tx.note || `User: ${tx.userId}`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${
                          tx.type === 'deposit'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                            : tx.type === 'withdrawal'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                            : tx.type === 'yield_payout'
                            ? 'bg-sky-950/60 text-sky-400 border border-sky-500/30'
                            : 'bg-gold/10 text-gold border border-gold/30'
                        }`}
                      >
                        {tx.type === 'deposit' && <ArrowDownLeft className="w-3 h-3" />}
                        {tx.type === 'withdrawal' && <ArrowUpRight className="w-3 h-3" />}
                        {tx.type.replace('_', ' ')} • {tx.asset}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                      ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          tx.status === 'completed'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                            : tx.status === 'pending'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 animate-pulse'
                            : 'bg-red-950/60 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {tx.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {tx.status === 'pending' && <Clock className="w-3 h-3" />}
                        {tx.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {tx.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-white/50 text-[11px]">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {tx.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          {tx.type === 'deposit' ? (
                            <button
                              onClick={() => handleApproveDeposit(tx)}
                              disabled={processingId === tx.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Confirm & Credit
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveWithdrawal(tx)}
                              disabled={processingId === tx.id}
                              className="px-3 py-1.5 rounded-lg bg-gold hover:bg-gold-light text-[#0b0d0d] font-mono text-xs font-bold transition-all shadow-md shadow-gold/20 disabled:opacity-50 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve Payout
                            </button>
                          )}
                          <button
                            onClick={() => handleReject(tx)}
                            disabled={processingId === tx.id}
                            className="px-2.5 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/30 font-mono text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {tx.type === 'withdrawal' ? 'Reject & Refund' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-white/30 font-mono text-[11px]">Reconciled</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/40 font-mono">
                    No transactions matching current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
