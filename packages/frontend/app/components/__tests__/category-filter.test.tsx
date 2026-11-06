import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilter } from '../category-filter';
import { Category } from '@financial-dashboard/common';

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Food',
    description: 'Food expenses',
    type: 'expense',
    color: '#FF0000',
    parentCategoryId: null,
    subCategories: [],
  },
  {
    id: '2',
    name: 'Transport',
    description: 'Transport expenses',
    type: 'expense',
    color: '#00FF00',
    parentCategoryId: null,
    subCategories: [],
  },
];

describe('CategoryFilter Component', () => {
  it('renders the select dropdown', () => {
    const mockOnChange = jest.fn();
    render(
      <CategoryFilter categories={mockCategories} selected={null} onChange={mockOnChange} />
    );

    expect(screen.getByLabelText('Filter by Category')).toBeInTheDocument();
  });

  it('displays all categories in dropdown', async () => {
    const mockOnChange = jest.fn();
    const user = userEvent.setup();

    render(
      <CategoryFilter categories={mockCategories} selected={null} onChange={mockOnChange} />
    );

    const select = screen.getByRole('combobox');
    await user.click(select);

    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('calls onChange when a category is selected', async () => {
    const mockOnChange = jest.fn();
    const user = userEvent.setup();

    render(
      <CategoryFilter categories={mockCategories} selected={null} onChange={mockOnChange} />
    );

    const select = screen.getByRole('combobox');
    await user.click(select);

    const foodOption = screen.getByText('Food');
    await user.click(foodOption);

    expect(mockOnChange).toHaveBeenCalledWith('1');
  });

  it('calls onChange with null when All Categories is selected', async () => {
    const mockOnChange = jest.fn();
    const user = userEvent.setup();

    render(
      <CategoryFilter categories={mockCategories} selected="1" onChange={mockOnChange} />
    );

    const select = screen.getByRole('combobox');
    await user.click(select);

    const allOption = screen.getByText('All Categories');
    await user.click(allOption);

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('displays selected category', () => {
    const mockOnChange = jest.fn();

    render(
      <CategoryFilter categories={mockCategories} selected="1" onChange={mockOnChange} />
    );

    const select = screen.getByDisplayValue('1');
    expect(select).toBeInTheDocument();
  });
});
