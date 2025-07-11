import React, { useCallback, useState } from 'react';
import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Divider,
   Grid,
   Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, Building } from 'lucide-react';
import ModalAutocompleteField from './ModalAutocompleteField';
import { useQuery } from '@tanstack/react-query';
import {
   getAutocompleteCompanyOptions,
   getAutocompletePositionOptions,
} from '#client/react-query.gen';
import { debounce } from 'lodash';

// Create a schema for company/position submission
const CompanyPositionSchema = z.object({
   company: z.string().min(3, 'Company name is required'),
   position: z.string().min(3, 'Position name is required'),
});

export type CompanyPosition = z.infer<typeof CompanyPositionSchema>;

interface CompanyPositionModalProps {
   open: boolean;
   onClose: () => void;
   initialCompany?: string;
   initialPosition?: string;
   onSubmit: (data: CompanyPosition, onReset, onClose) => Promise<void>;
   disabledCompany: boolean;
   disabledPosition: boolean;
}

const CompanyPositionModal: React.FC<CompanyPositionModalProps> = ({
   open,
   onClose,
   initialCompany = '',
   initialPosition = '',
   onSubmit,
   disabledCompany = false,
   disabledPosition = false,
}) => {
   const {
      control,
      handleSubmit,
      reset,
      watch,
      formState: { errors, isSubmitting },
   } = useForm<CompanyPosition>({
      resolver: zodResolver(CompanyPositionSchema),
      mode: 'onBlur',
      defaultValues: {
         company: initialCompany,
         position: initialPosition,
      },
   });

   const handleCancel = () => {
      reset();
      onClose();
   };

   const handleFormSubmit = async (data: CompanyPosition) => {
      await onSubmit(data, reset, onClose);
   };

   const company = watch('company');
   const position = watch('position');

   const debouncedSearch = useCallback(
      debounce((field: string, value: string) => {
         setSearches((prev) => ({ ...prev, [field]: value }));
      }, 300),
      [],
   );

   const companyQuery = useQuery({
      ...getAutocompleteCompanyOptions({
         query: { comp: company },
      }),
      enabled: company?.length >= 3,
      staleTime: 30000,
      placeholderData: (previousData) => previousData,
   });

   const positionQuery = useQuery({
      ...getAutocompletePositionOptions({
         query: {
            comp: '*',
            pos: position,
         },
      }),
      enabled: position?.length >= 3,
      staleTime: 30000,
      placeholderData: (previousData) => previousData,
   });

   return (
      <Dialog
         open={open}
         onClose={onClose}
         maxWidth='sm'
         fullWidth
         sx={{ p: 4 }}
      >
         {/* Fixed the DialogTitle to prevent h6 inside h2 */}
         <DialogTitle component='div'>
            Add New Company & Position
         </DialogTitle>
         <Divider sx={{ mb: 1 }} />
         <DialogContent>
            <Box
               component='form'
               noValidate
               onSubmit={handleSubmit(handleFormSubmit)}
            >
               <Grid container spacing={3}>
                  <Grid item xs={12}>
                     <ModalAutocompleteField
                        name='company'
                        label='Company Name'
                        control={control}
                        icon={<Building size={18} />}
                        options={companyQuery?.data?.map((item) => item.name) || []}
                        loading={companyQuery?.isLoading}
                        //onInputChange={(value) => debouncedSearch('company', value)}
                        placeholder='Enter company name...'
                        error={!!errors.company}
                        helperText={errors?.company?.message || ''}
                        disabled={disabledCompany}
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <ModalAutocompleteField
                        name='position'
                        label='Position Title'
                        control={control}
                        icon={<Briefcase size={18} />}
                        options={positionQuery?.data?.map((item) => item.name) || []}
                        loading={positionQuery?.isFetching}
                        //onInputChange={(value) => debouncedSearch('position', value)}
                        placeholder='Enter position title...'
                        error={!!errors.position}
                        helperText={errors?.position?.message || ''}
                        disabled={disabledPosition}
                     />
                  </Grid>
               </Grid>
            </Box>
         </DialogContent>
         <DialogActions sx={{ p: 2, mb: 1, mr: 1 }}>
            <Button onClick={handleCancel} color='inherit'>
               Cancel
            </Button>
            <Button
               onClick={handleSubmit(handleFormSubmit)}
               variant='contained'
               color='primary'
               disabled={isSubmitting}
            >
               {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
         </DialogActions>
      </Dialog>
   );
};

export default CompanyPositionModal;
