import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, Check, AlertCircle, KeyRound, Clock, ArrowLeft, Send, CheckCircle2, XCircle, History, PlusCircle, Copy, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { Transaction, DepositAddressConfig } from '../types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onWithdrawSuccess: () => void;
  transactions?: Transaction[];
  preferredCurrency?: string;
  rates?: Record<string, number>;
}

// Preset standard blockchain networks matching deposit terminal
const STANDARD_ASSET_NETWORKS: Record<string, { name: string; networks: string[] }> = {
  USDT: {
    name: 'Tether (USDT)',
    networks: [
      'Tron (TRC-20)',
      'Ethereum (ERC-20)',
      'Solana SPL',
      'BNB Smart Chain (BEP-20)',
      'Polygon (PoS)',
      'Arbitrum One (L2)',
      'Base (Coinbase L2)',
      'Optimism (OP Mainnet)',
      'TON (The Open Network)',
      'Avalanche C-Chain'
    ]
  },
  USDC: {
    name: 'USD Coin (USDC)',
    networks: [
      'Ethereum (ERC-20)',
      'Solana SPL',
      'Polygon (PoS)',
      'Arbitrum One (L2)',
      'Base (Coinbase L2)',
      'Tron (TRC-20)',
      'BNB Smart Chain (BEP-20)',
      'Avalanche C-Chain'
    ]
  },
  BTC: {
    name: 'Bitcoin (BTC)',
    networks: [
      'Bitcoin Native SegWit',
      'Bitcoin Legacy (Mainnet)',
      'Bitcoin Taproot (P2TR)',
      'Lightning Network',
      'BNB Smart Chain (BEP-20)'
    ]
  },
  ETH: {
    name: 'Ethereum (ETH)',
    networks: [
      'Ethereum Mainnet',
      'Arbitrum One (L2)',
      'Base (Coinbase L2)',
      'Optimism (OP Mainnet)',
      'Polygon (PoS)',
      'BNB Smart Chain (BEP-20)'
    ]
  },
  SOL: {
    name: 'Solana (SOL)',
    networks: [
      'Solana SPL',
      'Solana Native'
    ]
  },
  BNB: {
    name: 'Binance Coin (BNB)',
    networks: [
      'BNB Smart Chain (BEP-20)',
      'BNB Beacon Chain (BEP-2)'
    ]
  },
  XRP: {
    name: 'Ripple (XRP)',
    networks: [
      'XRP Ripple Ledger (Native)'
    ]
  },
  DOGE: {
    name: 'Dogecoin (DOGE)',
    networks: [
      'Dogecoin Mainnet'
    ]
  },
  ADA: {
    name: 'Cardano (ADA)',
    networks: [
      'Cardano Mainnet'
    ]
  },
  LTC: {
    name: 'Litecoin (LTC)',
    networks: [
      'Litecoin Mainnet'
    ]
  }
};

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  onWithdrawSuccess,
  transactions = [],
  preferredCurrency = 'USD',
  rates
}) => {
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');
  const [step, setStep] = useState<'details' | 'otp'>('details');

  // Asset & Network selection state
  const [selectedAsset, setSelectedAsset] = useState<string>('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('Tron (TRC-20)');
  const [customNetwork, setCustomNetwork] = useState<string>('');

  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [amount, setAmount] = useState<number>(1000);
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  // Dynamic deposit wallets fetched from admin settings
  const [dynamicAddresses, setDynamicAddresses] = useState<Record<string, DepositAddressConfig>>({});

  useEffect(() => {
    if (isOpen) {
      api.getDepositAddresses()
        .then((res) => {
          if (res.addresses) setDynamicAddresses(res.addresses);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Merge configured custom assets from admin into available list
  const allAssetsMap = React.useMemo(() => {
    const map: Record<string, { name: string; networks: string[] }> = { ...STANDARD_ASSET_NETWORKS };

    Object.values(dynamicAddresses).forEach((w) => {
      if (!w || !w.asset) return;
      const assetKey = w.asset.toUpperCase();
      if (!map[assetKey]) {
        map[assetKey] = {
          name: `${assetKey}`,
          networks: [w.network]
        };
      } else {
        if (!map[assetKey].networks.includes(w.network)) {
          map[assetKey].networks = [w.network, ...map[assetKey].networks];
        }
      }
    });

    return map;
  }, [dynamicAddresses]);

  // When asset changes, update network to default for that asset
  const handleAssetChange = (assetKey: string) => {
    setSelectedAsset(assetKey);
    const assetObj = allAssetsMap[assetKey];
    if (assetObj && assetObj.networks.length > 0) {
      setSelectedNetwork(assetObj.networks[0]);
    } else {
      setSelectedNetwork('__CUSTOM__');
    }
  };

  const withdrawTxs = transactions.filter(t => t.type === 'withdrawal');
  const pendingWithdrawCount = withdrawTxs.filter(t => t.status === 'pending').length;

  if (!isOpen) return null;

  const effectiveNetwork = selectedNetwork === '__CUSTOM__' ? customNetwork.trim() : selectedNetwork;
  const fullAssetLabel = `${selectedAsset} (${effectiveNetwork || 'Standard'})`;

  // Detect if memo/tag is typically required (XRP, TON, BEP-2)
  const isMemoNetwork = selectedAsset === 'XRP' ||
    selectedNetwork.toLowerCase().includes('bep-2') ||
    selectedNetwork.toLowerCase().includes('ton') ||
    selectedNetwork.toLowerCase().includes('ripple');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }
    if (amount > availableBalance) {
      setError(`Insufficient balance. Available: $${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`);
      return;
    }
    if (!address || address.trim().length < 8) {
      setError('Please provide a valid destination cryptocurrency wallet address.');
      return;
    }
    if (selectedNetwork === '__CUSTOM__' && !customNetwork.trim()) {
      setError('Please enter the custom network name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.requestWithdrawalOtp();
      setDevOtp(res.devOtp || null);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch withdrawal authorization code.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit withdrawal verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.withdraw(amount, fullAssetLabel, address.trim(), otpCode.trim(), memo.trim() || undefined);
      setSuccess(res.message);
      setTimeout(() => {
        onWithdrawSuccess();
        onClose();
        setStep('details');
        setOtpCode('');
        setSuccess(null);
        setMemo('');
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Withdrawal authorization failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper placeholder based on selected asset/network
  const getAddressPlaceholder = () => {
    const netLower = selectedNetwork.toLowerCase();
    const assetLower = selectedAsset.toLowerCase();
    if (netLower.includes('trc') || netLower.includes('tron')) return 'T... (Tron TRC-20 Base58 address)';
    if (netLower.includes('erc') || netLower.includes('bep-20') || netLower.includes('polygon') || netLower.includes('arbitrum') || netLower.includes('base') || assetLower === 'eth') return '0x... (42-character EVM address)';
    if (netLower.includes('solana') || assetLower === 'sol') return 'Base58 Solana address (e.g. 7xKXtg...)';
    if (assetLower === 'btc') return 'bc1q... or 1... or 3... (Bitcoin address)';
    if (assetLower === 'xrp') return 'r... (XRP Ripple address)';
    return 'Enter destination wallet address...';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 sm:p-8 shadow-2xl shadow-black max-h-[92vh] overflow-y-auto">
        <button
          onClick={() => {
            onClose();
            setStep('details');
            setError(null);
          }}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans text-xl font-bold text-[#EAECEF] tracking-tight">Withdrawal Terminal</h3>
            <p className="text-xs text-[#848E9C] font-mono">
              {activeTab === 'history' 
                ? `Historical disbursement records (${withdrawTxs.length})` 
                : step === 'details' ? 'Multi-network cryptographic payout gateway' : 'Step 2: 2FA Security Authorization'}
            </p>
          </div>
        </div>

        {/* Tab Switcher: Request vs History */}
        <div className="flex rounded-lg bg-[#181A20] p-1 border border-[#2B313A] mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'withdraw'
                ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm'
                : 'text-[#848E9C] hover:text-[#EAECEF]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Request</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm'
                : 'text-[#848E9C] hover:text-[#EAECEF]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
            {pendingWithdrawCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'history' ? 'bg-[#181A20] text-[#F0B90B]' : 'bg-[#F0B90B] text-[#181A20]'
              }`}>
                {pendingWithdrawCount}
              </span>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#F6465D]/15 border border-[#F6465D]/30 text-[#F6465D] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#F6465D]" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-[#0ECB81]/15 border border-[#0ECB81]/30 text-[#0ECB81] text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0 text-[#0ECB81]" />
            <span>{success}</span>
          </div>
        )}

        {activeTab === 'history' ? (
          /* Withdrawal History Tab */
          <div className="space-y-3">
            {withdrawTxs.length > 0 ? (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                {withdrawTxs.map((t) => {
                  const isPending = t.status === 'pending';
                  const isApproved = t.status === 'completed';
                  const isRejected = t.status === 'rejected';

                  return (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A] hover:border-[#F0B90B]/30 transition-all space-y-2 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-sans font-bold text-sm text-[#EAECEF]">
                          <span className="text-[#F6465D]">-${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          <span className="text-xs font-mono text-[#F0B90B] font-semibold">{t.asset}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                          isPending
                            ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30'
                            : isApproved
                            ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                            : 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30'
                        }`}>
                          {isPending && <Clock className="w-3 h-3 animate-pulse" />}
                          {isApproved && <CheckCircle2 className="w-3 h-3" />}
                          {isRejected && <XCircle className="w-3 h-3" />}
                          {t.status}
                        </span>
                      </div>

                      {t.destinationAddress && (
                        <div className="text-[11px] text-[#848E9C] flex items-center justify-between bg-[#1E2329] p-2 rounded-lg border border-[#2B313A]">
                          <span className="truncate pr-2 font-mono text-[#EAECEF]" title={t.destinationAddress}>
                            To: {t.destinationAddress}
                          </span>
                          {t.destinationMemo && (
                            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-[#F0B90B]/15 text-[#F0B90B] font-bold">
                              Memo: {t.destinationMemo}
                            </span>
                          )}
                        </div>
                      )}

                      {t.note && !t.destinationAddress && (
                        <div className="text-[11px] text-[#848E9C] truncate">
                          {t.note}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-[#848E9C] pt-1.5 border-t border-[#2B313A]/60">
                        <span>{new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {t.txHash && (
                          <div className="flex items-center gap-1">
                            <span className="text-[#0ECB81] font-mono font-bold" title={t.txHash}>
                              Tx: {t.txHash.slice(0, 10)}...{t.txHash.slice(-6)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(t.txHash);
                                setCopiedTxId(t.id);
                                setTimeout(() => setCopiedTxId(null), 1800);
                              }}
                              className="p-1 hover:text-[#F0B90B] text-[#848E9C]"
                              title="Copy Hash"
                            >
                              {copiedTxId === t.id ? <Check className="w-3 h-3 text-[#0ECB81]" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#181A20] border border-[#2B313A] flex items-center justify-center mx-auto text-[#848E9C]">
                  <History className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-[#EAECEF]">No Withdrawal Requests Yet</div>
                <p className="text-[11px] text-[#848E9C] max-w-xs mx-auto">
                  When you request a payout, your authorization status and on-chain dispatch proof will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('withdraw')}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-[#F0B90B] text-[#181A20] font-bold text-xs"
                >
                  Submit First Withdrawal ↗
                </button>
              </div>
            )}
          </div>
        ) : step === 'details' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            {/* Asset Selection */}
            <div>
              <div className="flex justify-between text-xs font-mono text-[#848E9C] mb-1.5">
                <span>1. Select Cryptographic Asset</span>
                <span className="text-[#EAECEF]">
                  Available: {formatCurrency(availableBalance, preferredCurrency, rates)}
                  {preferredCurrency !== 'USD' && ` (≈ $${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD)`}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-2">
                {Object.keys(allAssetsMap).slice(0, 10).map((assetKey) => (
                  <button
                    key={assetKey}
                    type="button"
                    onClick={() => handleAssetChange(assetKey)}
                    className={`py-2 px-1.5 rounded-lg text-xs font-mono font-bold transition-all border text-center ${
                      selectedAsset === assetKey
                        ? 'bg-[#F0B90B]/20 border-[#F0B90B] text-[#F0B90B] shadow-sm'
                        : 'bg-[#181A20] border-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#242A32]'
                    }`}
                  >
                    {assetKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Network Selection */}
            <div>
              <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
                2. Select Receiving Network for {selectedAsset}
              </label>
              <div className="space-y-2">
                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#181A20] border border-[#2B313A] text-[#EAECEF] text-xs font-mono focus:border-[#F0B90B] focus:outline-none cursor-pointer"
                >
                  {allAssetsMap[selectedAsset]?.networks.map((net) => (
                    <option key={net} value={net} className="bg-[#181A20] text-[#EAECEF]">
                      {selectedAsset} — {net}
                    </option>
                  ))}
                  <option value="__CUSTOM__" className="bg-[#181A20] text-[#F0B90B] font-bold">
                    ✎ Other / Custom Network...
                  </option>
                </select>

                {selectedNetwork === '__CUSTOM__' && (
                  <input
                    type="text"
                    required
                    value={customNetwork}
                    onChange={(e) => setCustomNetwork(e.target.value)}
                    placeholder="Type network name (e.g. Kaspa Mainnet, Polygon zkEVM)..."
                    className="w-full p-2.5 rounded-lg bg-[#181A20] border border-[#F0B90B]/50 text-[#EAECEF] text-xs font-mono focus:outline-none"
                  />
                )}
              </div>
            </div>

            {/* Amount */}
            <div>
              <div className="flex justify-between text-xs font-mono text-[#848E9C] mb-1.5">
                <span>3. Disbursement Amount ($ USD)</span>
                <div className="flex gap-1">
                  {[0.25, 0.5, 0.75, 1].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setAmount(Number((availableBalance * pct).toFixed(2)))}
                      className="px-2 py-0.5 rounded bg-[#2B313A] hover:bg-[#363D47] text-[10px] text-[#F0B90B] font-mono font-bold"
                    >
                      {pct * 100}%
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                value={amount === 0 ? '' : amount}
                onChange={(e) => {
                  const val = e.target.value;
                  setAmount(val === '' ? 0 : parseFloat(val));
                }}
                step={10}
                min={10}
                className="w-full p-3 rounded-lg bg-[#181A20] border border-[#2B313A] text-[#EAECEF] font-sans text-lg font-bold focus:border-[#F0B90B] focus:outline-none"
              />
            </div>

            {/* Destination Address */}
            <div>
              <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
                4. Destination {selectedAsset} Address ({effectiveNetwork || 'Address'}) *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={getAddressPlaceholder()}
                className="w-full p-3 rounded-lg bg-[#181A20] border border-[#2B313A] text-[#EAECEF] font-mono text-xs focus:border-[#F0B90B] focus:outline-none"
                required
              />
            </div>

            {/* Optional Memo / Routing Tag */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#848E9C] mb-1.5">
                <span>5. Destination Tag / Memo / Note (Optional)</span>
                {isMemoNetwork && (
                  <span className="text-[10px] bg-[#F0B90B]/20 text-[#F0B90B] px-1.5 py-0.2 rounded font-bold">
                    Required for Exchanges
                  </span>
                )}
              </div>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="e.g. 1004829 (leave empty if your private wallet doesn't require a tag)"
                className="w-full p-2.5 rounded-lg bg-[#181A20] border border-[#2B313A] text-[#EAECEF] font-mono text-xs focus:border-[#F0B90B] focus:outline-none"
              />
            </div>

            {/* Fee and Network Summary */}
            <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A] text-xs font-mono space-y-1.5 text-[#848E9C]">
              <div className="flex justify-between">
                <span>Selected Rail:</span>
                <span className="text-[#EAECEF] font-bold">{fullAssetLabel}</span>
              </div>
              <div className="flex justify-between">
                <span>Settlement Fee:</span>
                <span className="text-[#0ECB81] font-bold">0.00% ($0.00)</span>
              </div>
              <div className="flex justify-between">
                <span>Network Gas:</span>
                <span className="text-[#EAECEF]">Subsidized by Protocol</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#2B313A] text-[#EAECEF] font-bold">
                <span>Net Payout:</span>
                <span className="text-[#F0B90B] font-sans font-bold text-base">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || amount <= 0 || amount > availableBalance}
              className="w-full py-3.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F0B90B]/15 disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Requesting OTP...' : 'Authorize with Security OTP ↗'}</span>
            </button>
          </form>
        ) : (
          /* Step 2: Withdrawal Security OTP Confirmation */
          <form onSubmit={handleConfirmWithdrawal} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A] text-xs font-mono space-y-2">
              <div className="flex justify-between text-[#848E9C]">
                <span>Disbursement:</span>
                <span className="font-bold text-[#F0B90B] font-sans">${amount.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between text-[#848E9C]">
                <span>Asset Rail:</span>
                <span className="font-bold text-[#EAECEF]">{fullAssetLabel}</span>
              </div>
              <div className="flex justify-between text-[#848E9C] truncate">
                <span>Destination:</span>
                <span className="text-[#EAECEF]">{address.slice(0, 10)}...{address.slice(-6)}</span>
              </div>
              {memo && (
                <div className="flex justify-between text-[#848E9C]">
                  <span>Routing Memo:</span>
                  <span className="text-[#F0B90B] font-bold">{memo}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] text-[11px] font-mono leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Security OTP Code Sent</span>
              </div>
              <p className="text-[#848E9C]">
                Verification code dispatched to your registered email. If you don't see it within a few seconds, please check your <strong>Spam / Junk</strong> folder.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#848E9C] mb-1 text-center">
                Enter 6-Digit Withdrawal Authorization Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                required
                autoFocus
                className="w-full text-center text-xl font-mono font-bold tracking-widest py-3 rounded-lg bg-[#181A20] border border-[#2B313A] text-[#F0B90B] focus:border-[#F0B90B] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="w-1/3 py-3 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-[#EAECEF] text-xs font-mono transition-all flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-2/3 py-3 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F0B90B]/15 flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting...' : 'Confirm Withdrawal'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
