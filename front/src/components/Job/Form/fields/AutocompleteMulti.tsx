import React from 'react';
import { Controller } from 'react-hook-form';
import { Box, TextField, Autocomplete, CircularProgress, Chip } from '@mui/material';
import type { Submission } from '#/types';
import { filterOptions } from '../filter';

type MultiselectFieldWithIconProps<T> = {
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
  limitTags?: number;
  chipColor?: 'default' | 'primary' | 'secondary';
};

export const MultiselectFieldWithIcon = <T extends object>({
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
  limitTags = 2,
  chipColor = 'default',
  ...props
}: MultiselectFieldWithIconProps<T>) => {
  const { loadOptions, dependsOn, ...filteredProps } = props as any;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const { onChange, value, ref, ...restField } = field;

        return (
          <Autocomplete
            {...filteredProps}
            {...restField}
            multiple
            limitTags={limitTags}
            options={options}
            loading={loading}
            getOptionLabel={(option) => {
              if (!option) return '';
              return getOptionLabel(option as T);
            }}
            isOptionEqualToValue={isOptionEqualToValue}
            onInputChange={onInputChange}
            filterOptions={filterOptions}
            onChange={(event, newValue) => {
              onChange(nullable && (!newValue || newValue.length === 0) ? null : newValue);
            }}
            disabled={disabled}
            value={value || []}
            noOptionsText={noOptionsText}
            freeSolo={freeSolo}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  label={getOptionLabel(option as T)}
                  {...getTagProps({ index })}
                  color={chipColor}
                  size="small"
                />
              ))
            }
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
                placeholder={value?.length > 0 ? '' : placeholder}
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
