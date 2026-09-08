import React, { useState } from 'react';
import { X, ArrowUpRight, Check, AlertCircle, KeyRound, Clock, ArrowLeft, Send } from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onWithdrawSuccess: () => void;
  preferredCurrency?: string;
  rates?: Record<string, number>;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  onWithdrawSuccess,
  preferredCurrency = 'USD',
  rates
}) => {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [asset, setAsset] = useState('USDT (TRC-20)');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState<number>(1000);
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans text-xl font-bold text-[#EAECEF] tracking-tight">Disburse Liquidity</h3>
            <p className="text-xs text-[#848E9C] font-mono">
              {step === 'details' ? 'Two-factor authorized cryptographic withdrawal' : 'Step 2: 2FA Security Authorization'}
            </p>
          </div>
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

        {step === 'details' ? (
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
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
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

              {devOtp && (
                <div className="mt-2 pt-2 border-t border-[#2B313A] text-center">
                  <span className="px-3 py-1 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] text-xs font-mono font-bold">
                    Security Code: <strong>{devOtp}</strong>
                  </span>
                </div>
              )}
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
