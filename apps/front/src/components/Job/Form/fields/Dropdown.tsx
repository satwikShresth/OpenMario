import React from 'react';
import {
   Box,
   FormControl,
   FormHelperText,
   InputLabel,
   MenuItem,
   OutlinedInput,
   Select,
} from '@mui/material';
import { type Control, Controller, type FieldValues, type RegisterOptions } from 'react-hook-form';

type DropdownFieldProps<T extends FieldValues> = {
   name: keyof T;
   label: string;
   control: Control<T>;
   options: readonly string[];
   rules?: RegisterOptions;
   icon?: React.ReactNode;
   helperText?: string;
   disabled?: boolean;
   error?: boolean;
   placeholder?: string;
   nullable?: boolean;
   emptyOption?: boolean;
   emptyLabel?: string;
};

export const DropdownField = <T extends FieldValues>({
   name,
   label,
   control,
   options,
   rules,
   icon,
   helperText,
   disabled = false,
   error,
   placeholder,
   nullable = false,
   emptyOption = true,
   emptyLabel = 'None',
}: DropdownFieldProps<T>) => {
   return (
      <Controller
         name={name}
         control={control}
         rules={rules}
         render={({ field, fieldState }) => {
            const { onChange, value, ref, ...restField } = field;

            return (
               <FormControl
                  fullWidth
                  disabled={disabled}
                  error={error || !!fieldState.error}
               >
                  <InputLabel id={`${String(name)}-label`}>
                     {icon
                        ? (
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ transform: 'translateY(-2px)' }}>
                                 {icon}
                              </Box>
                              {label}
                           </Box>
                        )
                        : label}
                  </InputLabel>
                  <Select
                     {...restField}
                     labelId={`${String(name)}-label`}
                     id={String(name)}
                     value={value || ''}
                     onChange={(e) => {
                        const newValue = e.target.value;
                        onChange(
                           nullable && (!newValue || newValue === '') ? null : newValue,
                        );
                     }}
                     input={<OutlinedInput label={label} />}
                     displayEmpty={!!placeholder}
                     renderValue={(selected) => {
                        if (!selected && placeholder) {
                           return <em style={{ opacity: 0.6 }}>{placeholder}</em>;
                        }
                        return typeof selected === 'string' && selected.includes('/')
                           ? selected
                           : `${selected}${name === 'coop_year' ? ' Year' : ''}`;
                     }}
                  >
                     {emptyOption && (
                        <MenuItem value=''>
                           <em>{emptyLabel}</em>
                        </MenuItem>
                     )}
                     {options.map((option) => (
                        <MenuItem key={option} value={option}>
                           {option.includes('/')
                              ? option
                              : `${option}${name === 'coop_year' ? ' Year' : ''}`}
                        </MenuItem>
                     ))}
                  </Select>
                  <FormHelperText>
                     {helperText || fieldState.error?.message || ''}
                  </FormHelperText>
               </FormControl>
            );
         }}
      />
   );
};
