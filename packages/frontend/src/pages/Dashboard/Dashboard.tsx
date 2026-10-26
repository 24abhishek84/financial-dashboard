import React, { useState } from 'react';
import { GET_TRANSACTIONS, GET_CATEGORIES, GET_DASHBOARD_STATS } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/constants';
import { CategoryFilter } from '../../components/CategoryFilter/CategoryFilter';
import { TransactionChart } from '../../components/TransactionChart/TransactionChart';
import { useQuery } from '@apollo/client/react';
import { Category, Transaction } from '@financial-dashboard/common';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data: transactionsData, loading: transLoading, error: transError } = useQuery<{ transactions: Transaction[] }>(GET_TRANSACTIONS);

  const { data: categoriesData, loading: catLoading, error: catError } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);

  const { data: statsData } = useQuery<{ dashboardStats: any }>(GET_DASHBOARD_STATS);

  if (transLoading || catLoading) return <div>Loading...</div>;

  if (transError) return <div>Error loading transactions: {transError.message}</div>;
  if (catError) return <div>Error loading categories: {catError.message}</div>;

  const transactions = transactionsData?.transactions || [];
  const categories = categoriesData?.categories || [];
  const stats = statsData?.dashboardStats;

  return (
    <div className="dashboard">
      <h1>Financial Dashboard</h1>

      {stats && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <p>Total Income</p>
            <h2>${stats.totalIncome.toFixed(2)}</h2>
          </div>
          <div className="stat-card">
            <p>Total Expense</p>
            <h2>${stats.totalExpense.toFixed(2)}</h2>
          </div>
          <div className="stat-card">
            <p>Balance</p>
            <h2>${stats.balance.toFixed(2)}</h2>
          </div>
          <div className="stat-card">
            <p>Transactions</p>
            <h2>{stats.transactionCount}</h2>
          </div>
        </div>
      )}

      <div className="filters">
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
        <div className="date-range">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            placeholder="Start Date"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            placeholder="End Date"
          />
        </div>
      </div>

      <TransactionChart transactions={transactions} />
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Financial Dashboard</h1>
        <div className="user-section">
          <p>Welcome, {user?.firstName}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="dashboard-content">
        <Dashboard />
      </main>
    </div>
  );
};

export default DashboardPage;
