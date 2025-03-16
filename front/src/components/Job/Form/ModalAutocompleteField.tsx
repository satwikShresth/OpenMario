import React from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { filterOptions } from './filter';


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
  helperText,
  disabled,
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
            onInputChange={(event, newInputValue) => {
              // Update the form field value whenever input changes
              onChange(newInputValue);

              // Also call the parent's onInputChange if provided
              if (onInputChange) {
                onInputChange(event, newInputValue);
              }
            }}
            onChange={(_, newValue) => {
              // Handle selection from dropdown
              onChange(newValue);
            }}
            disabled={disabled}
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
