import React from 'react';
import { Controller } from 'react-hook-form';
import { Box, TextField } from '@mui/material';
import type { Submission } from '#client/types.gen';

type TextFieldWithIconProps = {
  name: keyof Submission;
  label: string;
  control: any;
  rules?: object;
  icon: React.ReactNode;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  type?: string;
  inputProps?: object;
  endAdornment?: React.ReactNode;
  nullable?: boolean;
};

export const TextFieldWithIcon: React.FC<TextFieldWithIconProps> = ({
  name,
  label,
  control,
  rules,
  icon,
  multiline = false,
  rows,
  placeholder,
  type,
  inputProps,
  endAdornment,
  nullable = false,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ transform: 'translateY(-2px)' }}>
                {icon}
              </Box>
              {label}
            </Box>
          }
          fullWidth
          multiline={multiline}
          rows={rows}
          placeholder={placeholder}
          type={type}
          inputProps={inputProps}
          error={!!error}
          helperText={error?.message}
          onChange={(e) => {
            const value = e.target.value;
            if (nullable) {
              field.onChange(value || null);
            } else if (type === 'number' && value !== '') {
              field.onChange(parseFloat(value));
            } else {
              field.onChange(value);
            }
          }}
          {...props}
        />
      )
      }
    />
  );
};
