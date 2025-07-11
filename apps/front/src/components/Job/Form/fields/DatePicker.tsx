import React from 'react';
import {
   type Control,
   Controller,
   type FieldValues,
   type Path,
   type RegisterOptions,
} from 'react-hook-form';
import { FormControl, FormHelperText } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTime } from 'luxon';
// Generic type for any form values
interface DatePickerFieldProps<T extends FieldValues> {
   name: Path<T>;
   label: string;
   control: Control<T>;
   rules?: RegisterOptions;
   views?: ('year' | 'month' | 'day')[];
   openTo?: 'year' | 'month' | 'day';
   disableFuture?: boolean;
   disablePast?: boolean;
   minYear?: number;
   maxYear?: number;
}
export const DatePickerField = <T extends FieldValues>({
   name,
   label,
   control,
   rules,
   views = ['year'],
   openTo = 'year',
   disableFuture = false,
   disablePast = false,
   minYear,
   maxYear,
}: DatePickerFieldProps<T>): React.ReactElement => {
   return (
      <Controller
         name={name}
         control={control}
         rules={rules}
         render={({ field, fieldState: { error } }) => {
            const { onChange, value, ref, ...restField } = field;
            // Convert integer year to Luxon DateTime for the date picker
            const dateTimeValue = value ? DateTime.local(value) : null;
            // Calculate min and max dates from years if provided
            const minDate = minYear ? DateTime.local(minYear, 1, 1) : undefined;
            const maxDate = maxYear ? DateTime.local(maxYear, 12, 31) : undefined;
            return (
               <FormControl fullWidth error={!!error}>
                  <LocalizationProvider dateAdapter={AdapterLuxon}>
                     <DatePicker
                        {...restField}
                        label={label}
                        openTo={openTo}
                        views={views}
                        disableFuture={disableFuture}
                        disablePast={disablePast}
                        minDate={minDate}
                        maxDate={maxDate}
                        value={dateTimeValue}
                        onChange={(newValue) => {
                           onChange(newValue ? newValue.year : null);
                        }}
                        slotProps={{
                           textField: {
                              inputRef: ref,
                              error: !!error,
                              fullWidth: true,
                           },
                        }}
                     />
                  </LocalizationProvider>
                  {error && <FormHelperText>{error.message}</FormHelperText>}
               </FormControl>
            );
         }}
      />
   );
};
