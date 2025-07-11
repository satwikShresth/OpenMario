import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Autocomplete, Box, CircularProgress, TextField } from '@mui/material';
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
   const [shouldValidate, setShouldValidate] = useState(true);

   // Effect to continuously validate input value against options
   // But only when not loading and shouldValidate is true
   useEffect(() => {
      if (loading) {
         // Don't validate while loading
         setCustomError('');
         return;
      }

      if (shouldValidate && inputValue && inputValue !== '') {
         const valueExists = checkValueInOptions(inputValue);
         if (!valueExists) {
            setCustomError('Value must match one of the available options');
         } else {
            setCustomError('');
         }
      } else {
         setCustomError('');
      }
   }, [inputValue, options, getOptionLabel, loading, shouldValidate]);

   // Reset validation state when loading changes with extended delay
   useEffect(() => {
      // Always suspend validation when loading starts
      if (loading) {
         setShouldValidate(false);
      } else {
         // Re-enable validation after loading completes, with a longer delay
         // to ensure options are fully updated and UI has stabilized
         const timer = setTimeout(() => {
            setShouldValidate(true);
         }, 800); // Increased from 300ms to 800ms for better user experience

         return () => clearTimeout(timer);
      }
   }, [loading]);

   // Helper function to normalize strings for comparison
   const normalizeString = (str: string) => {
      return str.toLowerCase().trim();
   };

   // Helper function to check if a value exists in options
   const checkValueInOptions = (value: string) => {
      if (!value) return true;

      const normalizedValue = normalizeString(value);

      return options.some((option) => {
         const optionLabel = getOptionLabel(option as T);
         return normalizeString(optionLabel) === normalizedValue;
      });
   };

   return (
      <Controller
         name={name}
         control={control}
         rules={{
            ...rules,
            validate: (value) => {
               // Skip validation while loading
               if (loading) return true;

               // Skip validation for empty values
               if (!inputValue || inputValue === '') return true;

               return checkValueInOptions(inputValue) ||
                  'Value must match one of the available options';
            },
         }}
         render={({ field, fieldState }) => {
            const { onChange, value, ref, onBlur, ...restField } = field;
            const controlledValue = value === null || value === undefined ? '' : value;

            // Custom onBlur handler that checks for errors
            const handleBlur = (event) => {
               // Don't show errors while loading
               if (loading) return onBlur();

               if (inputValue && inputValue !== '') {
                  const valueExists = checkValueInOptions(inputValue);

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

            // Enhanced error handling with loading state tracking
            // Don't show errors while loading or for a brief period after loading completes
            const [wasRecentlyLoading, setWasRecentlyLoading] = useState(loading);

            useEffect(() => {
               if (loading) {
                  setWasRecentlyLoading(true);
               } else if (wasRecentlyLoading) {
                  // Add delay before allowing errors to show after loading completes
                  const timer = setTimeout(() => {
                     setWasRecentlyLoading(false);
                  }, 600);
                  return () => clearTimeout(timer);
               }
            }, [loading]);

            // Only show errors if not loading AND not recently loaded AND has actual errors
            const showError = !loading && !wasRecentlyLoading &&
               (error || !!fieldState.error || !!customError);
            const errorMessage = showError
               ? (helperText || fieldState.error?.message || customError || '')
               : '';

            return (
               <Autocomplete
                  {...filteredProps}
                  {...restField}
                  options={options}
                  loading={loading}
                  getOptionLabel={(option) => {
                     // Handle null/undefined option
                     if (option === null || option === undefined) return '';
                     // Handle string options for freeSolo mode
                     if (typeof option === 'string') return option;
                     return getOptionLabel(option as T);
                  }}
                  isOptionEqualToValue={isOptionEqualToValue}
                  onInputChange={(event, newInputValue) => {
                     setInputValue(newInputValue);

                     if (freeSolo) {
                        onChange(
                           newInputValue === '' && nullable ? null : newInputValue,
                        );
                     }

                     if (onInputChange) {
                        onInputChange(event, newInputValue);
                     }
                  }}
                  inputValue={inputValue}
                  filterOptions={filterOptions}
                  onChange={(event, newValue) => {
                     // Use the actual newValue (even if empty string) or null if nullable is true
                     onChange(newValue === '' && nullable ? null : newValue);

                     // Clear any custom errors when selection changes
                     setCustomError('');

                     // Also update the input value when selection changes
                     if (newValue !== null) {
                        if (typeof newValue === 'object') {
                           setInputValue(getOptionLabel(newValue as T));
                        } else if (typeof newValue === 'string') {
                           setInputValue(newValue);
                        }
                     } else {
                        setInputValue('');
                     }
                  }}
                  onBlur={handleBlur}
                  disabled={disabled}
                  value={controlledValue}
                  noOptionsText={loading ? 'Loading...' : noOptionsText}
                  freeSolo={freeSolo}
                  renderInput={(params) => (
                     <TextField
                        {...params}
                        inputRef={ref}
                        label={
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ transform: 'translateY(-2px)' }}>
                                 {icon}
                              </Box>
                              {label}
                           </Box>
                        }
                        placeholder={placeholder}
                        error={showError}
                        helperText={errorMessage}
                        InputProps={{
                           ...params.InputProps,
                           endAdornment: (
                              <React.Fragment>
                                 {loading ? <CircularProgress color='inherit' size={20} /> : null}
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
