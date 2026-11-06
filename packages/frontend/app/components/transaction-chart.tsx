'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '@financial-dashboard/common';
import { Box, Typography } from '@mui/material';

interface Props {
  transactions: Transaction[];
}

export const TransactionChart: React.FC<Props> = ({ transactions }) => {
  // Group transactions by category
  const data = transactions.reduce((acc: any, trans) => {
    const existing = acc.find((item: any) => item.category === trans.categoryName);
    if (existing) {
      existing.amount += trans.amount;
    } else {
      acc.push({ category: trans.categoryName, amount: trans.amount });
    }
    return acc;
  }, []);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Transactions by Category
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};
