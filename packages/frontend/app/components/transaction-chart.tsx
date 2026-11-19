'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Transaction, Category, CategoryType } from '@financial-dashboard/common';
import { Box, Typography } from '@mui/material';

interface Props {
  transactions: Transaction[];
  categories?: Category[];
  selectedCategory?: string | null;
}

const COLORS = ['#1976d2', '#388e3c', '#d32f2f', '#f57c00', '#7b1fa2', '#0097a7', '#fbc02d', '#c2185b'];

export const TransactionChart: React.FC<Props> = ({ transactions, categories = [], selectedCategory = null }) => {
  // Create a map of category id to category for quick lookup
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  // Filter transactions to only include EXPENSE categories
  const expenseTransactions = transactions.filter((trans) => {
    const category = categoryMap.get(trans.categoryId);
    return category?.type === CategoryType.Expense;
  });

  // If a category is selected, show bar chart with individual transactions for that category
  if (selectedCategory) {
    const categoryTransactions = expenseTransactions
      .filter((trans) => trans.categoryName === selectedCategory)
      .map((trans) => ({
        description: trans.description,
        amount: trans.amount,
        date: new Date(trans.transactionDate).toLocaleDateString(),
      }));

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Expenses in {selectedCategory}
        </Typography>
        {categoryTransactions.length === 0 ? (
          <Typography color="textSecondary">No transactions in this category</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={categoryTransactions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Legend />
              <Bar dataKey="amount" fill="#1976d2" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    );
  }

  // Group transactions by category for pie chart
  const data = expenseTransactions.reduce((acc: any, trans) => {
    const existing = acc.find((item: any) => item.category === trans.categoryName);
    if (existing) {
      existing.amount += trans.amount;
    } else {
      acc.push({ category: trans.categoryName, name: trans.categoryName, amount: trans.amount });
    }
    return acc;
  }, []);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Transactions by Category
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => `${entry.category}: $${entry.amount.toFixed(2)}`}
            outerRadius={120}
            dataKey="amount"
          >
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
          <Legend dataKey="name" />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};
