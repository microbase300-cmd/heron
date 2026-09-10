import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from './services/api';
import { User, PlanConfig, Investment, WalletSummary, Transaction, ReferralData, DEFAULT_PLANS } from './types';
import { TickerBar } from './components/TickerBar';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewView } from './components/OverviewView';
import { MandatesView } from './components/MandatesView';
import { NewInvestmentView } from './components/NewInvestmentView';
import { ReferralsView } from './components/ReferralsView';
import { LedgerView } from './components/LedgerView';
import { ProfileView } from './components/ProfileView';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { AuthModal } from './components/AuthModal';
import { LayoutDashboard, Timer, TrendingUp, ArrowDownLeft, Menu } from 'lucide-react';
import { ExchangeRatesData, DEFAULT_EXCHANGE_RATES } from './utils/currency';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('overview');
  const [plans, setPlans] = useState<PlanConfig[]>(DEFAULT_PLANS);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRatesData>(DEFAULT_EXCHANGE_RATES);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        // Load plans & live forex rates
        const [pRes, ratesRes] = await Promise.all([
          api.getPlans(),
          api.getExchangeRates()
        ]);
        if (pRes?.plans && pRes.plans.length > 0) {
          setPlans(pRes.plans);
        }
        if (ratesRes) {
          setExchangeRates(ratesRes);
        }

        // Check if existing token
        const meRes = await api.getMe();
        setUser(meRes.user);
      } catch {
        // If not logged in, prompt auth modal
        setIsAuthOpen(true);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    init();
  }, []);

  const userRef = useRef<User | null>(user);
  userRef.current = user;

  // Fetch dashboard data when user logs in or updates
  const refreshData = useCallback(async () => {
    if (!userRef.current) return;
    try {
      const [sum, invs, txs, refs, me, pRes, ratesRes] = await Promise.all([
        api.getWalletSummary(),
        api.getMyInvestments(),
        api.getTransactions(),
        api.getReferralData(),
        api.getMe(),
        api.getPlans(),
        api.getExchangeRates()
      ]);
      setSummary(sum);
      setInvestments(invs.investments);
      setTransactions(txs.transactions);
      setReferralData(refs);
      // Only update user reference if properties changed to prevent infinite render loops
      setUser((prev) => {
        if (!prev) return me.user;
        if (
          prev.id === me.user.id &&
          prev.balance === me.user.balance &&
          prev.kycStatus === me.user.kycStatus &&
          prev.name === me.user.name &&
          prev.forceReverification === me.user.forceReverification
        ) {
          return prev;
        }
        return me.user;
      });
      if (pRes?.plans && pRes.plans.length > 0) {
        setPlans(pRes.plans);
      }
      if (ratesRes) {
        setExchangeRates(ratesRes);
      }
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      refreshData();
      const interval = setInterval(refreshData, 12000); // 12s live sync
      return () => clearInterval(interval);
    }
  }, [user?.id, refreshData]);

  const handleLogout = () => {
    api.removeToken();
    setUser(null);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setIsAuthOpen(false);
  };

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#181A20] text-[#EAECEF]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#F0B90B] border-t-transparent animate-spin" />
          <div className="font-mono text-xs text-[#848E9C] tracking-wider uppercase animate-pulse">
            Establishing Institutional Security Session...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#181A20] text-[#EAECEF] overflow-hidden">
      {/* Top Institutional Live Ticker Tape */}
      <TickerBar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Responsive Sidebar Navigation (Desktop + Mobile Drawer) */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          user={user}
          onLogout={handleLogout}
          onOpenDeposit={() => setIsDepositOpen(true)}
          isMobileOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          preferredCurrency={user?.preferredCurrency || 'USD'}
          rates={exchangeRates.rates}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <Navbar
            currentTab={currentTab}
            user={user}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenInvest={() => setCurrentTab('invest')}
            onOpenProfile={() => setCurrentTab('profile')}
            onOpenMobileNav={() => setIsMobileSidebarOpen(true)}
            preferredCurrency={user?.preferredCurrency || 'USD'}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-24 md:pb-10 no-scrollbar">
            <div className="max-w-7xl mx-auto">
              {currentTab === 'overview' && (
                <OverviewView
                  summary={summary}
                  investments={investments}
                  transactions={transactions}
                  user={user}
                  onNavigate={setCurrentTab}
                  onOpenDeposit={() => setIsDepositOpen(true)}
                  preferredCurrency={user?.preferredCurrency || 'USD'}
                  exchangeRates={exchangeRates}
                />
              )}

              {currentTab === 'mandates' && (
                <MandatesView
                  investments={investments}
                  onRefresh={refreshData}
                  onOpenInvest={() => setCurrentTab('invest')}
                />
              )}

              {currentTab === 'invest' && (
                <NewInvestmentView
                  plans={plans}
                  user={user}
                  onSuccess={() => {
                    refreshData();
                    setCurrentTab('mandates');
                  }}
                  onOpenDeposit={() => setIsDepositOpen(true)}
                />
              )}

              {currentTab === 'deposit' && (
                <div className="p-6 sm:p-8 rounded-2xl glass-card text-center space-y-4 max-w-md mx-auto my-6 sm:my-12">
                  <h3 className="text-xl font-sans font-bold text-[#EAECEF] tracking-tight">Multi-Asset Deposit Hub</h3>
                  <p className="text-xs text-[#848E9C]">Deposit BTC, ETH, USDT (TRC-20/ERC-20), or SOL to fund your account.</p>
                  <button
                    onClick={() => setIsDepositOpen(true)}
                    className="px-6 py-3 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs tracking-wider transition-all shadow-md shadow-[#F0B90B]/10 active:scale-95"
                  >
                    Open Deposit Modal ↗
                  </button>
                </div>
              )}

              {currentTab === 'withdraw' && (
                <div className="p-6 sm:p-8 rounded-2xl glass-card text-center space-y-4 max-w-md mx-auto my-6 sm:my-12">
                  <h3 className="text-xl font-sans font-bold text-[#EAECEF] tracking-tight">Automated Withdrawal Terminal</h3>
                  <p className="text-xs text-[#848E9C]">Request instantaneous automated disbursement to your personal cold or hot wallet.</p>
                  <button
                    onClick={() => setIsWithdrawOpen(true)}
                    className="px-6 py-3 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs tracking-wider transition-all shadow-md shadow-[#F0B90B]/10 active:scale-95"
                  >
                    Open Withdrawal Terminal ↗
                  </button>
                </div>
              )}

              {currentTab === 'referrals' && (
                <ReferralsView data={referralData} />
              )}

              {currentTab === 'ledger' && (
                <LedgerView transactions={transactions} />
              )}

              {currentTab === 'profile' && (
                <ProfileView
                  user={user}
                  onUpdateUser={setUser}
                  onNavigate={setCurrentTab}
                  onOpenWithdraw={(_addr) => {
                    setIsWithdrawOpen(true);
                  }}
                  exchangeRates={exchangeRates}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#181A20]/98 backdrop-blur-xl border-t border-[#2B313A] flex items-center justify-around px-2 z-40">
        <button
          onClick={() => setCurrentTab('overview')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg transition-all ${
            currentTab === 'overview' ? 'text-[#F0B90B] font-semibold' : 'text-[#848E9C] hover:text-[#EAECEF]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">Overview</span>
        </button>

        <button
          onClick={() => setCurrentTab('mandates')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg transition-all ${
            currentTab === 'mandates' ? 'text-[#F0B90B] font-semibold' : 'text-[#848E9C] hover:text-[#EAECEF]'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">Investments</span>
        </button>

        <button
          onClick={() => setCurrentTab('invest')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg transition-all ${
            currentTab === 'invest' ? 'text-[#F0B90B] font-semibold' : 'text-[#848E9C] hover:text-[#EAECEF]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">Invest</span>
        </button>

        <button
          onClick={() => setIsDepositOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg text-[#848E9C] hover:text-[#EAECEF] transition-all"
        >
          <ArrowDownLeft className="w-4 h-4 text-[#F0B90B]" />
          <span className="text-[10px] tracking-tight">Deposit</span>
        </button>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg text-[#848E9C] hover:text-[#EAECEF] transition-all"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">Menu</span>
        </button>
      </nav>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDepositSuccess={refreshData}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        availableBalance={user?.balance ?? 0}
        onWithdrawSuccess={refreshData}
        preferredCurrency={user?.preferredCurrency || 'USD'}
        rates={exchangeRates.rates}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;
