import { render, screen } from '@testing-library/react';
import { TransactionList } from '../transaction-list';
import { Transaction } from '@financial-dashboard/common';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Grocery Shopping',
    amount: 50.25,
    transactionDate: '2026-11-01',
    categoryId: '1',
    categoryName: 'Food',
    notes: 'Weekly groceries',
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
  },
  {
    id: '2',
    description: 'Taxi Ride',
    amount: 15.0,
    transactionDate: '2026-11-02',
    categoryId: '2',
    categoryName: 'Transport',
    notes: 'To office',
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-02T10:00:00Z',
  },
];

describe('TransactionList Component', () => {
  it('renders the transactions table', () => {
    render(<TransactionList transactions={mockTransactions} />);

    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('displays all transactions', () => {
    render(<TransactionList transactions={mockTransactions} />);

    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
    expect(screen.getByText('Taxi Ride')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('formats transaction amounts correctly', () => {
    render(<TransactionList transactions={mockTransactions} />);

    expect(screen.getByText('$50.25')).toBeInTheDocument();
    expect(screen.getByText('$15.00')).toBeInTheDocument();
  });

  it('filters transactions by category', () => {
    render(
      <TransactionList transactions={mockTransactions} selectedCategory="1" />
    );

    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
    expect(screen.queryByText('Taxi Ride')).not.toBeInTheDocument();
  });

  it('displays message when no transactions found', () => {
    render(
      <TransactionList transactions={mockTransactions} selectedCategory="999" />
    );

    expect(screen.getByText('No transactions found')).toBeInTheDocument();
  });

  it('displays message when transaction list is empty', () => {
    render(<TransactionList transactions={[]} />);

    expect(screen.getByText('No transactions found')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<TransactionList transactions={mockTransactions} />);

    // The exact format depends on locale, but the date should be present
    expect(screen.getByText(/11\/1\/2026|1\/11\/2026/)).toBeInTheDocument();
  });
});
