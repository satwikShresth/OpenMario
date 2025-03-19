import React, { useState } from 'react';
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
  const [inputValue, setInputValue] = useState('');
  const [customError, setCustomError] = useState('');

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        ...rules,
        validate: (value) => {
          // Skip validation for empty values
          if (!inputValue || inputValue === '') return true;

          // Validate that the value exists in options
          const valueExists = options.some(option =>
            getOptionLabel(option as T).toLowerCase() === inputValue.toLowerCase()
          );

          return valueExists || 'Value must match one of the available options';
        }
      }}
      render={({ field, fieldState }) => {
        const { onChange, value, ref, onBlur, ...restField } = field;
        const controlledValue = value === null || value === undefined ? "" : value;

        // Custom onBlur handler that checks for errors
        const handleBlur = (event) => {
          if (inputValue && inputValue !== '') {
            const valueExists = options.some(option =>
              getOptionLabel(option as T).toLowerCase() === inputValue.toLowerCase()
            );

            if (!valueExists) {
              setCustomError('Value must match one of the available options');
            } else {
              setCustomError('');
            }
          } else {
            setCustomError('');
          }

          // Call the original onBlur
          onBlur();
        };

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
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);

              // Update the form value in real-time as user types
              if (freeSolo) {
                onChange(newInputValue === "" && nullable ? null : newInputValue);
              }

              // Call the custom onInputChange handler if provided
              if (onInputChange) {
                onInputChange(event, newInputValue);
              }
            }}
            inputValue={inputValue}
            filterOptions={filterOptions}
            onChange={(event, newValue) => {
              // Use the actual newValue (even if empty string) or null if nullable is true
              onChange(newValue === "" && nullable ? null : newValue);

              // Clear any custom errors when selection changes
              setCustomError('');

              // Also update the input value when selection changes
              if (newValue !== null && typeof newValue === 'object') {
                setInputValue(getOptionLabel(newValue as T));
              }
            }}
            onBlur={handleBlur}
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
                error={error || !!fieldState.error || !!customError}
                helperText={helperText || fieldState.error?.message || customError || ""}
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
