'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
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

  // Filter and map transactions, finding max amount in single pass
  const categoryTransactions = transactions
    .filter((trans) => trans.categoryId === categoryId)
    .reduce<
      Array<{
        name: string;
        amount: number;
        date: string;
        isMax?: boolean;
      }>
    >((acc, trans) => {
      acc.push({
        name: trans.description,
        amount: trans.amount,
        date: new Date(trans.transactionDate).toLocaleDateString(),
      });
      return acc;
    }, []);

  // Find max and add flag in second pass (more efficient than double map)
  if (categoryTransactions.length > 0) {
    const maxAmount = Math.max(...categoryTransactions.map((t) => t.amount));
    categoryTransactions.forEach((trans) => {
      if (trans.amount === maxAmount) {
        trans.isMax = true;
      }
    });
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Expenses in{' '}
        <Box component="span" sx={{ color: '#1976d2', fontWeight: 700, fontSize: '1.1em' }}>
          {categoryName}
        </Box>
      </Typography>
      {categoryTransactions.length === 0 ? (
        <Typography color="textSecondary">No transactions in this category</Typography>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={categoryTransactions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} labelFormatter={(label) => `Transaction: ${label}`} contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }} />
            <Legend />
            <Bar dataKey="amount" name="Amount">
              {categoryTransactions.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isMax ? '#d32f2f' : '#1976d2'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};
