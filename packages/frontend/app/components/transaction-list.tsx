'use client';

import React from 'react';
import { Transaction } from '@financial-dashboard/common';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@mui/material';

interface Props {
  transactions: Transaction[];
  selectedCategory?: string | null;
}

export const TransactionList: React.FC<Props> = ({ transactions, selectedCategory }) => {
  const filteredTransactions = selectedCategory
    ? transactions.filter((t) => t.categoryId === selectedCategory)
    : transactions;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Recent Transactions
      </Typography>
      {filteredTransactions.length > 0 ? (
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell>
                    {new Date(transaction.transactionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.categoryName}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 3 }}>
          No transactions found
        </Typography>
      )}
    </Box>
  );
};
