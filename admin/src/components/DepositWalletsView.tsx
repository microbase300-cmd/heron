import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Save, 
  RefreshCw, 
  Check, 
  Copy, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { DepositAddressConfig } from '../types';
import { adminApi } from '../services/api';

export const DepositWalletsView: React.FC = () => {
  const [wallets, setWallets] = useState<DepositAddressConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editedWallets, setEditedWallets] = useState<Record<string, DepositAddressConfig>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ key: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getWallets();
      setWallets(data);
      const map: Record<string, DepositAddressConfig> = {};
      data.forEach(w => {
        map[w.key] = { ...w };
      });
      setEditedWallets(map);
    } catch (err: any) {
      console.error('Failed to load deposit wallets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleChange = (key: string, field: keyof DepositAddressConfig, value: any) => {
    setEditedWallets(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleSave = async (key: string) => {
    const config = editedWallets[key];
    if (!config || !config.address || config.address.trim().length < 8) {
      setFeedback({ key, message: 'Please enter a valid wallet address.', type: 'error' });
      return;
    }

    try {
      setSavingKey(key);
      const res = await adminApi.updateWallet(key, config);
      setFeedback({ key, message: res.message || 'Receiving address updated successfully!', type: 'success' });
      await fetchWallets();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ key, message: err.message || 'Failed to update wallet address.', type: 'error' });
    } finally {
      setSavingKey(null);
    }
  };

  const copyToClipboard = (key: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gold" />
            Receiving Deposit Wallet Configurations
          </h2>
          <p className="text-xs text-white/50 font-mono">
            Manage hot / cold storage receiving addresses displayed directly to investors in their deposit terminal.
          </p>
        </div>

        <button
          onClick={fetchWallets}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/80 hover:text-white text-xs font-mono transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Addresses</span>
        </button>
      </div>

      {/* Security Disclaimer */}
      <div className="p-4 rounded-2xl bg-gold/5 border border-gold/20 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-gold shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="text-white font-medium">Enterprise Treasury Notice</p>
          <p className="text-white/60 leading-relaxed">
            Changing these deposit addresses takes effect immediately across all client-facing dashboard portals. Double check destination addresses, network types, and memo fields before saving to prevent stranded liquidity.
          </p>
        </div>
      </div>

      {/* Wallets Grid */}
      {loading ? (
        <div className="p-12 text-center text-white/40 font-mono text-xs">
          Loading platform receiving addresses...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wallets.map((wallet) => {
            const current = editedWallets[wallet.key] || wallet;
            const isModified = JSON.stringify(current) !== JSON.stringify(wallet);
            const isSaving = savingKey === wallet.key;
            const itemFeedback = feedback?.key === wallet.key ? feedback : null;

            return (
              <div
                key={wallet.key}
                className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-4 relative overflow-hidden"
              >
                {/* Header of Card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-mono font-bold text-xs">
                      {current.asset}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{current.network}</span>
                        {current.isActive ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-400 border border-rose-500/30">
                            Disabled
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] font-mono text-white/40">Key: {wallet.key}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-white/70">
                      <input
                        type="checkbox"
                        checked={current.isActive}
                        onChange={(e) => handleChange(wallet.key, 'isActive', e.target.checked)}
                        className="rounded border-white/20 text-gold focus:ring-gold/50 bg-black/40"
                      />
                      <span>Enabled</span>
                    </label>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-mono text-white/50 mb-1">
                      Receiving Address (Public)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={current.address}
                        onChange={(e) => handleChange(wallet.key, 'address', e.target.value)}
                        placeholder="Enter full blockchain address..."
                        className="w-full glass-input text-xs font-mono py-2 pl-3 pr-10 text-white rounded-xl"
                      />
                      <button
                        onClick={() => copyToClipboard(wallet.key, current.address)}
                        className="absolute right-2 p-1.5 rounded-lg text-white/40 hover:text-gold hover:bg-white/10 transition-all"
                        title="Copy Address"
                      >
                        {copiedKey === wallet.key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-white/50 mb-1">
                        Network Label
                      </label>
                      <input
                        type="text"
                        value={current.network}
                        onChange={(e) => handleChange(wallet.key, 'network', e.target.value)}
                        className="w-full glass-input text-xs font-mono py-2 px-3 text-white rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-white/50 mb-1">
                        Asset Symbol
                      </label>
                      <input
                        type="text"
                        value={current.asset}
                        onChange={(e) => handleChange(wallet.key, 'asset', e.target.value)}
                        className="w-full glass-input text-xs font-mono py-2 px-3 text-white rounded-xl"
                      />
                    </div>
                  </div>

                  {current.memo !== undefined && (
                    <div>
                      <label className="block text-[11px] font-mono text-white/50 mb-1">
                        Routing Tag / Memo (Optional)
                      </label>
                      <input
                        type="text"
                        value={current.memo || ''}
                        onChange={(e) => handleChange(wallet.key, 'memo', e.target.value)}
                        placeholder="e.g. 1004829"
                        className="w-full glass-input text-xs font-mono py-2 px-3 text-white rounded-xl"
                      />
                    </div>
                  )}
                </div>

                {/* Feedback Message */}
                {itemFeedback && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
                      itemFeedback.type === 'success'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {itemFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{itemFeedback.message}</span>
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
                  <span className="text-[10px] font-mono text-white/40">
                    Updated: {new Date(wallet.updatedAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => handleSave(wallet.key)}
                    disabled={isSaving || !isModified}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md ${
                      isModified
                        ? 'bg-gradient-to-r from-gold to-gold-light text-[#0b0d0d] hover:brightness-105 shadow-gold/20'
                        : 'bg-white/[0.04] text-white/30 cursor-not-allowed border border-white/[0.05]'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Updating...' : isModified ? 'Save Changes' : 'Saved'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
