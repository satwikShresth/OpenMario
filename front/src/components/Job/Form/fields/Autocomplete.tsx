import React from 'react';
import { Controller } from 'react-hook-form';
import { Box, TextField, Autocomplete, CircularProgress } from '@mui/material';
import type { Submission } from '#/types';
import { filterOptions } from '../filter';

type AutocompleteFieldWithIconProps<T> = {
  name: keyof Submission;
  label: string;
  control: any;
  rules?: object;
  icon: React.ReactNode;
  options: T[];
  loading?: boolean;
  getOptionLabel: (option: T) => string;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  onInputChange?: (event: React.SyntheticEvent, value: string) => void;
  placeholder?: string;
  nullable?: boolean;
  noOptionsText?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  freeSolo?: boolean;
};

export const AutocompleteFieldWithIcon = <T extends object>({
  name,
  label,
  control,
  rules,
  icon,
  options,
  loading = false,
  getOptionLabel,
  isOptionEqualToValue,
  onInputChange,
  placeholder,
  nullable = false,
  noOptionsText = 'No options',
  disabled = false,
  error,
  helperText,
  freeSolo = true,
  ...props
}: AutocompleteFieldWithIconProps<T>) => {
  const { loadOptions, dependsOn, ...filteredProps } = props as any;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const { onChange, value, ref, ...restField } = field;
        const controlledValue = value === null || value === undefined ? "" : value;

        return (
          <Autocomplete
            {...filteredProps}
            {...restField}
            options={options}
            loading={loading}
            getOptionLabel={(option) => {
              // Handle null/undefined option
              if (option === null || option === undefined) return '';
              return getOptionLabel(option as T);
            }}
            isOptionEqualToValue={isOptionEqualToValue}
            onInputChange={onInputChange}
            filterOptions={filterOptions}
            onChange={(event, newValue) => {
              // Use the actual newValue (even if empty string) or null if nullable is true
              onChange(newValue === "" && nullable ? null : newValue);
            }}
            disabled={disabled}
            value={controlledValue}
            noOptionsText={noOptionsText}
            freeSolo={freeSolo}
            renderInput={(params) => (
              <TextField
                {...params}
                inputRef={ref}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ transform: 'translateY(-2px)' }}>
                      {icon}
                    </Box>
                    {label}
                  </Box>
                }
                placeholder={placeholder}
                error={error || !!fieldState.error}
                helperText={helperText || fieldState.error?.message || ""}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => {
              if (option === null || option === undefined) return null;

              const optionLabel = getOptionLabel(option as T);
              const optionKey = typeof option === 'object' && option !== null
                ? (option as any).id || optionLabel
                : String(optionLabel);

              return (
                <li {...props} key={optionKey}>
                  {optionLabel}
                </li>
              );
            }}
          />
        );
      }}
    />
  );
};
