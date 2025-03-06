import React, { useState, useCallback, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Box, Typography, Grid } from '@mui/material';
import { Building, Briefcase, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { useSearchParams } from 'react-router';
import { getAutocompleteCompanyOptions, getAutocompletePositionOptions, getAutocompleteLocationOptions } from '#client/react-query.gen';
import { MultiselectFieldWithIcon as AutocompleteFieldWithIcon } from '../Job/Form/fields/';

export interface FilterFormData {
  company: string[] | null;
  position: string[] | null;
  location: string[] | null;
}

const QueryFilter: React.FC<QueryFilterProps> = () => {
  // Use search params hook from react-router
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize form with values from URL or default values
  const methods = useForm<FilterFormData>({
    defaultValues: {
      company: searchParams.getAll('company') || null,
      position: searchParams.getAll('position') || null,
      location: searchParams.getAll('location') || null
    }
  });

  const { control, handleSubmit, reset, watch, getValues } = methods;

  const company = watch('company');
  const position = watch('position');
  const location = watch('location');

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);

    const updateParamArray = (key: string, values: string[] | null) => {
      newSearchParams.delete(key);

      if (values && values.length > 0) {
        values.forEach(value => {
          newSearchParams.append(key, value);
        });
      }
    };

    // Update each filter type
    updateParamArray('company', company);
    updateParamArray('position', position);
    updateParamArray('location', location);

    // Only update search params if they've actually changed
    setSearchParams(newSearchParams, { replace: true });
  }, [company, position, location]);

  const [searchInputs, setSearchInputs] = useState({
    company: '',
    position: '',
    location: ''
  });

  const debouncedSearch = useCallback(
    debounce((field, value) => {
      setSearchInputs(prev => ({ ...prev, [field]: value }));
    }, 300),
    []
  );

  const companyQuery = useQuery({
    ...getAutocompleteCompanyOptions({
      query: { comp: searchInputs.company }
    }),
    enabled: searchInputs?.company?.length >= 3,
    staleTime: 30000,
    placeholderData: (previousData) => previousData
  });

  const positionQuery = useQuery({
    ...getAutocompletePositionOptions({
      query: {
        comp: '*',
        pos: searchInputs.position
      }
    }),
    enabled: searchInputs.position.length >= 3,
    staleTime: 30000,
    placeholderData: (previousData) => previousData
  });

  const locationQuery = useQuery({
    ...getAutocompleteLocationOptions({
      query: {
        loc: searchInputs.location || '',
      }
    }),
    enabled: searchInputs.location.length >= 2,
    staleTime: 30000,
    placeholderData: (previousData) => previousData
  });

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>Query Filters</Typography>
      <FormProvider {...methods}>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <AutocompleteFieldWithIcon
                name="company"
                label="Company"
                control={control}
                multiple
                icon={<Building size={18} />}
                options={companyQuery?.data?.map((item) => item.name) || []}
                loading={companyQuery?.isLoading}
                getOptionLabel={(option) => option ?? ""}
                isOptionEqualToValue={(option, value) => option === value}
                onInputChange={(_, value) => debouncedSearch('company', value)}
                placeholder="Search for companies..."
              />
            </Grid>

            <Grid item xs={12}>
              <AutocompleteFieldWithIcon
                name="position"
                label="Position"
                control={control}
                multiple
                icon={<Briefcase size={18} />}
                options={positionQuery?.data?.map((item) => item.name) || []}
                loading={positionQuery.isFetching}
                getOptionLabel={(option) => option ?? ""}
                isOptionEqualToValue={(option, value) => option === value}
                onInputChange={(_, value) => debouncedSearch('position', value)}
                placeholder="Search for positions..."
              />
            </Grid>

            <Grid item xs={12}>
              <AutocompleteFieldWithIcon
                name="location"
                label="Location"
                control={control}
                multiple
                icon={<MapPin size={18} />}
                options={locationQuery?.data?.map((item) => item.name) || []}
                loading={locationQuery.isFetching}
                getOptionLabel={(option) => option ?? ""}
                isOptionEqualToValue={(option, value) => option === value}
                onInputChange={(_, value) => {
                  debouncedSearch('location', value);
                }}
                placeholder="Search for locations..."
              />
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </Box>
  );
};

export default QueryFilter;
