import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Save, 
  RefreshCw, 
  Check, 
  Copy, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  X,
  AlertTriangle
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

const PRESET_ASSETS = ['USDT', 'USDC', 'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'LTC'];

export const DepositWalletsView: React.FC = () => {
  const [wallets, setWallets] = useState<DepositAddressConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editedWallets, setEditedWallets] = useState<Record<string, DepositAddressConfig>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ key?: string; message: string; type: 'success' | 'error' } | null>(null);

  // Add Wallet Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [newAsset, setNewAsset] = useState('USDT');
  const [newCustomAsset, setNewCustomAsset] = useState('');
  const [newNetwork, setNewNetwork] = useState('Tron (TRC-20)');
  const [newCustomNetwork, setNewCustomNetwork] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newMemo, setNewMemo] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [addModalError, setAddModalError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // When asset changes in add modal, auto-populate recommended network
  const handleAssetSelect = (asset: string) => {
    setNewAsset(asset);
    if (asset !== '__CUSTOM__') {
      const presets = NETWORK_PRESETS[asset];
      if (presets && presets.length > 0) {
        setNewNetwork(presets[0]);
      }
    }
  };

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
      setFeedback({ key, message: 'Please enter a valid wallet address (minimum 8 characters).', type: 'error' });
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

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddModalError(null);

    const effectiveAsset = (newAsset === '__CUSTOM__' ? newCustomAsset : newAsset).trim().toUpperCase();
    const effectiveNetwork = (newNetwork === '__CUSTOM__' ? newCustomNetwork : newNetwork).trim();
    const effectiveAddress = newAddress.trim();

    if (!effectiveAsset) {
      setAddModalError('Please specify an asset symbol (e.g. USDT, BTC, XRP).');
      return;
    }
    if (!effectiveNetwork) {
      setAddModalError('Please specify a network label (e.g. Tron TRC-20, Solana SPL).');
      return;
    }
    if (!effectiveAddress || effectiveAddress.length < 8) {
      setAddModalError('Please provide a valid receiving address (minimum 8 characters).');
      return;
    }

    try {
      setIsSubmittingNew(true);
      const res = await adminApi.createWallet({
        key: newKey.trim() || undefined,
        asset: effectiveAsset,
        network: effectiveNetwork,
        address: effectiveAddress,
        memo: newMemo.trim() || undefined,
        isActive: newIsActive,
      });

      setIsAddModalOpen(false);
      // Reset form
      setNewAddress('');
      setNewMemo('');
      setNewKey('');
      setNewCustomAsset('');
      setNewCustomNetwork('');
      setNewAsset('USDT');
      setNewNetwork('Tron (TRC-20)');
      setNewIsActive(true);

      setFeedback({ message: res.message || 'New receiving wallet added successfully!', type: 'success' });
      await fetchWallets();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setAddModalError(err.message || 'Failed to create deposit wallet.');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleDeleteWallet = async () => {
    if (!deletingKey) return;
    try {
      setIsDeleting(true);
      const res = await adminApi.deleteWallet(deletingKey);
      setDeletingKey(null);
      setFeedback({ message: res.message || `Wallet ${deletingKey} deleted successfully.`, type: 'success' });
      await fetchWallets();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ message: err.message || 'Failed to delete wallet.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (key: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Global Feedback Banner */}
      {feedback && !feedback.key && (
        <div
          className={`p-4 rounded-xl text-xs font-mono flex items-center justify-between gap-3 shadow-lg ${
            feedback.type === 'success'
              ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/40'
              : 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#0ECB81]" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-[#F6465D]" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-mono font-bold transition-all shadow-md shadow-[#F0B90B]/15 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Receiving Wallet</span>
          </button>

          <button
            onClick={fetchWallets}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#1E2329] hover:bg-[#2B313A] border border-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] text-xs font-mono transition-all"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#F0B90B]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Security Disclaimer */}
      <div className="p-4 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="text-[#EAECEF] font-bold">Enterprise Treasury Notice</p>
          <p className="text-[#848E9C] leading-relaxed">
            Changing or adding deposit addresses takes effect immediately across all client-facing dashboard portals. Double check destination addresses, network types, and memo fields before saving to prevent stranded liquidity.
          </p>
        </div>
      </div>

      {/* Wallets Grid */}
      {loading ? (
        <div className="p-12 text-center text-[#848E9C] font-mono text-xs">
          Loading platform receiving addresses...
        </div>
      ) : wallets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1E2329] border border-[#2B313A] space-y-3">
          <Wallet className="w-10 h-10 text-[#848E9C] mx-auto opacity-50" />
          <p className="text-sm font-bold text-[#EAECEF]">No deposit wallets configured</p>
          <p className="text-xs text-[#848E9C] font-mono">Click "+ Add Receiving Wallet" above to configure your first receiving cryptocurrency address.</p>
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
                className="glass-panel p-5 rounded-xl border border-[#2B313A] bg-[#1E2329] space-y-4 relative overflow-hidden hover:border-[#F0B90B]/30 transition-all shadow-md"
              >
                {/* Header of Card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B] font-mono font-bold text-xs shrink-0">
                      {current.asset}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#EAECEF] flex items-center gap-2">
                        <span>{current.network}</span>
                        {current.isActive ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30 font-semibold">
                            Disabled
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] font-mono text-[#848E9C]">Key: {wallet.key}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-[#848E9C] hover:text-[#EAECEF]">
                      <input
                        type="checkbox"
                        checked={current.isActive}
                        onChange={(e) => handleChange(wallet.key, 'isActive', e.target.checked)}
                        className="rounded border-[#363D47] text-[#F0B90B] focus:ring-[#F0B90B]/50 bg-[#2B313A] cursor-pointer"
                      />
                      <span>Active</span>
                    </label>

                    <button
                      onClick={() => setDeletingKey(wallet.key)}
                      className="p-1.5 rounded-lg text-[#848E9C] hover:text-[#F6465D] hover:bg-[#F6465D]/10 transition-all border border-transparent hover:border-[#F6465D]/30"
                      title="Delete this receiving wallet configuration"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                                ✎ Custom Network Label...
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
                        onChange={(e) => handleChange(wallet.key, 'asset', e.target.value.toUpperCase())}
                        className="w-full glass-input text-xs font-mono py-2 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border-[#363D47]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#848E9C] mb-1">
                      Routing Tag / Memo (Optional)
                    </label>
                    <input
                      type="text"
                      value={current.memo || ''}
                      onChange={(e) => handleChange(wallet.key, 'memo', e.target.value)}
                      placeholder="e.g. 1004829 (leave empty if not applicable)"
                      className="w-full glass-input text-xs font-mono py-2 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border-[#363D47]"
                    />
                  </div>
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

      {/* Modal: Add New Receiving Wallet */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 sm:p-8 shadow-2xl shadow-black max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A] transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans text-lg font-bold text-[#EAECEF]">Add Receiving Deposit Wallet</h3>
                <p className="text-xs text-[#848E9C] font-mono">Deploy a new cryptocurrency receiving endpoint</p>
              </div>
            </div>

            {addModalError && (
              <div className="mb-5 p-3 rounded-xl bg-[#F6465D]/15 border border-[#F6465D]/30 text-[#F6465D] text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addModalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateWallet} className="space-y-4">
              {/* Asset Selector */}
              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
                  1. Select or Enter Asset Symbol
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 mb-2">
                  {PRESET_ASSETS.map((asset) => (
                    <button
                      key={asset}
                      type="button"
                      onClick={() => handleAssetSelect(asset)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                        newAsset === asset
                          ? 'bg-[#F0B90B]/20 border-[#F0B90B] text-[#F0B90B]'
                          : 'bg-[#2B313A] border-[#363D47] text-[#848E9C] hover:text-[#EAECEF]'
                      }`}
                    >
                      {asset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAssetSelect('__CUSTOM__')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all border col-span-2 sm:col-span-1 ${
                      newAsset === '__CUSTOM__'
                        ? 'bg-[#F0B90B]/20 border-[#F0B90B] text-[#F0B90B]'
                        : 'bg-[#2B313A] border-[#363D47] text-[#848E9C] hover:text-[#EAECEF]'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {newAsset === '__CUSTOM__' && (
                  <input
                    type="text"
                    required
                    value={newCustomAsset}
                    onChange={(e) => setNewCustomAsset(e.target.value.toUpperCase())}
                    placeholder="Enter asset ticker symbol (e.g. MATIC, AVAX, KAS)..."
                    className="w-full glass-input text-xs font-mono py-2 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border border-[#F0B90B]/40"
                  />
                )}
              </div>

              {/* Network Selector */}
              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
                  2. Select Receiving Network
                </label>
                {(() => {
                  const presets = NETWORK_PRESETS[newAsset] || COMMON_NETWORKS;
                  return (
                    <div className="space-y-1.5">
                      <select
                        value={newNetwork}
                        onChange={(e) => setNewNetwork(e.target.value)}
                        className="w-full glass-input text-xs font-mono py-2.5 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border border-[#363D47] focus:border-[#F0B90B] outline-none cursor-pointer"
                      >
                        {newAsset !== '__CUSTOM__' && presets.length > 0 && (
                          <optgroup label={`Recommended for ${newAsset}`}>
                            {presets.map((net) => (
                              <option key={net} value={net} className="bg-[#1E2329] text-[#EAECEF]">
                                {net}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="Standard Blockchain Networks">
                          {COMMON_NETWORKS.filter((n) => !presets.includes(n)).map((net) => (
                            <option key={net} value={net} className="bg-[#1E2329] text-[#848E9C]">
                              {net}
                            </option>
                          ))}
                        </optgroup>
                        <option value="__CUSTOM__" className="bg-[#1E2329] text-[#F0B90B] font-bold">
                          ✎ Custom Network Name...
                        </option>
                      </select>

                      {newNetwork === '__CUSTOM__' && (
                        <input
                          type="text"
                          required
                          value={newCustomNetwork}
                          onChange={(e) => setNewCustomNetwork(e.target.value)}
                          placeholder="Type exact network name (e.g. Kaspa Mainnet)..."
                          className="w-full glass-input text-xs font-mono py-2 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border border-[#F0B90B]/40"
                        />
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Receiving Address */}
              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
                  3. Receiving Blockchain Address (Public) *
                </label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Paste destination public deposit address..."
                  className="w-full glass-input text-xs font-mono py-2.5 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border border-[#363D47] focus:border-[#F0B90B]"
                />
              </div>

              {/* Memo / Tag */}
              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
                  4. Destination Tag / Memo / Note (Optional)
                </label>
                <input
                  type="text"
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  placeholder="e.g. 1004829 (Required for XRP, TON, Stellar, BEP-2)"
                  className="w-full glass-input text-xs font-mono py-2.5 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border border-[#363D47]"
                />
                <span className="text-[10px] text-[#848E9C] font-mono mt-1 block">
                  Leave blank if network does not require a destination tag or memo.
                </span>
              </div>

              {/* Advanced: Unique Identifier Key */}
              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
                  5. Internal Identifier Key (Optional)
                </label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                  placeholder="e.g. USDT_SOL, XRP_NATIVE (leave blank to auto-generate)"
                  className="w-full glass-input text-xs font-mono py-2 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border border-[#363D47]"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#2B313A]/50 border border-[#363D47]">
                <div>
                  <div className="text-xs font-bold text-[#EAECEF]">Make Active Immediately</div>
                  <div className="text-[10px] font-mono text-[#848E9C]">Will appear instantly in client deposit terminal</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsActive}
                    onChange={(e) => setNewIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#2B313A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0ECB81]"></div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#2B313A]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-[#848E9C] hover:text-[#EAECEF] text-xs font-mono transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="btn-binance px-6 py-2.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmittingNew ? 'Saving Wallet...' : 'Save & Publish Wallet ↗'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Wallet */}
      {deletingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-[#1E2329] border border-[#F6465D]/40 p-6 shadow-2xl shadow-black">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F6465D]/15 border border-[#F6465D]/30 flex items-center justify-center text-[#F6465D]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans text-base font-bold text-[#EAECEF]">Confirm Wallet Removal</h3>
                <p className="text-xs font-mono text-[#F6465D]">Treasury Deletion Protocol</p>
              </div>
            </div>

            <p className="text-xs text-[#848E9C] font-mono leading-relaxed mb-5">
              Are you sure you want to permanently remove deposit wallet key <span className="text-[#EAECEF] font-bold">"{deletingKey}"</span>? Investors will no longer be able to send funds to this destination.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingKey(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-[#848E9C] text-xs font-mono transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteWallet}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-[#F6465D] hover:bg-[#F6465D]/80 text-white text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-md shadow-[#F6465D]/20 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
