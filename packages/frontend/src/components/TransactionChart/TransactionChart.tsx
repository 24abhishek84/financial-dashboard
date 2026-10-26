import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '@financial-dashboard/common';

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
    <div className="chart-container">
      <h2>Transactions by Category</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
