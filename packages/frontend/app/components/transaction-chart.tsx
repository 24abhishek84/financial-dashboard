'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, Category, CategoryType } from '@financial-dashboard/common';
import { Box, Typography } from '@mui/material';
import { CategoryExpensesChart } from './category-expenses-chart';

interface Props {
  transactions: Transaction[];
  categories?: Category[];
  selectedCategory?: string | null;
  onCategorySelect?: (categoryId: string | null) => void;
}

const COLORS = ['#1976d2', '#388e3c', '#d32f2f', '#f57c00', '#7b1fa2', '#0097a7', '#fbc02d', '#c2185b'];

export const TransactionChart: React.FC<Props> = ({
  transactions,
  categories = [],
  selectedCategory = null,
  onCategorySelect,
}) => {
  // Create a map of category id to category for quick lookup
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  // Create a map of category name to category ID for reverse lookup
  const categoryNameToIdMap = new Map(
    categories.filter((cat) => cat.type === 'EXPENSE').map((cat) => [cat.name, cat.id])
  );

  // Filter transactions to only include EXPENSE categories
  const expenseTransactions = transactions.filter((trans) => {
    const category = categoryMap.get(trans.categoryId);
    return category?.type === CategoryType.Expense;
  });

  // Handle pie slice click
  const handlePieClick = (data: any) => {
    if (onCategorySelect) {
      const categoryId = categoryNameToIdMap.get(data.category);
      if (categoryId) {
        onCategorySelect(categoryId);
      }
    }
  };

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

  console.log(data);
  console.log(expenseTransactions);
  console.log(selectedCategory);
  return selectedCategory ? (
    <CategoryExpensesChart key={selectedCategory} transactions={transactions} categoryId={selectedCategory} categories={categories} />
  ) : (
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
            onClick={(state: any) => handlePieClick(state.payload)}
            style={{ cursor: 'pointer' }}
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
