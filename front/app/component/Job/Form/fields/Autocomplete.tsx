import React from 'react';
import { Controller } from 'react-hook-form';
import { Box, TextField, Autocomplete, CircularProgress } from '@mui/material';
import type { Submission } from '#client/types.gen';
import { matchSorter } from 'match-sorter';

// Improved filterOptions function
const filterOptions = (options, { inputValue }) => {
  // If no input, return all options
  if (!inputValue) {
    return options;
  }

  // First get all filtered options
  const filteredOptions = matchSorter(options, inputValue, {
    keys: [(item) => typeof item === 'string' ? item : item.name]
  });

  // Special case for Susquehanna
  if (inputValue.toLowerCase().includes("sig")) {
    const sigOption = options.find(
      option => (typeof option === 'string' ? option : option.name) === "Susquehanna Int'l Group LLP"
    );

    // If Susquehanna exists but isn't in filtered results, add it
    if (sigOption && !filteredOptions.includes(sigOption)) {
      return [sigOption, ...filteredOptions];
    }

    // If Susquehanna exists and is in results, bring it to the top
    if (sigOption && filteredOptions.includes(sigOption)) {
      const withoutSig = filteredOptions.filter(option => option !== sigOption);
      return [sigOption, ...withoutSig];
    }
  }

  return filteredOptions;
};

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

export const AutocompleteFieldWithIcon = <T extends object | string>({
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
  freeSolo,
  ...props
}: AutocompleteFieldWithIconProps<T>) => {
  const { loadOptions, dependsOn, ...filteredProps } = props as any;

  // Debug output - uncomment this to check if options are being received
  // console.log("AutocompleteFieldWithIcon options:", options);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const value = field.value === null || field.value === undefined ? '' : field.value;

        return (
          <Autocomplete
            {...filteredProps}
            options={options}
            loading={loading}
            getOptionLabel={(option) => {
              // Handle null/undefined options safely
              if (!option) return '';
              return getOptionLabel(option as T);
            }}
            isOptionEqualToValue={isOptionEqualToValue}
            onInputChange={onInputChange}
            filterOptions={filterOptions}
            onChange={(event, newValue) => {
              field.onChange(nullable && !newValue ? null : newValue);
            }}
            disabled={disabled}
            value={value}
            noOptionsText={noOptionsText}
            freeSolo={freeSolo}
            renderInput={(params) => (
              <TextField
                {...params}
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
              if (!option) return null;

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
