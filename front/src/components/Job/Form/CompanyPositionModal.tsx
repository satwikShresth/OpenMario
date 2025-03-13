import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, Briefcase } from 'lucide-react';
import ModalAutocompleteField from './ModalAutocompleteField';

// Create a schema for company/position submission
const CompanyPositionSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position name is required"),
});

export type CompanyPosition = z.infer<typeof CompanyPositionSchema>;

interface CompanyPositionModalProps {
  open: boolean;
  onClose: () => void;
  initialCompany?: string;
  companyOptions: string[];
  companyLoading?: boolean;
  positionOptions: string[];
  positionLoading?: boolean;
  onCompanyInputChange: (value: string) => void;
  onPositionInputChange: (value: string) => void;
  onSubmit: (data: CompanyPosition) => Promise<void>;
}

const CompanyPositionModal: React.FC<CompanyPositionModalProps> = ({
  open,
  onClose,
  initialCompany = '',
  companyOptions,
  companyLoading = false,
  positionOptions,
  positionLoading = false,
  onCompanyInputChange,
  onPositionInputChange,
  onSubmit
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CompanyPosition>({
    resolver: zodResolver(CompanyPositionSchema),
    mode: 'onBlur',
    defaultValues: {
      company: initialCompany,
      position: ''
    }
  });

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: CompanyPosition) => {
    try {
      await onSubmit(data);
      console.log(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to submit company/position', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ p: 4 }}
    >
      <DialogTitle>
        <Typography variant="h6">Add New Company & Position</Typography>
      </DialogTitle>
      <Divider sx={{ mb: 1 }} />
      <DialogContent>
        <Box component="form" noValidate onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ModalAutocompleteField
                name="company"
                label="Company Name"
                control={control}
                icon={<Building size={18} />}
                options={companyOptions}
                loading={companyLoading}
                onInputChange={(_, value) => onCompanyInputChange(value)}
                placeholder="Enter company name..."
                error={!!errors.company}
                helperText={errors?.company?.message || ""}
              />
            </Grid>
            <Grid item xs={12}>
              <ModalAutocompleteField
                name="position"
                label="Position Title"
                control={control}
                icon={<Briefcase size={18} />}
                options={positionOptions}
                loading={positionLoading}
                onInputChange={(_, value) => onPositionInputChange(value)}
                placeholder="Enter position title..."
                error={!!errors.position}
                helperText={errors?.position?.message || ""}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, mb: 1, mr: 1 }} >
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyPositionModal;
