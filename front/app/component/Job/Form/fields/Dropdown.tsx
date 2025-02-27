import React from 'react';
import { Controller } from 'react-hook-form';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { Submission } from '#client/types.gen';

type DropdownFieldProps = {
  name: keyof Submission;
  label: string;
  control: any;
  options: readonly string[];
  rules?: object;
};

export const DropdownField: React.FC<DropdownFieldProps> = ({
  name,
  label,
  control,
  options,
  rules
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <FormControl fullWidth>
          <InputLabel>{label}</InputLabel>
          <Select {...field} label={label}>
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option.includes('/') ? option : `${option}${name === 'coop_year' ? ' Year' : ''}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    />
  );
};
