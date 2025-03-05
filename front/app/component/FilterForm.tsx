import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, Grid, Stack, Chip, Typography, IconButton, CircularProgress } from '@mui/material';
import { Filter, RefreshCw, Building, Briefcase, MapPin } from 'lucide-react';
import { AutocompleteFieldWithIcon } from './Job/Form/fields/';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { getAutocompleteCompanyOptions, getAutocompletePositionOptions, getAutocompleteLocationOptions } from '#client/react-query.gen';

interface FilterOption {
  name: string;
  [key: string]: any;
}

export interface FilterFormData {
  company: string | FilterOption | null;
  position: string | FilterOption | null;
  location: string | FilterOption | null;
}

interface FilterFormProps {
  initialValues?: FilterFormData;
  onSubmit: (data: FilterFormData) => void;
  isLoading: boolean;
  onRefresh: () => void;
  selectedFilters?: FilterFormData;
  onClearFilter: (field: keyof FilterFormData) => void;
}

const FilterForm: React.FC<FilterFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
  onRefresh,
  selectedFilters,
  onClearFilter
}) => {
  const { control, handleSubmit, reset } = useForm<FilterFormData>({
    defaultValues: initialValues || {
      company: null,
      position: null,
      location: null
    }
  });

  // State for search inputs (for autocomplete)
  const [searchInputs, setSearchInputs] = useState({
    company: '',
    position: '',
    location: ''
  });

  // Handle autocomplete search (debounced)
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

  const handleFormSubmit = (data: FilterFormData) => {
    onSubmit(data);
  };

  const handleClearAll = () => {
    reset({
      company: null,
      position: null,
      location: null
    });
    onSubmit({
      company: null,
      position: null,
      location: null
    });
  };

  // Handle input change for autocomplete
  const handleInputChange = (field, value) => {
    debouncedSearch(field, value);
  };

  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filter Submissions</Typography>
        <IconButton
          onClick={onRefresh}
          disabled={isLoading}
          color="primary"
          size="small"
        >
          {isLoading ? (
            <CircularProgress size={20} />
          ) : (
            <RefreshCw size={20} />
          )}
        </IconButton>
      </Box>

      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <AutocompleteFieldWithIcon
              name="company"
              label="Company"
              control={control}
              icon={<Building size={18} />}
              options={companyQuery?.data?.map((item) => item.name) || []}
              loading={companyQuery?.isLoading}
              getOptionLabel={(option) => option ?? ""}
              isOptionEqualToValue={(option, value) => option === value}
              onInputChange={(_, value) => {
                debouncedSearch('company', value);
              }}
              placeholder="Search for a company..."
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <AutocompleteFieldWithIcon
              name="position"
              label="Position"
              control={control}
              icon={<Briefcase size={18} />}
              options={positionQuery?.data?.map((item) => item.name) || []}
              loading={positionQuery.isFetching}
              getOptionLabel={(option) => option ?? ""}
              isOptionEqualToValue={(option, value) => option === value}
              onInputChange={(_, value) => {
                debouncedSearch('position', value);
              }}
              placeholder="Search for a position..."
              freeSolo
              nullable
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <AutocompleteFieldWithIcon
              name="location"
              label="Location"
              control={control}
              icon={<MapPin size={18} />}
              options={locationQuery?.data?.map((item) => item.name) || []}
              loading={locationQuery.isFetching}
              getOptionLabel={(option) => option ?? ""}
              isOptionEqualToValue={(option, value) => option === value}
              onInputChange={(_, value) => {
                debouncedSearch('location', value);
              }}
              placeholder="Search for a location..."
            />
          </Grid>
        </Grid>

        {/* Filter action buttons */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleClearAll}
            disabled={isLoading}
          >
            Clear Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<Filter size={18} />}
            type="submit"
            disabled={isLoading}
          >
            Apply Filters
          </Button>
        </Box>
      </Box>

      {/* Active filters display */}
      {selectedFilters && Object.values(selectedFilters).some(v => v) && (
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
          {selectedFilters.company && (
            <Chip
              label={`Company: ${typeof selectedFilters.company === 'string' ?
                selectedFilters.company :
                (selectedFilters.company as FilterOption).name || selectedFilters.company}`}
              onDelete={() => onClearFilter('company')}
              color="primary"
              size="small"
            />
          )}
          {selectedFilters.position && (
            <Chip
              label={`Position: ${typeof selectedFilters.position === 'string' ?
                selectedFilters.position :
                (selectedFilters.position as FilterOption).name || selectedFilters.position}`}
              onDelete={() => onClearFilter('position')}
              color="primary"
              size="small"
            />
          )}
          {selectedFilters.location && (
            <Chip
              label={`Location: ${typeof selectedFilters.location === 'string' ?
                selectedFilters.location :
                (selectedFilters.location as FilterOption).name || selectedFilters.location}`}
              onDelete={() => onClearFilter('location')}
              color="primary"
              size="small"
            />
          )}
        </Stack>
      )}
    </Box>
  );
};

export default FilterForm;
