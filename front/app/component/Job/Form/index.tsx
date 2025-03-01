import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type Job } from '#/hooks/useJobParser';
import { useJobSubmissionStore } from '#/stores/useJobSubmissionStore';
import {
  Paper,
  Grid,
  Typography,
  Divider,
  Box,
  Stack,
  TextField
} from '@mui/material';
import {
  DollarSign,
  Calendar,
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
  const [companySearch, setCompanySearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [positionSearch, setPositionSearch] = useState('');

  // Track which fields have been touched for live validation
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const {
    control,
    handleSubmit,
    reset,
    watch,
    getValues,
    trigger,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<Position>({
    resolver: zodResolver(PositionSchema),
    mode: 'onChange', // Enable validation on change
    defaultValues: {
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
    }
  });

  const compensation = watch('compensation');
  const workHours = watch('work_hours');
  const selectedCompany = watch('company');
  const weeklyPay = compensation !== null ? compensation * workHours : null;

  // Watch all fields for validation
  const watchAllFields = watch();

  // Function to mark a field as touched
  const markFieldAsTouched = (fieldName: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  // Validate fields when they're touched or their values change
  useEffect(() => {
    const validateTouchedFields = async () => {
      const fieldsToValidate = Object.keys(touchedFields).filter(field => touchedFields[field]);
      if (fieldsToValidate.length > 0) {
        await trigger(fieldsToValidate as any);
      }
    };

    validateTouchedFields();
  }, [watchAllFields, touchedFields, trigger]);

  // Debounced search function for company
  const debouncedCompanySearch = useCallback(
    debounce((searchText) => {
      setCompanySearch(searchText);
    }, 500),
    []
  );

  const debouncedPositionSearch = useCallback(
    debounce((searchText) => {
      setPositionSearch(searchText);
    }, 500),
    []
  );

  const debouncedLocationSearch = useCallback(
    debounce((searchText) => {
      setLocationSearch(searchText);
    }, 500),
    []
  );

  const companyQuery = useQuery({
    ...getAutocompleteCompanyOptions({
      query: { comp: companySearch }
    }),
    enabled: companySearch.length >= 3,
    placeholderData: (previousData) => previousData
  });

  const positionQuery = useQuery({
    ...getAutocompletePositionOptions({
      query: {
        comp: selectedCompany || '',
        pos: positionSearch
      }
    }),
    enabled: !!selectedCompany && positionSearch.length >= 3,
    placeholderData: (previousData) => previousData
  });

  const locationQuery = useQuery({
    ...getAutocompleteLocationOptions({
      query: {
        loc: locationSearch || '',
      }
    }),
    enabled: locationSearch.length >= 3,
    placeholderData: (previousData) => previousData
  });

  const onSubmit = async (data: Position) => {
    // Mark all fields as touched before submission
    const allFields = Object.keys(PositionSchema.shape);
    const allTouched = allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouchedFields(allTouched);

    // Validate all fields
    const isValid = await trigger();

    if (isValid) {
      if (editIndex !== undefined) {
        updateSubmission(editIndex, data as Submission);
      } else {
        addSubmission(data as Submission);
      }

      reset();
      setTouchedFields({});
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
                markFieldAsTouched('company');
                debouncedCompanySearch(value);
              }}
              onBlur={() => markFieldAsTouched('company')}
              placeholder="Search for a company..."
              rules={{ required: 'Company is required' }}
              error={touchedFields.company && !!errors.company}
              helperText={touchedFields.company && errors?.company?.message ? errors.company.message : ""}
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
                markFieldAsTouched('position');
                debouncedPositionSearch(value);
              }}
              onBlur={() => markFieldAsTouched('position')}
              placeholder="Search for a position..."
              disabled={!selectedCompany}
              rules={{ required: 'Position is required' }}
              error={touchedFields.position && !!errors.position}
              helperText={touchedFields.position && errors?.position?.message ? errors.position.message : ""}
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
                markFieldAsTouched('location');
                debouncedLocationSearch(value);
              }}
              onBlur={() => markFieldAsTouched('location')}
              placeholder="Search for a city..."
              rules={{ required: 'Location is required' }}
              error={touchedFields.location && !!errors.location}
              helperText={touchedFields.location && errors?.location?.message ? errors.location.message : ""}
              freeSolo
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DropdownField
              name="program_level"
              label="Program Level"
              control={control}
              options={PROGRAM_LEVELS}
              onBlur={() => markFieldAsTouched('program_level')}
              error={touchedFields.program_level && !!errors.program_level}
              helperText={touchedFields.program_level && errors.program_level?.message}
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
              onBlur={() => markFieldAsTouched('coop_cycle')}
              error={touchedFields.coop_cycle && !!errors.coop_cycle}
              helperText={touchedFields.coop_cycle && errors.coop_cycle?.message}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <DropdownField
              name="coop_year"
              label="Co-op Year"
              control={control}
              options={COOP_YEARS}
              onBlur={() => markFieldAsTouched('coop_year')}
              error={touchedFields.coop_year && !!errors.coop_year}
              helperText={touchedFields.coop_year && errors.coop_year?.message}
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
              onBlur={() => markFieldAsTouched('year')}
              error={touchedFields.year && !!errors.year}
              helperText={touchedFields.year && errors.year?.message}
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
              onBlur={() => markFieldAsTouched('compensation')}
              error={touchedFields.compensation && !!errors.compensation}
              helperText={touchedFields.compensation && errors.compensation?.message}
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
              onBlur={() => markFieldAsTouched('work_hours')}
              valueLabelFormat={(value) => `${value}h`}
              marks={[
                { value: 20, label: '20h' },
                { value: 40, label: '40h' },
                { value: 60, label: '60h' }
              ]}
              error={touchedFields.work_hours && !!errors.work_hours}
              helperText={touchedFields.work_hours && errors.work_hours?.message}
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
              onBlur={() => markFieldAsTouched('other_compensation')}
              error={touchedFields.other_compensation && !!errors.other_compensation}
              helperText={touchedFields.other_compensation && errors.other_compensation?.message}
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
              onBlur={() => markFieldAsTouched('details')}
              error={touchedFields.details && !!errors.details}
              helperText={touchedFields.details && errors.details?.message}
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
