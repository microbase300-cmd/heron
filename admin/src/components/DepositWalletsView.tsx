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

const NETWORK_PRESETS: Record<string, string[]> = {
  USDT: [
    'Tron (TRC-20)',
    'Ethereum (ERC-20)',
    'BNB Smart Chain (BEP-20)',
    'Solana SPL',
    'Polygon (PoS)',
    'Arbitrum One (L2)',
    'Optimism (OP Mainnet)',
    'Base (Coinbase L2)',
    'Avalanche C-Chain',
    'TON (The Open Network)'
  ],
  BTC: [
    'Bitcoin Native SegWit',
    'Bitcoin Legacy (Mainnet)',
    'Bitcoin Taproot (P2TR)',
    'Lightning Network',
    'BNB Smart Chain (BEP-20)'
  ],
  ETH: [
    'Ethereum Mainnet',
    'Arbitrum One (L2)',
    'Optimism (OP Mainnet)',
    'Base (Coinbase L2)',
    'Polygon (PoS)',
    'BNB Smart Chain (BEP-20)'
  ],
  SOL: [
    'Solana SPL',
    'Solana Native'
  ],
  USDC: [
    'Ethereum (ERC-20)',
    'Solana SPL',
    'Tron (TRC-20)',
    'Polygon (PoS)',
    'Arbitrum One (L2)',
    'Base (L2)',
    'Avalanche C-Chain',
    'BNB Smart Chain (BEP-20)'
  ],
  BNB: [
    'BNB Smart Chain (BEP-20)',
    'BNB Beacon Chain (BEP-2)'
  ],
  XRP: [
    'XRP Ripple Ledger (Native)'
  ],
  DOGE: [
    'Dogecoin Mainnet'
  ],
  ADA: [
    'Cardano Mainnet'
  ],
  LTC: [
    'Litecoin Mainnet'
  ]
};

