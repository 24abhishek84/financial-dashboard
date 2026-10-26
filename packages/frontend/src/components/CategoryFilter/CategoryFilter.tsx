import React from 'react';
import { Category } from '@financial-dashboard/common';

interface Props {
  categories: Category[];
  selected: string | null;
  onChange: (categoryId: string | null) => void;
}

export const CategoryFilter: React.FC<Props> = ({ categories, selected, onChange }) => {
  return (
    <div className="category-filter">
      <label>Filter by Category:</label>
      <select value={selected || ''} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
};
