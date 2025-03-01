import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { Submission } from '#client/types.gen';
import { Controller, type Control, type FieldValues, type RegisterOptions } from "react-hook-form";

type DropdownFieldProps<T extends FieldValues> = {
  name: keyof T;
  label: string;
  control: Control<T>;
  options: readonly string[];
  rules?: RegisterOptions;
};

export const DropdownField = <T extends FieldValues>({
  name,
  label,
  control,
  options,
  rules,
}: DropdownFieldProps<T>) => {
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