const COMMON_NETWORKS = [
  'Tron (TRC-20)',
  'Ethereum (ERC-20)',
  'Ethereum Mainnet',
  'Bitcoin Native SegWit',
  'Bitcoin Legacy (Mainnet)',
  'Bitcoin Taproot (P2TR)',
  'Solana SPL',
  'Solana Native',
  'BNB Smart Chain (BEP-20)',
  'Polygon (PoS)',
  'Arbitrum One (L2)',
  'Optimism (OP Mainnet)',
  'Base (Coinbase L2)',
  'Avalanche C-Chain',
  'TON (The Open Network)',
  'Lightning Network',
  'XRP Ripple Ledger (Native)',
  'Dogecoin Mainnet',
  'Cardano Mainnet',
  'Litecoin Mainnet'
];

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
      const list = Array.isArray(data)
        ? data
        : data && typeof data === 'object'
        ? Object.entries(data).map(([k, v]: [string, any]) => ({
            key: v?.key || k,
            asset: v?.asset || 'USDT',
            network: v?.network || k,
            address: v?.address || '',
            memo: v?.memo,
            isActive: v?.isActive !== undefined ? v.isActive : true,
            updatedAt: v?.updatedAt || new Date().toISOString(),
          }))
        : [];
      setWallets(list);
      const map: Record<string, DepositAddressConfig> = {};
      list.forEach((w) => {
        if (w && w.key) {
          map[w.key] = { ...w };
        }
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
          <h2 className="font-sans text-xl font-bold text-[#EAECEF] flex items-center gap-2 tracking-tight">
            <Wallet className="w-5 h-5 text-[#F0B90B]" />
            Receiving Deposit Wallet Configurations
          </h2>
          <p className="text-xs text-[#848E9C] font-mono">
            Manage hot / cold storage receiving addresses displayed directly to investors in their deposit terminal.
          </p>
        </div>

        <button
          onClick={fetchWallets}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1E2329] hover:bg-[#2B313A] border border-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] text-xs font-mono transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#F0B90B]' : ''}`} />
          <span>Refresh Addresses</span>
        </button>
      </div>

      {/* Security Disclaimer */}
      <div className="p-4 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="text-[#EAECEF] font-bold">Enterprise Treasury Notice</p>
          <p className="text-[#848E9C] leading-relaxed">
            Changing these deposit addresses takes effect immediately across all client-facing dashboard portals. Double check destination addresses, network types, and memo fields before saving to prevent stranded liquidity.
          </p>
        </div>
      </div>

      {/* Wallets Grid */}
      {loading ? (
        <div className="p-12 text-center text-[#848E9C] font-mono text-xs">
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
                className="glass-panel p-5 rounded-xl border border-[#2B313A] bg-[#1E2329] space-y-4 relative overflow-hidden hover:border-[#F0B90B]/30 transition-all"
              >
                {/* Header of Card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B] font-mono font-bold text-xs">
                      {current.asset}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#EAECEF] flex items-center gap-2">
                        <span>{current.network}</span>
                        {current.isActive ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30">
                            Disabled
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] font-mono text-[#848E9C]">Key: {wallet.key}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-[#848E9C] hover:text-[#EAECEF]">
                      <input
                        type="checkbox"
                        checked={current.isActive}
                        onChange={(e) => handleChange(wallet.key, 'isActive', e.target.checked)}
                        className="rounded border-[#363D47] text-[#F0B90B] focus:ring-[#F0B90B]/50 bg-[#2B313A]"
                      />
                      <span>Enabled</span>
                    </label>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-mono text-[#848E9C] mb-1">
                      Receiving Address (Public)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={current.address}
                        onChange={(e) => handleChange(wallet.key, 'address', e.target.value)}
                        placeholder="Enter full blockchain address..."
                        className="w-full glass-input text-xs font-mono py-2 pl-3 pr-10 text-[#EAECEF] rounded-lg bg-[#2B313A] border-[#363D47]"
                      />
                      <button
                        onClick={() => copyToClipboard(wallet.key, current.address)}
                        className="absolute right-2 p-1.5 rounded-lg text-[#848E9C] hover:text-[#F0B90B] hover:bg-[#181A20] transition-all"
                        title="Copy Address"
                      >
                        {copiedKey === wallet.key ? (
                          <Check className="w-3.5 h-3.5 text-[#0ECB81]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-[#848E9C] mb-1">
                        Network Label
                      </label>
                      {(() => {
                        const assetUpper = (current.asset || '').toUpperCase();
                        const presets = NETWORK_PRESETS[assetUpper] || COMMON_NETWORKS;
                        const isPreset = presets.includes(current.network);
                        const isCommon = COMMON_NETWORKS.includes(current.network);
                        const isKnown = isPreset || isCommon;

                        return (
                          <div className="space-y-1.5">
                            <select
                              value={isKnown ? current.network : '__CUSTOM__'}
                              onChange={(e) => {
                                if (e.target.value === '__CUSTOM__') {
                                  if (isKnown) {
                                    handleChange(wallet.key, 'network', '');
                                  }
                                } else {
                                  handleChange(wallet.key, 'network', e.target.value);
                                }
                              }}
                              className="w-full glass-input text-xs font-mono py-2 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border border-[#363D47] focus:border-[#F0B90B] outline-none cursor-pointer"
                            >
                              <optgroup label={`Recommended for ${current.asset || 'Asset'}`}>
                                {presets.map((net) => (
                                  <option key={net} value={net} className="bg-[#1E2329] text-[#EAECEF]">
                                    {net}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="Other Standard Blockchain Networks">
                                {COMMON_NETWORKS.filter((n) => !presets.includes(n)).map((net) => (
                                  <option key={net} value={net} className="bg-[#1E2329] text-[#848E9C]">
                                    {net}
                                  </option>
                                ))}
                              </optgroup>
                              <option value="__CUSTOM__" className="bg-[#1E2329] text-[#F0B90B] font-bold">
                                ✎ Custom / Other Network Label...
                              </option>
                            </select>

                            {!isKnown && (
                              <input
                                type="text"
                                value={current.network}
                                onChange={(e) => handleChange(wallet.key, 'network', e.target.value)}
                                placeholder="Type custom network label..."
                                className="w-full glass-input text-xs font-mono py-1.5 px-3 text-[#EAECEF] rounded-lg border border-[#F0B90B]/40 bg-[#F0B90B]/10 placeholder:text-[#848E9C]"
                              />
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#848E9C] mb-1">
                        Asset Symbol
                      </label>
                      <input
                        type="text"
                        value={current.asset}
                        onChange={(e) => handleChange(wallet.key, 'asset', e.target.value)}
                        className="w-full glass-input text-xs font-mono py-2 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border-[#363D47]"
                      />
                    </div>
                  </div>

                  {current.memo !== undefined && (
                    <div>
                      <label className="block text-[11px] font-mono text-[#848E9C] mb-1">
                        Routing Tag / Memo (Optional)
                      </label>
                      <input
                        type="text"
                        value={current.memo || ''}
                        onChange={(e) => handleChange(wallet.key, 'memo', e.target.value)}
                        placeholder="e.g. 1004829"
                        className="w-full glass-input text-xs font-mono py-2 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border-[#363D47]"
                      />
                    </div>
                  )}
                </div>

                {/* Feedback Message */}
                {itemFeedback && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
                      itemFeedback.type === 'success'
                        ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                        : 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30'
                    }`}
                  >
                    {itemFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0ECB81]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#F6465D]" />
                    )}
                    <span>{itemFeedback.message}</span>
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-2 flex items-center justify-between border-t border-[#2B313A]">
                  <span className="text-[10px] font-mono text-[#848E9C]">
                    Updated: {new Date(wallet.updatedAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => handleSave(wallet.key)}
                    disabled={isSaving || !isModified}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md ${
                      isModified
                        ? 'btn-binance'
                        : 'bg-[#2B313A] text-[#5E6673] cursor-not-allowed border border-[#363D47]'
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

