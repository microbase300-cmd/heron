import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminUser, AdminMetrics, Transaction, Investment, PlanConfig, MarketTicker } from './types';
import { adminApi } from './services/api';
import { AdminLogin } from './components/AdminLogin';
import { AdminNavbar } from './components/AdminNavbar';
import { AdminSidebar, AdminTab } from './components/AdminSidebar';
import { ExecutiveMetricsView } from './components/ExecutiveMetricsView';
import { InvestorPortfoliosView } from './components/InvestorPortfoliosView';
import { UserManagementView } from './components/UserManagementView';
import { TransactionDeskView } from './components/TransactionDeskView';
import { EscrowMandatesView } from './components/EscrowMandatesView';
import { PlanConfigView } from './components/PlanConfigView';
import { DepositWalletsView } from './components/DepositWalletsView';
import { NotificationsDeskView } from './components/NotificationsDeskView';
import { KycComplianceDeskView } from './components/KycComplianceDeskView';
import { LiveSupportDeskView } from './components/LiveSupportDeskView';

export function App() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => adminApi.getStoredUser());
  const [currentTab, setCurrentTab] = useState<AdminTab>('metrics');
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(null);

  // Platform Operational Data State
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [pendingKycCount, setPendingKycCount] = useState<number>(0);
  const [waitingSupportCount, setWaitingSupportCount] = useState<number>(0);

  const prevWaitingSupportRef = useRef<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Synthesized Web Audio API Chime for Admin Live Alert
  const playAlertSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }, []);

  const fetchAllData = useCallback(async () => {
    if (!currentUser) return;
    setRefreshing(true);
    try {
      const [
        metricsData,
        usersData,
        txsData,
        investmentsData,
        plansData,
        tickersData,
        kycData,
        supportData,
      ] = await Promise.allSettled([
        adminApi.getMetrics(),
        adminApi.getUsers(),
        adminApi.getTransactions(),
        adminApi.getInvestments(),
        adminApi.getPlans(),
        adminApi.getMarketTickers(),
        adminApi.getKycSubmissions('pending'),
        adminApi.getSupportChats(),
      ]);

      if (metricsData.status === 'fulfilled') setMetrics(metricsData.value);
      if (usersData.status === 'fulfilled') setUsers(usersData.value);
      if (txsData.status === 'fulfilled') setTransactions(txsData.value);
      if (investmentsData.status === 'fulfilled') setInvestments(investmentsData.value);
      if (plansData.status === 'fulfilled') setPlans(plansData.value);
      if (tickersData.status === 'fulfilled') setTickers(tickersData.value);
      if (kycData.status === 'fulfilled') setPendingKycCount(kycData.value.pendingCount || kycData.value.submissions?.length || 0);

      if (supportData.status === 'fulfilled') {
        const count = supportData.value.metrics?.waitingCount ?? 0;
        // Trigger alert if a new live chat was initiated!
        if (count > prevWaitingSupportRef.current) {
          playAlertSound();
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('🚨 New Live Support Request', {
              body: 'An investor is waiting for a representative on Heron Assets Trustee!',
              icon: '/heron_logo.jpg'
            });
          }
        }
        prevWaitingSupportRef.current = count;
        setWaitingSupportCount(count);
      }
    } catch (err) {
      console.warn('Data sync notice:', err);
    } finally {
      setRefreshing(false);
    }
  }, [currentUser, playAlertSound]);

  useEffect(() => {
    const handleAuthError = () => {
      setCurrentUser(null);
    };
    window.addEventListener('admin_auth_error', handleAuthError);
    return () => window.removeEventListener('admin_auth_error', handleAuthError);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 10000); // 10s auto-refresh for live alerts
      return () => clearInterval(interval);
    }
  }, [currentUser, fetchAllData]);

  const handleLogout = () => {
    adminApi.clearToken();
    setCurrentUser(null);
  };

  const pendingCount = transactions.filter((t) => t.status === 'pending').length;

  if (!currentUser) {
    return <AdminLogin onSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-[#181A20] text-[#EAECEF] flex flex-col font-sans selection:bg-[#F0B90B] selection:text-[#181A20]">
      <AdminNavbar
        user={currentUser}
        onLogout={handleLogout}
        onRefresh={fetchAllData}
        refreshing={refreshing}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <AdminSidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          pendingCount={pendingCount}
          pendingKycCount={pendingKycCount}
          waitingSupportCount={waitingSupportCount}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'metrics' && (
              <ExecutiveMetricsView
                metrics={metrics}
                tickers={tickers}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'investor_portfolios' && (
              <InvestorPortfoliosView
                users={users}
                investments={investments}
                initialSelectedUserId={selectedInvestorId}
                onRefreshData={fetchAllData}
              />
            )}

            {currentTab === 'users' && (
              <UserManagementView
                users={users}
                onRefreshUsers={fetchAllData}
                onSelectInvestor={(userId) => {
                  setSelectedInvestorId(userId);
                  setCurrentTab('investor_portfolios');
                }}
              />
            )}

            {currentTab === 'transactions' && (
              <TransactionDeskView
                transactions={transactions}
                onRefreshTransactions={fetchAllData}
              />
            )}

            {currentTab === 'kyc' && (
              <KycComplianceDeskView
                onRefresh={fetchAllData}
              />
            )}

            {currentTab === 'live_support' && (
              <LiveSupportDeskView
                onRefreshStats={fetchAllData}
                playNotificationSound={playAlertSound}
              />
            )}

            {currentTab === 'wallets' && (
              <DepositWalletsView />
            )}

            {currentTab === 'notifications' && (
              <NotificationsDeskView
                users={users}
              />
            )}

            {currentTab === 'investments' && (
              <EscrowMandatesView
                investments={investments}
                onRefreshInvestments={fetchAllData}
                onSelectInvestor={(userId) => {
                  setSelectedInvestorId(userId);
                  setCurrentTab('investor_portfolios');
                }}
              />
            )}

            {currentTab === 'plans' && (
              <PlanConfigView
                plans={plans}
                onRefreshPlans={fetchAllData}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;