import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { User, PlanConfig, Investment, WalletSummary, Transaction, ReferralData } from './types';
import { TickerBar } from './components/TickerBar';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewView } from './components/OverviewView';
import { MandatesView } from './components/MandatesView';
import { NewInvestmentView } from './components/NewInvestmentView';
import { ReferralsView } from './components/ReferralsView';
import { LedgerView } from './components/LedgerView';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { AuthModal } from './components/AuthModal';
import { LayoutDashboard, Timer, TrendingUp, ArrowDownLeft, Menu } from 'lucide-react';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('overview');
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        // Load plans
        const pRes = await api.getPlans();
        setPlans(pRes.plans);

        // Check if existing token
        const meRes = await api.getMe();
        setUser(meRes.user);
      } catch {
        // If not logged in, prompt auth modal
        setIsAuthOpen(true);
      }
    };
    init();
  }, []);

  // Fetch dashboard data when user logs in or updates
  const refreshData = async () => {
    if (!user) return;
    try {
      const [sum, invs, txs, refs, me] = await Promise.all([
        api.getWalletSummary(),
        api.getMyInvestments(),
        api.getTransactions(),
        api.getReferralData(),
        api.getMe()
      ]);
      setSummary(sum);
      setInvestments(invs.investments);
      setTransactions(txs.transactions);
      setReferralData(refs);
      setUser(me.user);
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
      const interval = setInterval(refreshData, 10000); // 10s live sync
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    api.removeToken();
    setUser(null);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setIsAuthOpen(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#060807] text-[#f3f0e8] overflow-hidden">
      {/* Top Binance Live Ticker Tape */}
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
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <Navbar
            currentTab={currentTab}
            user={user}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenInvest={() => setCurrentTab('invest')}
            onOpenMobileNav={() => setIsMobileSidebarOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-24 md:pb-10 no-scrollbar">
            <div className="max-w-7xl mx-auto">
              {currentTab === 'overview' && (
                <OverviewView
                  summary={summary}
                  investments={investments}
                  user={user}
                  onNavigate={setCurrentTab}
                  onOpenDeposit={() => setIsDepositOpen(true)}
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
                  <h3 className="text-xl font-serif font-bold text-white">Multi-Asset Deposit Hub</h3>
                  <p className="text-xs text-white/50">Deposit BTC, ETH, USDT (TRC-20/ERC-20), or SOL to fund your account.</p>
                  <button
                    onClick={() => setIsDepositOpen(true)}
                    className="px-6 py-3 rounded-xl bg-gold hover:bg-gold-light text-[#0b0d0d] font-bold text-xs tracking-wider transition-all"
                  >
                    Open Deposit Modal ↗
                  </button>
                </div>
              )}

              {currentTab === 'withdraw' && (
                <div className="p-6 sm:p-8 rounded-2xl glass-card text-center space-y-4 max-w-md mx-auto my-6 sm:my-12">
                  <h3 className="text-xl font-serif font-bold text-white">Automated Withdrawal Terminal</h3>
                  <p className="text-xs text-white/50">Request instantaneous automated disbursement to your personal cold or hot wallet.</p>
                  <button
                    onClick={() => setIsWithdrawOpen(true)}
                    className="px-6 py-3 rounded-xl bg-gold hover:bg-gold-light text-[#0b0d0d] font-bold text-xs tracking-wider transition-all"
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
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#080b09]/95 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-around px-2 z-40">
        <button
          onClick={() => setCurrentTab('overview')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'overview' ? 'text-gold' : 'text-white/50 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] font-medium tracking-tight">Overview</span>
        </button>

        <button
          onClick={() => setCurrentTab('mandates')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'mandates' ? 'text-gold' : 'text-white/50 hover:text-white'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span className="text-[10px] font-medium tracking-tight">Mandates</span>
        </button>

        <button
          onClick={() => setCurrentTab('invest')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'invest' ? 'text-gold' : 'text-white/50 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[10px] font-medium tracking-tight">Invest</span>
        </button>

        <button
          onClick={() => setIsDepositOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl text-white/50 hover:text-white transition-all"
        >
          <ArrowDownLeft className="w-4 h-4 text-gold" />
          <span className="text-[10px] font-medium tracking-tight">Deposit</span>
        </button>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl text-white/50 hover:text-white transition-all"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px] font-medium tracking-tight">Menu</span>
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
      />

      <AuthModal
        isOpen={isAuthOpen}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;
