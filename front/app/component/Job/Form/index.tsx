import React from 'react';
import { useForm } from 'react-hook-form';
import { type Job } from '#/hooks/useJobParser';
import { useJobSubmissionStore } from '#/stores/useJobSubmissionStore';
import {
  Paper,
  Grid,
  Typography,
  Divider,
  Box,
  Stack
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
import type { Submission } from '#client/types.gen';
import { TextFieldWithIcon, DropdownField, SliderField, CompensationField } from './fields';
import { SectionHeader } from './SectionHeader';
import { FormActions } from './FormActions';
import { COOP_CYCLES, COOP_YEARS, PROGRAM_LEVELS } from '#/types';


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

  const getInitialValues = (): Submission => {
    if (defaultValues) return defaultValues;

    if (jobData) {
      let compensation = null;
      if (jobData.hourly_wage) {
        const match = jobData.hourly_wage.match(/\$(\d+\.\d+)/);
        if (match) compensation = parseFloat(match[1]);
      }

      let workHours = 40;
      if (jobData.hours_per_week) {
        workHours = parseInt(jobData.hours_per_week, 10) || 40;
      }

      return {
        company: jobData.employer || '',
        position: jobData.position || '',
        location: jobData.location || '',
        program_level: 'Undergraduate',
        work_hours: workHours,
        coop_cycle: 'Fall/Winter',
        coop_year: '1st',
        year: new Date().getFullYear(),
        compensation: compensation,
        other_compensation: jobData.other_compensation || null,
        details: `Employer ID: ${jobData?.employer_id || 'N/A'}, Position ID: ${jobData?.position_id || 'N/A'}, Job Length: ${jobData?.job_length || 'N/A'}`
      };
    }

    // Default values based on schema
    return {
      company: '',
      position: '',
      location: '',
      program_level: 'Undergraduate',
      work_hours: 40,
      coop_cycle: 'Fall/Winter',
      coop_year: '1st',
      year: new Date().getFullYear(),
      compensation: null,
      other_compensation: null,
      details: null
    };
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<Submission>({
    defaultValues: getInitialValues()
  });

  const compensation = watch('compensation');
  const workHours = watch('work_hours');
  const weeklyPay = compensation !== null ? compensation * workHours : null;

  const onSubmit = (data: Submission) => {
    if (editIndex !== undefined) {
      updateSubmission(editIndex, data);
    } else {
      addSubmission(data);
    }

    reset();
    if (onCancel) onCancel();
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Typography variant="h6" gutterBottom>
          {editIndex !== undefined ? 'Edit Job Submission' : 'Add New Job Submission'}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <TextFieldWithIcon
              name="company"
              label="Company Name"
              control={control}
              rules={{ required: 'Company name is required' }}
              icon={<Building size={18} />}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextFieldWithIcon
              name="position"
              label="Position"
              control={control}
              rules={{ required: 'Position is required' }}
              icon={<Briefcase size={18} />}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextFieldWithIcon
              name="location"
              label="Location"
              control={control}
              rules={{ required: 'Location is required' }}
              icon={<MapPin size={18} />}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DropdownField
              name="program_level"
              label="Program Level"
              control={control}
              options={PROGRAM_LEVELS}
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
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <DropdownField
              name="coop_year"
              label="Co-op Year"
              control={control}
              options={COOP_YEARS}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextFieldWithIcon
              name="year"
              label="Year"
              type="number"
              control={control}
              rules={{ required: 'Year is required' }}
              icon={<Calendar size={18} />}
              inputProps={{ min: 2000, max: 2050 }}
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
              min={10}
              max={60}
              step={1}
              currentValue={workHours}
              valueLabelFormat={(value) => `${value}h`}
              marks={[
                { value: 20, label: '20h' },
                { value: 40, label: '40h' },
                { value: 60, label: '60h' }
              ]}
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
            />
          </Grid>
        </Grid>

        <FormActions onCancel={onCancel} isEditing={editIndex !== undefined} />
      </Box>
    </Paper>
  );
};

export default JobForm;
