import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
   Backdrop,
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Fade,
   Grid2 as Grid,
   IconButton,
   Paper,
   Step,
   StepContent,
   StepLabel,
   Stepper,
   TextField,
   Tooltip,
   Typography,
} from '@mui/material';
import {
   ArrowLeft,
   ArrowRight,
   CheckCircle,
   Clipboard,
   ExternalLink,
   FileUp,
   ImagePlus,
   Upload,
   X,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { type CommonData, COOP_CYCLES, COOP_ROUND, COOP_YEARS, PROGRAM_LEVELS } from '#/types';
import { DatePickerField, DropdownField } from './Job/Form/fields';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadSchema } from '#/utils/validators';

interface FileUploadProps {
   onFileSelect: (file: File, common: CommonData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [activeStep, setActiveStep] = useState(0);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [bannerLinkClicked, setBannerLinkClicked] = useState(false);

   const {
      control,
      handleSubmit,
      watch,
      reset,
      setFocus,
      formState: { errors, isValid, touchedFields },
   } = useForm<CommonData>({
      resolver: zodResolver(UploadSchema),
      defaultValues: {
         coop_year: COOP_YEARS[0],
         coop_round: COOP_ROUND[0],
         coop_cycle: COOP_CYCLES[0],
         program_level: PROGRAM_LEVELS[0],
         year: '',
      },
      mode: 'onChange',
   });

   const year = watch('year');
   const coop_round = watch('coop_round');
   const coop_cycle = watch('coop_cycle');

   useEffect(() => {
      if (isValid) {
         setActiveStep((previousActiveStep) => previousActiveStep + 1);
      }
   }, [isValid, setActiveStep]);

   useEffect(() => {
      if (activeStep === 0) {
         setFocus('coop_year');
      }
   }, [activeStep, setFocus]);

   const previewUrl = useMemo(
      () =>
         `https://banner.drexel.edu/duprod/hwczksrmk.P_StudentReqMaintRanking?i_user_type=S&i_begin_term=${year}${
            COOP_CYCLES.indexOf(coop_cycle) + 1
         }5&i_cycle=${coop_round}&i_mode=S&i_recs_per_page=20`,
      [year, coop_cycle, coop_round],
   );

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
         const file = e.target.files[0];
         if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
         } else {
            alert('Please select an image file');
         }
      }
   };

   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
         const file = e.dataTransfer.files[0];
         if (file.type.startsWith('image/')) {
            setSelectedFile(file);
         } else {
            alert('Please select an image file');
         }
      }
   };

   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
   };

   const triggerFileSelect = () => {
      if (fileInputRef.current) {
         fileInputRef.current.click();
      }
   };

   const onSubmit = (data: CommonData) => {
      if (selectedFile) {
         onFileSelect(selectedFile, data);
         closeModal();
      } else {
         alert('Please select a file');
      }
   };

   const handleOpenUrl = () => {
      window.open(previewUrl, '_blank', 'noopener,noreferrer,nofollow');

      setTimeout(() => {
         if (activeStep === 2) {
            setBannerLinkClicked(false);
            setActiveStep((previousActiveStep) => previousActiveStep + 1);
         }
      }, 800);
   };

   const handleBannerLinkClick = () => {
      setBannerLinkClicked(true);
      window.open(
         'https://bannersso.drexel.edu/ssomanager/c/SSB?pkg=bwszkfrag.P_DisplayFinResponsibility%3Fi_url%3Dhwczksrmp.P_StudentRequestMaintStud',
         '_blank',
         'noopener,noreferrer,nofollow',
      );

      setTimeout(() => {
         if (activeStep === 1) {
            setActiveStep((previousActiveStep) => previousActiveStep + 1);
         }
      }, 800);
   };

   const handleBack = () => {
      setActiveStep(
         (prevActiveStep) => prevActiveStep - (prevActiveStep === 3 ? 2 : 1),
      );
   };

   const closeModal = () => {
      setIsModalOpen(false);
      setActiveStep(0);
      setSelectedFile(null);
      setBannerLinkClicked(false);
      reset();
   };

   const steps = [
      {
         label: 'Fill Co-op Information',
         activeLabel: 'Fill Co-op Information',
         content: (
            <Box>
               <Grid container columnSpacing={3} rowSpacing={2} sx={{ mt: 2 }}>
                  <Grid item size={{ xs: 12, md: 2 }}>
                     <DropdownField<CommonData>
                        name='coop_year'
                        label='Coop Year'
                        control={control}
                        options={COOP_YEARS}
                     />
                  </Grid>

                  <Grid item size={{ xs: 12, md: 1.5 }}>
                     <DropdownField<CommonData>
                        name='coop_round'
                        label='Cycle'
                        control={control}
                        options={COOP_ROUND}
                     />
                  </Grid>

                  <Grid item size={{ xs: 12, md: 1.9 }}>
                     <DatePickerField
                        name='year'
                        label='Year'
                        control={control}
                        views={['year']}
                        openTo='year'
                        minYear={2005}
                        error={!!touchedFields.year && !!errors.year}
                        helperText={touchedFields.year && errors.year ? errors.year.message : ''}
                     />
                  </Grid>

                  <Grid item size={{ xs: 12, md: 2.7 }}>
                     <DropdownField<CommonData>
                        name='program_level'
                        label='Program Level'
                        control={control}
                        options={PROGRAM_LEVELS}
                     />
                  </Grid>

                  <Grid item size={{ xs: 12, md: 2.3 }}>
                     <DropdownField<CommonData>
                        name='coop_cycle'
                        label='Coop Term'
                        control={control}
                        options={COOP_CYCLES}
                     />
                  </Grid>
               </Grid>
            </Box>
         ),
      },
      {
         label: 'Access Banner System',
         activeLabel: 'Login to Banner to access your rankings',
         content: (
            <Box>
               <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Button
                     variant='contained'
                     color={bannerLinkClicked ? 'success' : 'primary'}
                     startIcon={bannerLinkClicked
                        ? <CheckCircle size={20} />
                        : <ExternalLink size={20} />}
                     onClick={handleBannerLinkClick}
                     size='large'
                     sx={{ py: 1.5, px: 3 }}
                  >
                     {bannerLinkClicked ? 'Banner Opened' : 'Open Banner System'}
                  </Button>
               </Box>
            </Box>
         ),
      },
      {
         label: 'Access Rankings',
         activeLabel: 'Access your rankings with the link below',
         content: (
            <Box>
               <TextField
                  fullWidth
                  size='medium'
                  value={previewUrl}
                  InputProps={{
                     readOnly: true,
                     sx: { fontSize: '1rem' },
                     endAdornment: (
                        <Box sx={{ display: 'flex' }}>
                           <Tooltip title='Copy URL'>
                              <IconButton
                                 size='medium'
                                 onClick={() => navigator.clipboard.writeText(previewUrl)}
                                 color='primary'
                              >
                                 <Clipboard size={20} />
                              </IconButton>
                           </Tooltip>
                        </Box>
                     ),
                  }}
                  variant='outlined'
                  sx={{
                     mt: 1,
                     mb: 3,
                  }}
               />

               <Box
                  sx={{
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     gap: 2,
                  }}
               >
                  <Button
                     variant='contained'
                     color='primary'
                     startIcon={<ExternalLink size={20} />}
                     onClick={handleOpenUrl}
                     size='large'
                     sx={{ py: 1.5, px: 3 }}
                  >
                     Open Rankings Page
                  </Button>
               </Box>
            </Box>
         ),
      },
      {
         label: 'Upload Screenshot',
         activeLabel: 'Upload a screenshot of your rankings page',
         content: (
            <Box>
               <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{
                     display: 'block',
                     textAlign: 'center',
                     fontWeight: 550,
                     fontSize: 18,
                     mb: 2,
                  }}
               >
                  *Make sure your screenshot contains only the rankings between both {
                     <img
                        src='return.jpg'
                        alt='return'
                        style={{ display: 'inline', verticalAlign: 'middle' }}
                     />
                  } buttons
               </Typography>

               {!selectedFile
                  ? (
                     <Box
                        sx={{
                           border: '2px dashed',
                           borderColor: 'primary.main',
                           borderRadius: 2,
                           p: 4,
                           mb: 3,
                           display: 'flex',
                           flexDirection: 'column',
                           alignItems: 'center',
                           cursor: 'pointer',
                           backgroundColor: 'rgba(25, 118, 210, 0.04)',
                           transition: 'all 0.2s',
                           '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              transform: 'scale(1.01)',
                           },
                        }}
                        onClick={triggerFileSelect}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                     >
                        <ImagePlus
                           size={40}
                           color='#1976d2'
                           style={{ marginBottom: 16 }}
                        />
                        <Typography
                           variant='body1'
                           sx={{ mb: 1, textAlign: 'center', fontWeight: 500 }}
                        >
                           Drag and drop an image here or click to browse
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                           Supported formats: JPG, PNG, GIF
                        </Typography>
                     </Box>
                  )
                  : (
                     <Box
                        sx={{
                           border: '2px solid',
                           borderColor: 'success.main',
                           borderRadius: 2,
                           p: 3,
                           mb: 3,
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'space-between',
                           backgroundColor: 'rgba(76, 175, 80, 0.08)',
                        }}
                     >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                           <FileUp size={24} color='#2e7d32' />
                           <Typography
                              variant='body1'
                              sx={{ ml: 2, color: 'text.primary', fontWeight: 500 }}
                           >
                              {selectedFile.name}
                           </Typography>
                        </Box>
                        <IconButton
                           onClick={() => setSelectedFile(null)}
                           sx={{ color: 'error.main' }}
                        >
                           <X size={20} />
                        </IconButton>
                     </Box>
                  )}
            </Box>
         ),
      },
   ];

   return (
      <>
         {/* Hidden file input */}
         <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            accept='image/*'
            style={{ display: 'none' }}
         />

         {/* Button to open modal */}
         <Button
            variant='contained'
            color='primary'
            onClick={() => setIsModalOpen(true)}
            startIcon={<Upload size={18} />}
            sx={{ mx: 2, mb: 1, mt: 1 }}
         >
            Upload Co-op Offer
         </Button>

         {/* Modal Dialog */}
         <Dialog
            open={isModalOpen}
            onClose={closeModal}
            maxWidth='md'
            fullWidth
            slots={{ transition: Fade, backdrop: Backdrop }}
            TransitionProps={{ timeout: 300 }}
            BackdropProps={{ timeout: 300 }}
         >
            <DialogTitle
               sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  py: 2,
               }}
            >
               <Typography variant='h6' component='div' sx={{ fontWeight: 500 }}>
                  Upload Co-op Offer
               </Typography>
               <IconButton
                  edge='end'
                  onClick={closeModal}
                  size='medium'
               >
                  <X size={20} />
               </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 2, mt: 2 }}>
               <Stepper activeStep={activeStep} orientation='vertical'>
                  {steps.map((step, index) => (
                     <Step key={step.label}>
                        {activeStep === index
                           ? (
                              <Paper
                                 sx={{
                                    p: 0.7,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    borderRadius: 1,
                                 }}
                              >
                                 <StepLabel>
                                    <Typography
                                       variant='body1'
                                       fontWeight='medium'
                                       sx={{ color: 'white' }}
                                    >
                                       {step.activeLabel}
                                    </Typography>
                                 </StepLabel>
                              </Paper>
                           )
                           : (
                              <StepLabel>
                                 <Typography variant='body1' sx={{ fontWeight: 500 }}>
                                    {step.label}
                                 </Typography>
                              </StepLabel>
                           )}
                        <StepContent sx={{ pb: 2, pt: 2 }}>
                           {step.content}
                        </StepContent>
                     </Step>
                  ))}
               </Stepper>
            </DialogContent>

            <DialogActions
               sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}
            >
               {activeStep > 0 && (
                  <Button
                     variant='outlined'
                     onClick={handleBack}
                     size='medium'
                     startIcon={<ArrowLeft size={18} />}
                     sx={{ mr: 'auto' }}
                  >
                     Back
                  </Button>
               )}

               <Button
                  variant='outlined'
                  onClick={closeModal}
                  size='medium'
                  sx={{ minWidth: '100px', mr: 1 }}
               >
                  Cancel
               </Button>

               {activeStep === 0 && (
                  <Button
                     variant='contained'
                     color='primary'
                     onClick={() => isValid && setActiveStep(1)}
                     endIcon={<ArrowRight size={18} />}
                     size='medium'
                     sx={{ minWidth: '100px', py: 1 }}
                  >
                     Next
                  </Button>
               )}

               {activeStep === steps.length - 1 && (
                  <Button
                     variant='contained'
                     color='primary'
                     onClick={handleSubmit(onSubmit)}
                     startIcon={<Upload size={18} />}
                     disabled={!selectedFile}
                     size='medium'
                     sx={{ minWidth: '100px', py: 1 }}
                  >
                     Submit
                  </Button>
               )}
            </DialogActions>
         </Dialog>
      </>
   );
};

export default FileUpload;
