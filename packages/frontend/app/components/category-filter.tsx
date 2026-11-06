'use client';

import React from 'react';
import { Category } from '@financial-dashboard/common';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface Props {
  categories: Category[];
  selected: string | null;
  onChange: (category: string | null) => void;
}

export const CategoryFilter: React.FC<Props> = ({ categories, selected, onChange }) => {
  return (
    <FormControl fullWidth>
      <InputLabel>Filter by Category</InputLabel>
      <Select
        value={selected || ''}
        label="Filter by Category"
        onChange={(e) => onChange(e.target.value || null)}
      >
        <MenuItem value="">All Categories</MenuItem>
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
