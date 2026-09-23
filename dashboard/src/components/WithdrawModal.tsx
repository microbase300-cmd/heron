import React, { useState } from 'react';
import { X, ArrowUpRight, Check, AlertCircle, KeyRound, Clock, ArrowLeft, Send, CheckCircle2, XCircle, History, PlusCircle, Copy } from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { Transaction } from '../types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onWithdrawSuccess: () => void;
  transactions?: Transaction[];
  preferredCurrency?: string;
  rates?: Record<string, number>;
}

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
  const [asset, setAsset] = useState('USDT (TRC-20)');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState<number>(1000);
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  const withdrawTxs = transactions.filter(t => t.type === 'withdrawal');
  const pendingWithdrawCount = withdrawTxs.filter(t => t.status === 'pending').length;

  if (!isOpen) return null;

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
      const res = await api.withdraw(amount, asset, address.trim(), otpCode.trim());
      setSuccess(res.message);
      setTimeout(() => {
        onWithdrawSuccess();
        onClose();
        setStep('details');
        setOtpCode('');
        setSuccess(null);
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Withdrawal authorization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 sm:p-8 shadow-2xl shadow-black">
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
                : step === 'details' ? 'Two-factor authorized cryptographic withdrawal' : 'Step 2: 2FA Security Authorization'}
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
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
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
                          <span className="text-xs font-mono text-[#848E9C] font-normal">{t.asset}</span>
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

                      {t.note && (
                        <div className="text-[11px] text-[#848E9C] truncate">
                          {t.note}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-[#848E9C] pt-1.5 border-t border-[#2B313A]/60">
                        <span>{new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {t.txHash && (
                          <div className="flex items-center gap-1">
                            <span className="text-[#EAECEF] font-mono">{t.txHash.slice(0, 8)}...{t.txHash.slice(-6)}</span>
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
            <div>
              <div className="flex justify-between text-xs font-mono text-[#848E9C] mb-1.5">
                <span>Withdrawal Asset</span>
                <span className="text-[#EAECEF]">
                  Available: {formatCurrency(availableBalance, preferredCurrency, rates)}
                  {preferredCurrency !== 'USD' && ` (≈ $${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD)`}
                </span>
              </div>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#181A20] border border-[#2B313A] text-[#EAECEF] text-xs font-semibold focus:border-[#F0B90B] focus:outline-none"
              >
                <option value="USDT (TRC-20)">Tether (USDT TRC-20)</option>
                <option value="USDT (ERC-20)">Tether (USDT ERC-20)</option>
                <option value="BTC">Bitcoin (BTC Native)</option>
                <option value="ETH">Ethereum (ETH Mainnet)</option>
                <option value="SOL">Solana (SOL SPL)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-[#848E9C] mb-1.5">
                <span>Amount ($ USD)</span>
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

            <div>
              <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
                Destination Cryptographic Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. TX9d8b7a6c5d4e3f..."
                className="w-full p-3 rounded-lg bg-[#181A20] border border-[#2B313A] text-[#EAECEF] font-mono text-xs focus:border-[#F0B90B] focus:outline-none"
                required
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A] text-xs font-mono space-y-1.5 text-[#848E9C]">
              <div className="flex justify-between">
                <span>Settlement Fee:</span>
                <span className="text-[#0ECB81] font-bold">0.00% ($0.00)</span>
              </div>
              <div className="flex justify-between">
                <span>Network Gas:</span>
                <span className="text-[#EAECEF]">Subsidized by Protocol</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#2B313A] text-[#EAECEF] font-bold">
                <span>Net Disbursement:</span>
                <span className="text-[#F0B90B] font-sans font-bold text-base">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || amount <= 0 || amount > availableBalance}
              className="w-full py-3.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F0B90B]/15 disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95"
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
                <span className="font-bold text-[#F0B90B] font-sans">${amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#848E9C] truncate">
                <span>Destination:</span>
                <span className="text-[#EAECEF]">{address.slice(0, 8)}...{address.slice(-6)}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] text-[11px] font-mono leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>📩 Check Inbox & Spam Folder</span>
              </div>
              <p className="text-[#848E9C]">Verification code sent to your registered email. If you don't see it in a few seconds, please check your <strong>Spam / Junk</strong> folder.</p>
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
                className="w-2/3 py-3 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F0B90B]/15 flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
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
