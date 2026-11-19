'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '@financial-dashboard/common';
import { Box, Typography } from '@mui/material';

interface Props {
  transactions: Transaction[];
}

const COLORS = ['#1976d2', '#388e3c', '#d32f2f', '#f57c00', '#7b1fa2', '#0097a7', '#fbc02d', '#c2185b'];

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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => `${entry.category}: $${entry.amount.toFixed(2)}`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="amount"
          >
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};
