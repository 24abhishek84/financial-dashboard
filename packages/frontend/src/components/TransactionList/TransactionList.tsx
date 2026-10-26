import React from 'react';
import { Transaction } from '@financial-dashboard/common';

interface Props {
  transactions: Transaction[];
  selectedCategory: string | null;
}

export const TransactionList: React.FC<Props> = ({ transactions, selectedCategory }) => {
  const filtered = selectedCategory
    ? transactions.filter((t) => String(t.categoryId) === selectedCategory)
    : transactions;

  return (
    <div className="transaction-list">
      <h2>Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((trans) => (
            <tr key={trans.id}>
              <td>{trans.transactionDate}</td>
              <td>{trans.description}</td>
              <td>{trans.categoryName}</td>
              <td>${trans.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
