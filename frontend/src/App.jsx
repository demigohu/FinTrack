import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Sidebar from './components/Sidebar.jsx';
import BottomNav from './components/BottomNav.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';
import WalletsPage from './pages/WalletsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import AIAdvisorPage from './pages/AIAdvisorPage.jsx';
import BudgetPage from './pages/BudgetPage.jsx';
import GoalsPage from './pages/GoalsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import HelpPage from './pages/HelpPage.jsx';

function App() {
  const { isLoggedIn } = useContext(AuthContext);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        {/* Sidebar untuk desktop */}
        {!isLoginPage && <Sidebar />}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 p-2 sm:p-6">
            <Routes>
              <Route path="/login" element={
                isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage />
              } />
              <Route path="/dashboard" element={
                isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />
              } />
              <Route path="/transactions" element={
                isLoggedIn ? <TransactionsPage /> : <Navigate to="/login" />
              } />
              <Route path="/portfolio" element={
                isLoggedIn ? <PortfolioPage /> : <Navigate to="/login" />
              } />
              <Route path="/wallets" element={
                isLoggedIn ? <WalletsPage /> : <Navigate to="/login" />
              } />
              <Route path="/analytics" element={
                isLoggedIn ? <AnalyticsPage /> : <Navigate to="/login" />
              } />
              <Route path="/ai-advisor" element={
                isLoggedIn ? <AIAdvisorPage /> : <Navigate to="/login" />
              } />
              <Route path="/budget" element={
                isLoggedIn ? <BudgetPage /> : <Navigate to="/login" />
              } />
              <Route path="/goals" element={
                isLoggedIn ? <GoalsPage /> : <Navigate to="/login" />
              } />
              <Route path="/notifications" element={
                isLoggedIn ? <NotificationsPage /> : <Navigate to="/login" />
              } />
              <Route path="/settings" element={
                isLoggedIn ? <SettingsPage /> : <Navigate to="/login" />
              } />
              <Route path="/help" element={<HelpPage />} />
              <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
            </Routes>
          </main>
          {/* Bottom navigation untuk mobile */}
          {!isLoginPage && <BottomNav />}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
