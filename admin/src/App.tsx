import { useState, useEffect, useCallback } from 'react';
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

  const [refreshing, setRefreshing] = useState<boolean>(false);

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
      ] = await Promise.allSettled([
        adminApi.getMetrics(),
        adminApi.getUsers(),
        adminApi.getTransactions(),
        adminApi.getInvestments(),
        adminApi.getPlans(),
        adminApi.getMarketTickers(),
      ]);

      if (metricsData.status === 'fulfilled') setMetrics(metricsData.value);
      if (usersData.status === 'fulfilled') setUsers(usersData.value);
      if (txsData.status === 'fulfilled') setTransactions(txsData.value);
      if (investmentsData.status === 'fulfilled') setInvestments(investmentsData.value);
      if (plansData.status === 'fulfilled') setPlans(plansData.value);
      if (tickersData.status === 'fulfilled') setTickers(tickersData.value);
    } catch (err) {
      console.warn('Data sync notice:', err);
    } finally {
      setRefreshing(false);
    }
  }, [currentUser]);

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
      const interval = setInterval(fetchAllData, 15000); // 15s auto-refresh
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
