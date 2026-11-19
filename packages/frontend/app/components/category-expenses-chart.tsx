'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, Category } from '@financial-dashboard/common';
import { Box, Typography } from '@mui/material';

interface Props {
  transactions: Transaction[];
  categoryId: string;
  categories: Category[];
}

export const CategoryExpensesChart: React.FC<Props> = ({ transactions, categoryId, categories }) => {
  // Find the category name for display
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));
  const selectedCategory = categoryMap.get(categoryId);
  const categoryName = selectedCategory?.name || 'Unknown Category';

  const categoryTransactions = transactions
    .filter((trans) => trans.categoryId === categoryId)
    .map((trans) => ({
      description: trans.description,
      amount: trans.amount,
      date: new Date(trans.transactionDate).toLocaleDateString(),
    }));

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Expenses in {categoryName}
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
};
