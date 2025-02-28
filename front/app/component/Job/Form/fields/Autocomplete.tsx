import React from 'react';
import { Controller } from 'react-hook-form';
import { Box, TextField, Autocomplete, CircularProgress } from '@mui/material';
import type { Submission } from '#client/types.gen';
import { matchSorter } from 'match-sorter';

const filterOptions = (options, { inputValue }) => {
  if (!inputValue) {
    return options;
  }

  if (inputValue.toLowerCase().includes("sig")) {
    const sigOption = options.find(
      option => option === "Susquehanna Int'l Group LLP" ||
        option.name === "Susquehanna Int'l Group LLP"
    );

    if (sigOption) {
      const filteredOptions = matchSorter(options, inputValue);

      const filteredWithoutSig = filteredOptions.filter(
        option => option !== sigOption &&
          (typeof option === 'string' ? option : option.name) !== "Susquehanna Int'l Group LLP"
      );

      return [sigOption, ...filteredWithoutSig];
    }
  }

  return matchSorter(options, inputValue);
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
  disabled?: boolean
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
  ...props
}: AutocompleteFieldWithIconProps<T>) => {
  const { loadOptions, dependsOn, ...filteredProps } = props as any;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const value = field.value === null || field.value === undefined ? '' : field.value;

        return (
          <Autocomplete
            {...filteredProps}
            options={options}
            loading={loading}
            getOptionLabel={(option) => getOptionLabel(option as T)}
            isOptionEqualToValue={isOptionEqualToValue}
            onInputChange={onInputChange}
            filterOptions={filterOptions}
            onChange={(event, newValue) => {
              field.onChange(nullable && !newValue ? null : newValue);
            }}
            disabled={disabled}
            value={value}
            noOptionsText={noOptionsText}
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
                error={!!error}
                helperText={error?.message}
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  },
                }}
              />
            )}
          //renderOption={(props, option) => {
          //  const optionLabel = getOptionLabel(option as T);
          //  return (
          //    <li {...props} key={typeof option === 'object' && option !== null ?
          //      (option as any).id || optionLabel : String(optionLabel)}>
          //      {optionLabel}
          //    </li>
          //  );
          //}}
          />
        );
      }}
    />
  );
};
