import React, { useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Box, Drawer, Typography, Button, TextField, Divider, IconButton, InputAdornment, Chip, Grid, CircularProgress } from '@mui/material';
import { X, Filter, RefreshCw, Building, Briefcase, MapPin } from 'lucide-react';
import { type Table } from '@tanstack/react-table';
import { MultiselectFieldWithIcon as AutocompleteFieldWithIcon } from './Job/Form/fields/';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { getAutocompleteCompanyOptions, getAutocompletePositionOptions, getAutocompleteLocationOptions } from '#client/react-query.gen';
import type { FilterOption, Submission } from '#/types';

// Updated interface for query filter data to support arrays
export interface FilterFormData {
  company: string | null;
  position: string | null;
  location: string | null;
}

interface FilterDrawerProps {
  table: Table<Submission>;
  filterOptions: FilterOption[];
  open: boolean;
  onClose: () => void;
  columnFilters: any[];
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  clearAllFilters: () => void;
  queryFilters?: {
    company: string[];
    position: string[];
    location: string[];
  };
  onQueryFilterSubmit: (data: any) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  onClearQueryFilter?: (field: keyof FilterFormData) => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  table,
  filterOptions,
  open,
  onClose,
  columnFilters,
  globalFilter,
  setGlobalFilter,
  clearAllFilters,
  // Query filter props
  queryFilters,
  onQueryFilterSubmit,
  isLoading = false,
  onRefresh = () => { },
  onClearQueryFilter = () => { }
}) => {
  const handleFilterChange = (id: string, value: any) => {
    table.getColumn(id)?.setFilterValue(value);
  };

  const activeFiltersCount = columnFilters.length + (globalFilter ? 1 : 0);

  const methods = useForm<FilterFormData>({
    defaultValues: {
      company: null,
      position: null,
      location: null
    }
  });

  const { control, handleSubmit, reset, watch } = methods;

  const company = watch('company');
  const position = watch('position');
  const location = watch('location');

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

  // Query hooks for autocomplete
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

  const handleAddFilter = () => {
    if (company) {
      onQueryFilterSubmit({
        field: 'company',
        value: company
      });
    }

    if (position) {
      onQueryFilterSubmit({
        field: 'position',
        value: position
      });
    }

    if (location) {
      onQueryFilterSubmit({
        field: 'location',
        value: location
      });
    }

    // Reset the form after submission
    reset();
  };

  // Check if we have any active query filters
  const hasActiveQueryFilters = queryFilters && (
    (queryFilters.company && queryFilters.company.length > 0) ||
    (queryFilters.position && queryFilters.position.length > 0) ||
    (queryFilters.location && queryFilters.location.length > 0)
  );

  // Calculate total active filters 
  const queryFiltersCount = queryFilters ?
    (queryFilters.company?.length || 0) +
    (queryFilters.position?.length || 0) +
    (queryFilters.location?.length || 0) : 0;

  const totalFiltersCount = activeFiltersCount + queryFiltersCount;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 500, p: 3 }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Filters</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
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
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </Box>

      {/* Global Search */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Search All Columns</Typography>
        <TextField
          placeholder="Search all columns"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Filter size={18} />
              </InputAdornment>
            ),
            endAdornment: globalFilter && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setGlobalFilter('')}
                  edge="end"
                >
                  <X size={16} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Query Filter Section */}
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

              <Grid item xs={12}>
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
                />
              </Grid>

              <Grid item xs={12}>
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

            {/* Add filter button */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleAddFilter}
                disabled={isLoading || (!company && !position && !location)}
                size="small"
              >
                Add Filter
              </Button>
            </Box>
          </form>
        </FormProvider>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Active Filters */}
      {totalFiltersCount > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Active Filters</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {/* Global filter chip */}
            {globalFilter && (
              <Chip
                label={`All: ${globalFilter}`}
                size="small"
                onDelete={() => setGlobalFilter('')}
              />
            )}

            {/* Column filters chips */}
            {columnFilters.map(filter => {
              const option = filterOptions.find(opt => opt.id === filter.id);
              let label = `${option?.label || filter.id}: `;

              if (Array.isArray(filter.value)) {
                if (filter.value.length === 2) {
                  label += `$${filter.value[0]} - $${filter.value[1]}`;
                }
              } else {
                label += filter.value;
              }

              return (
                <Chip
                  key={filter.id}
                  label={label}
                  size="small"
                  onDelete={() => {
                    table.getColumn(filter.id as string)?.setFilterValue(undefined);
                  }}
                />
              );
            })}

            {/* Query filter chips */}
            {queryFilters && (
              <>
                {queryFilters.company && queryFilters.company.map(company => (
                  <Chip
                    key={`company-${company}`}
                    label={`Company: ${company}`}
                    onDelete={() => onQueryFilterSubmit({ field: 'company', value: company, remove: true })}
                    color="primary"
                    size="small"
                  />
                ))}

                {queryFilters.position && queryFilters.position.map(position => (
                  <Chip
                    key={`position-${position}`}
                    label={`Position: ${position}`}
                    onDelete={() => onQueryFilterSubmit({ field: 'position', value: position, remove: true })}
                    color="primary"
                    size="small"
                  />
                ))}

                {queryFilters.location && queryFilters.location.map(location => (
                  <Chip
                    key={`location-${location}`}
                    label={`Location: ${location}`}
                    onDelete={() => onQueryFilterSubmit({ field: 'location', value: location, remove: true })}
                    color="primary"
                    size="small"
                  />
                ))}
              </>
            )}
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Column Filters */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Column Filters</Typography>

        {filterOptions.map((option) => {
          const column = table.getColumn(option.id);
          if (!column) return null;

          const currentFilterValue = column.getFilterValue();

          return (
            <Box key={option.id} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>{option.label}</Typography>

              {option.type === 'text' && (
                <TextField
                  value={currentFilterValue || ''}
                  onChange={e => handleFilterChange(option.id, e.target.value)}
                  placeholder={`Filter by ${option.label.toLowerCase()}`}
                  fullWidth
                  size="small"
                />
              )}

              {option.type === 'select' && option.options && (
                <TextField
                  select
                  value={currentFilterValue || ''}
                  onChange={e => handleFilterChange(option.id, e.target.value)}
                  fullWidth
                  size="small"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Any</option>
                  {option.options.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </TextField>
              )}

              {option.type === 'number' && (
                <TextField
                  type="number"
                  value={currentFilterValue || ''}
                  onChange={e => handleFilterChange(option.id, e.target.value ? Number(e.target.value) : undefined)}
                  placeholder={`Filter by ${option.label.toLowerCase()}`}
                  fullWidth
                  size="small"
                />
              )}

              {option.type === 'range' && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    type="number"
                    value={(currentFilterValue as number[] || [])[0] || ''}
                    onChange={e => {
                      const min = e.target.value ? Number(e.target.value) : undefined;
                      const current = (currentFilterValue as number[] || [undefined, undefined]);
                      handleFilterChange(option.id, [min, current[1]]);
                    }}
                    placeholder="Min"
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                  <Typography variant="body2">to</Typography>
                  <TextField
                    type="number"
                    value={(currentFilterValue as number[] || [])[1] || ''}
                    onChange={e => {
                      const max = e.target.value ? Number(e.target.value) : undefined;
                      const current = (currentFilterValue as number[] || [undefined, undefined]);
                      handleFilterChange(option.id, [current[0], max]);
                    }}
                    placeholder="Max"
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto', pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Button
          onClick={() => {
            clearAllFilters();
            // Clear all query filters
            if (queryFilters) {
              if (queryFilters.company.length > 0) onClearQueryFilter('company');
              if (queryFilters.position.length > 0) onClearQueryFilter('position');
              if (queryFilters.location.length > 0) onClearQueryFilter('location');
            }
          }}
          color="inherit"
        >
          Clear All Filters
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          Apply Filters
        </Button>
      </Box>
    </Drawer>
  );
};

export default FilterDrawer;
