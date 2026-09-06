import React, { useState } from 'react';
import {
  Users,
  Search,
  DollarSign,
  UserCheck,
  UserX,
  AlertCircle,
  X,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { AdminUser } from '../types';
import { adminApi } from '../services/api';

interface UserManagementViewProps {
  users: AdminUser[];
  onRefreshUsers: () => void;
  onSelectInvestor?: (userId: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onRefreshUsers,
  onSelectInvestor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'funded' | 'unfunded' | 'active' | 'suspended'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalMode, setModalMode] = useState<'balance' | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Balance adjustment & Top Up state
  const [adjustAction, setAdjustAction] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshUsers();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const filteredUsers = users.filter((u) => {
    // Search filter
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.id.toLowerCase().includes(term) ||
      (u.referralCode && u.referralCode.toLowerCase().includes(term));

    // Category filter
    let matchesCategory = true;
    if (filterType === 'funded') {
      matchesCategory = u.balance > 0;
    } else if (filterType === 'unfunded') {
      matchesCategory = u.balance === 0;
    } else if (filterType === 'active') {
      matchesCategory = u.status === 'active';
    } else if (filterType === 'suspended') {
      matchesCategory = u.status === 'suspended';
    }

    return matchesSearch && matchesCategory;
  });

  const totalFunded = users.filter(u => u.balance > 0).length;
  const totalUnfunded = users.filter(u => u.balance === 0).length;
  const totalPlatformBalance = users.reduce((acc, u) => acc + (u.balance || 0), 0);

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionMessage(null);
    setLoadingAction(true);

    try {
      const amount = parseFloat(adjustAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid positive numerical amount.');
      }

      const res = await adminApi.adjustUserBalance(
        selectedUser.id,
        amount,
        adjustAction,
        adjustNote || (adjustAction === 'credit' ? 'Executive manual liquidity top-up' : 'Executive manual debit')
      );

      setActionMessage({ type: 'success', text: res.message });
      setAdjustAmount('');
      setAdjustNote('');
      onRefreshUsers();
      setTimeout(() => {
        setModalMode(null);
        setSelectedUser(null);
        setActionMessage(null);
      }, 1500);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Balance update failed.' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    if (
      !window.confirm(
        `Are you sure you want to change ${user.name}'s status to ${newStatus.toUpperCase()}?`
      )
    ) {
      return;
    }

    try {
      await adminApi.updateUserStatus(user.id, newStatus);
      onRefreshUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const setPresetAmount = (val: number) => {
    setAdjustAmount(val.toString());
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-xl font-bold text-[#EAECEF] flex items-center gap-2 tracking-tight">
            <Users className="w-5 h-5 text-[#F0B90B]" />
            Investor Account Directory ({users.length})
          </h2>
          <p className="text-xs text-[#848E9C] font-mono">
            Direct ledger inspection, liquidity top-ups, and user verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E2329] hover:bg-[#2B313A] border border-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] text-xs font-mono transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#F0B90B] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Directory</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg glass-panel border border-[#2B313A] bg-[#1E2329]">
          <div className="text-[11px] font-mono text-[#848E9C]">Total Registered</div>
          <div className="text-lg font-mono font-bold text-[#EAECEF] mt-0.5">{users.length} Investors</div>
        </div>

        <div className="p-3.5 rounded-lg glass-panel border border-[#2B313A] bg-[#1E2329]">
          <div className="text-[11px] font-mono text-[#848E9C]">Funded Accounts</div>
          <div className="text-lg font-mono font-bold text-[#0ECB81] mt-0.5">{totalFunded} Active</div>
        </div>

        <div className="p-3.5 rounded-lg glass-panel border border-[#2B313A] bg-[#1E2329]">
          <div className="text-[11px] font-mono text-[#848E9C]">Zero Balance ($0)</div>
          <div className="text-lg font-mono font-bold text-[#F0B90B] mt-0.5">{totalUnfunded} New / Pending</div>
        </div>

        <div className="p-3.5 rounded-lg glass-panel border border-[#2B313A] bg-[#1E2329]">
          <div className="text-[11px] font-mono text-[#848E9C]">Total User Balances</div>
          <div className="text-lg font-mono font-bold text-[#F0B90B] mt-0.5">
            ${totalPlatformBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 bg-[#1E2329] p-1 rounded-lg border border-[#2B313A] overflow-x-auto max-w-full">
          {[
            { id: 'all', label: `All (${users.length})` },
            { id: 'funded', label: `Funded (${totalFunded})` },
            { id: 'unfunded', label: `Zero Balance (${totalUnfunded})` },
            { id: 'active', label: 'Active' },
            { id: 'suspended', label: 'Suspended' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap transition-all ${
                filterType === f.id
                  ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm'
                  : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, referral code..."
            className="w-full pl-9 pr-4 py-2 rounded-lg glass-input text-xs bg-[#2B313A] border-[#363D47] text-[#EAECEF]"
          />
          <Search className="w-3.5 h-3.5 text-[#848E9C] absolute left-3 top-2.5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-[#848E9C] hover:text-[#EAECEF] text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-[#2B313A] bg-[#1E2329]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#2B313A]/60 text-[#848E9C] font-mono uppercase tracking-wider border-b border-[#2B313A]">
              <tr>
                <th className="py-3.5 px-4">Investor Account</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Available Liquidity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Referral Code</th>
                <th className="py-3.5 px-4">Registration Date</th>
                <th className="py-3.5 px-4 text-right">Ledger Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B313A]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isNewToday = new Date(u.createdAt).toDateString() === new Date().toDateString();

                  return (
                    <tr key={u.id} className="hover:bg-[#2B313A]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-xs font-bold text-[#F0B90B]">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-sans font-bold text-[#EAECEF] text-sm flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isNewToday && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0ECB81]/20 text-[#0ECB81] border border-[#0ECB81]/40">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-[#848E9C]">{u.email}</div>
                            <div className="text-[10px] font-mono text-[#848E9C]/60">{u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            u.role === 'admin'
                              ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30'
                              : 'bg-[#2B313A] text-[#848E9C]'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className={`font-bold text-sm ${u.balance > 0 ? 'text-[#0ECB81]' : 'text-[#848E9C]'}`}>
                          ${u.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        {u.balance === 0 && (
                          <span className="text-[10px] text-[#848E9C]/60 font-mono">Zero Balance</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            u.status === 'active'
                              ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                              : 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30'
                          }`}
                        >
                          {u.status === 'active' ? (
                            <UserCheck className="w-3 h-3 text-[#0ECB81]" />
                          ) : (
                            <UserX className="w-3 h-3 text-[#F6465D]" />
                          )}
                          {u.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#848E9C]">
                        {u.referralCode || 'N/A'}
                        {u.referredBy && (
                          <div className="text-[10px] text-[#F0B90B]/70">Ref by: {u.referredBy}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#848E9C] text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        <div className="text-[10px] text-[#848E9C]/60">
                          {new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        {onSelectInvestor && (
                          <button
                            onClick={() => onSelectInvestor(u.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-[#848E9C] hover:text-[#EAECEF] border border-[#363D47] text-xs font-mono font-medium transition-all inline-flex items-center gap-1"
                            title="Manage Investor Plans & Portfolio"
                          >
                            <span>Plans</span>
                            <ExternalLink className="w-3 h-3 text-[#848E9C]" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setAdjustAction('credit');
                            setModalMode('balance');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#F0B90B]/15 hover:bg-[#F0B90B]/25 text-[#F0B90B] border border-[#F0B90B]/30 text-xs font-mono font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Top Up / Adjust
                        </button>

                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg text-xs font-mono transition-all ${
                              u.status === 'active'
                                ? 'bg-[#F6465D]/15 hover:bg-[#F6465D]/30 text-[#F6465D] border border-[#F6465D]/30'
                                : 'bg-[#0ECB81]/15 hover:bg-[#0ECB81]/30 text-[#0ECB81] border border-[#0ECB81]/30'
                            }`}
                            title={u.status === 'active' ? 'Suspend Investor' : 'Reactivate Investor'}
                          >
                            {u.status === 'active' ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#848E9C] font-mono">
                    No matching investor records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust / Top Up Balance Modal */}
      {modalMode === 'balance' && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-xl border border-[#F0B90B]/30 bg-[#1E2329] shadow-2xl space-y-4 text-[#EAECEF]">
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-3">
              <h3 className="font-sans text-lg font-bold text-[#EAECEF] flex items-center gap-2 tracking-tight">
                <DollarSign className="w-5 h-5 text-[#F0B90B]" />
                Ledger Balance Top-Up & Adjustment
              </h3>
              <button
                onClick={() => {
                  setModalMode(null);
                  setSelectedUser(null);
                }}
                className="text-[#848E9C] hover:text-[#EAECEF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-[#2B313A] border border-[#363D47] text-xs font-mono">
              <div className="text-[#848E9C]">Target Investor Account:</div>
              <div className="font-bold text-[#EAECEF] text-sm">{selectedUser.name}</div>
              <div className="text-[#848E9C] text-[11px]">{selectedUser.email}</div>
              <div className="mt-2 text-[#848E9C]">
                Current Available Balance:{' '}
                <span className="text-[#F0B90B] font-bold">
                  ${selectedUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {actionMessage && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  actionMessage.type === 'success'
                    ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                    : 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30'
                }`}
              >
                {actionMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#0ECB81]" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#F6465D]" />
                )}
                <span>{actionMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustAction('credit')}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    adjustAction === 'credit'
                      ? 'bg-[#0ECB81] text-[#181A20] shadow-md shadow-[#0ECB81]/20'
                      : 'bg-[#2B313A] text-[#848E9C] hover:bg-[#363D47]'
                  }`}
                >
                  + Top Up / Credit Funds
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustAction('debit')}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    adjustAction === 'debit'
                      ? 'bg-[#F6465D] text-white shadow-md shadow-[#F6465D]/20'
                      : 'bg-[#2B313A] text-[#848E9C] hover:bg-[#363D47]'
                  }`}
                >
                  - Debit / Deduct Balance
                </button>
              </div>

              {/* Quick Amount Presets */}
              <div>
                <label className="block text-[11px] font-mono text-[#848E9C] mb-1">
                  Quick Amount Presets
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[100, 500, 1000, 5000, 10000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPresetAmount(preset)}
                      className="py-1 px-2 rounded-md bg-[#2B313A] hover:bg-[#363D47] border border-[#363D47] text-[11px] font-mono text-[#848E9C] hover:text-[#F0B90B] transition-all"
                    >
                      ${preset >= 1000 ? `${preset / 1000}k` : preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1">
                  Adjustment Amount ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 2500.00"
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-sm font-mono bg-[#2B313A] border-[#363D47] text-[#EAECEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1">
                  Executive Memo / Audit Reason
                </label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. Inbound OTC wire transfer confirmation / Initial top-up"
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-xs bg-[#2B313A] border-[#363D47] text-[#EAECEF]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalMode(null);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2.5 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-[#848E9C] hover:text-[#EAECEF] text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2.5 rounded-lg btn-binance text-xs font-mono font-bold shadow-lg shadow-[#F0B90B]/20 disabled:opacity-50"
                >
                  {loadingAction ? 'Updating Ledger...' : adjustAction === 'credit' ? 'Credit Account' : 'Debit Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

