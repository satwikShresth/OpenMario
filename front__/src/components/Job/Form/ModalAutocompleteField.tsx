import React from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { matchSorter } from 'match-sorter';

// Improved filterOptions function (same as in the main AutocompleteFieldWithIcon)
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

// Custom Autocomplete component that allows any string input
const ModalAutocompleteField = ({
  name,
  label,
  control,
  icon,
  options,
  loading = false,
  onInputChange,
  placeholder,
  error,
  helperText
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const { onChange, value, ref, ...restField } = field;

        return (
          <Autocomplete
            {...restField}
            options={options}
            loading={loading}
            filterOptions={filterOptions}
            freeSolo={true}
            selectOnFocus
            handleHomeEndKeys
            onInputChange={onInputChange}
            onChange={(_, newValue) => {
              onChange(newValue);
            }}
            value={value || ""}
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
          />
        );
      }}
    />
  );
};

export default ModalAutocompleteField;
