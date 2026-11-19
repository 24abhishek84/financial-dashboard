'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '@/context/auth-context';
import { CategoryFilter } from '@/components/category-filter';
import { TransactionChart } from '@/components/transaction-chart';
import { TransactionList } from '@/components/transaction-list';
import { GET_TRANSACTIONS, GET_CATEGORIES, GET_DASHBOARD_STATS } from '@/lib/graphql/queries';
import { ROUTES } from '@/lib/constants';
import { Category, Transaction } from '@financial-dashboard/common';
import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data: transactionsData, loading: transLoading, error: transError } = useQuery<{
    transactions: Transaction[];
  }>(GET_TRANSACTIONS);

  const { data: categoriesData, loading: catLoading, error: catError } = useQuery<{
    categories: Category[];
  }>(GET_CATEGORIES);

  const { data: statsData } = useQuery<{ dashboardStats: any }>(GET_DASHBOARD_STATS);

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  if (transLoading || catLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (transError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Error loading transactions: {transError.message}</Alert>
      </Container>
    );
  }

  if (catError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Error loading categories: {catError.message}</Alert>
      </Container>
    );
  }

  const transactions = transactionsData?.transactions || [];
  const categories = categoriesData?.categories || [];
  const stats = statsData?.dashboardStats;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* App Bar / Header */}
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Financial Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">Welcome, {user?.firstName}</Typography>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Stats Cards Section */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#e8f5e9', height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Income
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                    ${stats.totalIncome.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#ffebee', height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Expense
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#c62828', fontWeight: 600 }}>
                    ${stats.totalExpense.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#e3f2fd', height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Balance
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 600 }}>
                    ${stats.balance.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#f3e5f5', height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Transactions
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#6a1b9a', fontWeight: 600 }}>
                    {stats.transactionCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <CategoryFilter
                categories={categories}
                selected={selectedCategory}
                onChange={setSelectedCategory}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="End Date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {/* Chart Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <TransactionChart transactions={transactions} categories={categories} />
        </Paper>

        {/* Transactions List Section */}
        <Paper sx={{ p: 3 }}>
          <TransactionList transactions={transactions} selectedCategory={selectedCategory} />
        </Paper>
      </Container>
    </Box>
  );
}
