import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Job } from '#/hooks/useJobParser';
import { useJobSubmissionStore } from '#/stores/useJobSubmissionStore';
import {
  Paper,
  Grid,
  Typography,
  Divider,
  Box,
  Stack,
} from '@mui/material';
import {
  DollarSign,
  Briefcase,
  MapPin,
  Building,
  Info,
  Clock
} from 'lucide-react';
import debounce from 'lodash/debounce';
import { useQuery } from '@tanstack/react-query';
import type { Submission } from '#client/types.gen';
import {
  AutocompleteFieldWithIcon,
  TextFieldWithIcon,
  DropdownField,
  SliderField,
  CompensationField,
  DatePickerField,
} from './fields';
import { SectionHeader } from './SectionHeader';
import { FormActions } from './FormActions';
import { COOP_CYCLES, COOP_YEARS, PROGRAM_LEVELS } from '#/types';
import {
  getAutocompleteCompanyOptions,
  getAutocompleteLocationOptions,
  getAutocompletePositionOptions
} from '#client/react-query.gen';
import { PositionSchema, type Position } from '#/utils/validators';

type JobFormProps = {
  editIndex?: number;
  defaultValues?: Submission;
  jobData?: Job;
  onCancel?: () => void;
};

const JobForm: React.FC<JobFormProps> = ({
  editIndex,
  defaultValues,
  jobData,
  onCancel
}) => {
  const { addSubmission, updateSubmission } = useJobSubmissionStore();

  // Initialize form default values
  const formDefaultValues = useMemo(() => ({
    company: jobData?.employer || '',
    position: jobData?.position || '',
    location: jobData?.location || '',
    program_level: jobData?.program_level || 'Undergraduate',
    work_hours: parseInt(jobData?.hours_per_week || "40"),
    coop_cycle: jobData?.coop_cycle || 'Fall/Winter',
    coop_year: jobData?.coop_year || '1st',
    year: jobData?.year || new Date().getFullYear(),
    compensation: parseFloat(jobData?.hourly_wage || "10.00"),
    other_compensation: jobData?.other_compensation || '',
    details: `Employer ID: ${jobData?.employer_id || 'N/A'}, Position ID: ${jobData?.position_id || 'N/A'}, Job Length: ${jobData?.job_length || 'N/A'}, Coop Round: ${jobData?.coop_round || 'N/A'}`
  }), [jobData]);

  // Only validate on submit, not onChange
  const {
    control,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<Position>({
    resolver: zodResolver(PositionSchema),
    mode: 'onBlur', // Only validate on blur, not onChange
    defaultValues: formDefaultValues
  });

  // Search state with optimized debounce
  const [searches, setSearches] = useState({
    company: '',
    position: '',
    location: ''
  });

  // Only watch specific fields that need reactive updates
  const compensation = watch('compensation');
  const workHours = watch('work_hours');
  const selectedCompany = watch('company');

  // Calculate derived values
  const weeklyPay = useMemo(() =>
    compensation !== null ? compensation * workHours : null
    , [compensation, workHours]);

  // Create a single debounced search function
  const debouncedSearch = useCallback(
    debounce((field: string, value: string) => {
      setSearches(prev => ({ ...prev, [field]: value }));
    }, 300),
    []
  );

  // Optimized queries with proper dependency tracking
  const companyQuery = useQuery({
    ...getAutocompleteCompanyOptions({
      query: { comp: searches.company }
    }),
    enabled: searches.company.length >= 3,
    staleTime: 30000, // Cache results for 30 seconds
    placeholderData: (previousData) => previousData
  });

  // Extract company name if it's an object
  const companyName = typeof selectedCompany === 'object' && selectedCompany !== null
    ? selectedCompany.name
    : selectedCompany;

  const positionQuery = useQuery({
    ...getAutocompletePositionOptions({
      query: {
        comp: companyName || '',
        pos: searches.position
      }
    }),
    enabled: !!selectedCompany && searches.position.length >= 3,
    staleTime: 30000,
    placeholderData: (previousData) => previousData
  });

  const locationQuery = useQuery({
    ...getAutocompleteLocationOptions({
      query: {
        loc: searches.location || '',
      }
    }),
    enabled: searches.location.length >= 3,
    staleTime: 30000,
    placeholderData: (previousData) => previousData
  });

  const onSubmit = async (data: Position) => {
    // Validate all fields only on submit
    const isValid = await trigger();

    if (isValid) {
      if (editIndex !== undefined) {
        updateSubmission(editIndex, data as Submission);
      } else {
        addSubmission(data as Submission);
      }

      reset();
      if (onCancel) onCancel();
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Typography variant="h6" gutterBottom>
          {editIndex !== undefined ? 'Edit Job Submission' : 'Add New Job Submission'}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <AutocompleteFieldWithIcon<{ id: string, name: string }>
              name="company"
              label="Company"
              control={control}
              icon={<Building size={18} />}
              options={companyQuery?.data || []}
              loading={companyQuery?.isLoading}
              getOptionLabel={(option) => option?.name ?? ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onInputChange={(_, value) => {
                debouncedSearch('company', value);
              }}
              placeholder="Search for a company..."
              rules={{ required: 'Company is required' }}
              error={!!errors.company}
              helperText={errors?.company?.message || ""}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <AutocompleteFieldWithIcon<{ id: string, name: string }>
              name="position"
              label="Position"
              control={control}
              icon={<Briefcase size={18} />}
              options={positionQuery?.data || []}
              loading={positionQuery.isFetching}
              getOptionLabel={(option) => option?.name ?? ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onInputChange={(_, value) => {
                debouncedSearch('position', value);
              }}
              placeholder="Search for a position..."
              disabled={!selectedCompany}
              rules={{ required: 'Position is required' }}
              error={!!errors.position}
              helperText={errors?.position?.message || ""}
              freeSolo
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <AutocompleteFieldWithIcon<{ id: string, name: string }>
              name="location"
              label="Location"
              control={control}
              icon={<MapPin size={18} />}
              options={locationQuery?.data || []}
              loading={locationQuery.isFetching}
              getOptionLabel={(option) => option?.name ?? ""}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              onInputChange={(_, value) => {
                debouncedSearch('location', value);
              }}
              placeholder="Search for a city..."
              rules={{ required: 'Location is required' }}
              error={!!errors.location}
              helperText={errors?.location?.message || ""}
              freeSolo
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DropdownField
              name="program_level"
              label="Program Level"
              control={control}
              options={PROGRAM_LEVELS}
              error={!!errors.program_level}
              helperText={errors.program_level?.message}
            />
          </Grid>

          {/* Work Period Information */}
          <Grid item xs={12}>
            <SectionHeader title="Co-op Details" />
          </Grid>

          <Grid item xs={12} md={4}>
            <DropdownField
              name="coop_cycle"
              label="Co-op Cycle"
              control={control}
              options={COOP_CYCLES}
              error={!!errors.coop_cycle}
              helperText={errors.coop_cycle?.message}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <DropdownField
              name="coop_year"
              label="Co-op Year"
              control={control}
              options={COOP_YEARS}
              error={!!errors.coop_year}
              helperText={errors.coop_year?.message}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <DatePickerField
              name="year"
              label="Year"
              control={control}
              views={['year']}
              openTo="year"
              minYear={2005}
              error={!!errors.year}
              helperText={errors.year?.message}
            />
          </Grid>

          {/* Compensation Information */}
          <Grid item xs={12}>
            <SectionHeader title="Compensation Details" />
          </Grid>

          <Grid item xs={12} md={6}>
            <CompensationField
              control={control}
              value={compensation}
              error={!!errors.compensation}
              helperText={errors.compensation?.message}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, mt: 0.2 }}>
              <Clock size={18} />
              <Typography gutterBottom variant="body1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                {"Work Hours"}:
                <Box component="span" sx={{ ml: 1 }}>
                  {`${workHours}h`}
                </Box>
              </Typography>
            </Stack>
            <SliderField
              name="work_hours"
              control={control}
              label="Work Hours"
              min={5}
              max={60}
              step={1}
              currentValue={workHours}
              valueLabelFormat={(value) => `${value}h`}
              marks={[
                { value: 20, label: '20h' },
                { value: 40, label: '40h' },
                { value: 60, label: '60h' }
              ]}
              error={!!errors.work_hours}
              helperText={errors.work_hours?.message}
              footer={
                weeklyPay !== null && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'medium' }}>
                    Weekly Salary: ${weeklyPay.toFixed(2)}
                  </Typography>
                )
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextFieldWithIcon
              name="other_compensation"
              label="Other Compensation"
              control={control}
              icon={<DollarSign size={18} />}
              placeholder="E.g., Benefits, transportation, housing allowance"
              nullable={true}
              error={!!errors.other_compensation}
              helperText={errors.other_compensation?.message}
            />
          </Grid>

          {/* Additional Details */}
          <Grid item xs={12}>
            <TextFieldWithIcon
              name="details"
              label="Additional Details"
              control={control}
              icon={<Info size={18} />}
              multiline={true}
              rows={3}
              placeholder="Any additional information about the position"
              nullable={true}
              error={!!errors.details}
              helperText={errors.details?.message}
            />
          </Grid>
        </Grid>

        <FormActions
          onCancel={onCancel}
          isEditing={editIndex !== undefined}
          isSubmitting={isSubmitting}
          hasErrors={Object.keys(errors).length > 0}
        />
      </Box>
    </Paper>
  );
};

export default JobForm;
