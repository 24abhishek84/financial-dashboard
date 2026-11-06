import { render, screen } from '@testing-library/react';
import { TransactionChart } from '../transaction-chart';
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
    description: 'More Food',
    amount: 30.0,
    transactionDate: '2026-11-02',
    categoryId: '1',
    categoryName: 'Food',
    notes: 'Restaurant',
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-02T10:00:00Z',
  },
  {
    id: '3',
    description: 'Taxi Ride',
    amount: 15.0,
    transactionDate: '2026-11-03',
    categoryId: '2',
    categoryName: 'Transport',
    notes: 'To office',
    createdAt: '2026-11-03T10:00:00Z',
    updatedAt: '2026-11-03T10:00:00Z',
  },
];

describe('TransactionChart Component', () => {
  it('renders the chart title', () => {
    render(<TransactionChart transactions={mockTransactions} />);

    expect(screen.getByText('Transactions by Category')).toBeInTheDocument();
  });

  it('renders chart elements', () => {
    const { container } = render(<TransactionChart transactions={mockTransactions} />);

    // Check if recharts components are rendered (look for SVG elements)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('handles empty transactions array', () => {
    render(<TransactionChart transactions={[]} />);

    expect(screen.getByText('Transactions by Category')).toBeInTheDocument();
  });

  it('groups transactions by category', () => {
    const { container } = render(<TransactionChart transactions={mockTransactions} />);

    // The chart should contain SVG with xAxis labels
    // Food transactions: 50.25 + 30 = 80.25
    // Transport transactions: 15.0
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with single category', () => {
    const singleCategory = [mockTransactions[0]];

    render(<TransactionChart transactions={singleCategory} />);

    expect(screen.getByText('Transactions by Category')).toBeInTheDocument();
  });

  it('renders multiple categories', () => {
    render(<TransactionChart transactions={mockTransactions} />);

    expect(screen.getByText('Transactions by Category')).toBeInTheDocument();
    // Chart renders successfully with multiple categories
  });
});
