import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Box, Paper, Backdrop, Fade, Grid, TextField, Tooltip, Divider, Accordion, AccordionSummary, AccordionDetails, Link } from '@mui/material';
import { Upload, X, ImagePlus, FileUp, Clipboard, ExternalLink, ChevronDown, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { PROGRAM_LEVELS, COOP_CYCLES, COOP_YEARS, type CommonData, COOP_ROUND } from '#/types';
import { DatePickerField, DropdownField, TextFieldWithIcon } from './Job/Form/fields';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadSchema } from '#/utils/validators';

interface FileUploadProps {
  onFileSelect: (file: File, common: CommonData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Track if the year field has been touched for validation
  const [yearFieldTouched, setYearFieldTouched] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors }
  } = useForm<CommonData>({
    resolver: zodResolver(UploadSchema),
    defaultValues: {
      coop_year: COOP_YEARS[0],
      coop_round: COOP_ROUND[0],
      coop_cycle: COOP_CYCLES[0],
      program_level: PROGRAM_LEVELS[0],
      year: new Date().getFullYear(),
    },
    mode: 'onChange', // Enable validation as fields change
  });

  const coop_round = watch('coop_round');
  const coop_cycle = watch('coop_cycle');
  const year = watch('year');

  // Validate year field when it changes, but only if it's been touched
  useEffect(() => {
    if (yearFieldTouched) {
      trigger('year');
    }
  }, [year, yearFieldTouched, trigger]);

  // Mark the year field as touched
  const markYearFieldAsTouched = () => {
    setYearFieldTouched(true);
  };

  useMemo(() =>
    setPreviewUrl(`https://banner.drexel.edu/duprod/hwczksrmk.P_StudentReqMaintRanking?i_user_type=S&i_begin_term=${year}${COOP_CYCLES.indexOf(coop_cycle) + 1}5&i_cycle=${coop_round}&i_mode=S&i_recs_per_page=20`),
    [year, coop_cycle, coop_round]
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
    // Mark the year field as touched to validate before submission
    setYearFieldTouched(true);

    // Trigger validation for year field
    trigger('year').then(isValid => {
      if (isValid && selectedFile) {
        onFileSelect(selectedFile, data);
        setIsModalOpen(false);
        setSelectedFile(null);
        setYearFieldTouched(false); // Reset touched state on successful submission
      } else if (!selectedFile) {
        alert('Please select a file');
      }
    });
  };

  const handleOpenUrl = () => {
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Button to open modal */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setIsModalOpen(true)}
        startIcon={<Upload size={18} />}
        sx={{ mx: 3 }}
      >
        Upload Coop Offer
      </Button>

      {/* Modal Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 500 }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 1,
          mb: 3
        }}>
          <Typography variant="h6" component="div">
            Upload Co-op Offer
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setIsModalOpen(false)}
            aria-label="close"
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {!selectedFile ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 5,
                  mb: 3,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: 'primary.light',
                  bgcolor: 'rgba(25, 118, 210, 0.05)',
                  borderRadius: 2,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                    borderColor: 'primary.main',
                  }
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={triggerFileSelect}
              >
                <Box
                  sx={{
                    mb: 2,
                    color: 'primary.main',
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ImagePlus size={40} />
                </Box>
                <Typography variant="subtitle1" color="primary.dark" sx={{ mb: 1, fontWeight: 'medium', textAlign: 'center' }}>
                  Drag and drop an image file here
                </Typography>
                <Typography variant="body2" color="primary.main" sx={{ textAlign: 'center' }}>
                  or click to browse
                </Typography>
              </Paper>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  mb: 3,
                  borderColor: 'success.main',
                  bgcolor: 'rgba(76, 175, 80, 0.05)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FileUp size={24} color="success" />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    {selectedFile.name}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setSelectedFile(null)}
                  sx={{ color: 'error.main' }}
                >
                  <X size={18} />
                </IconButton>
              </Paper>
            )}
            <Typography variant="body2" color="text.secondary">
              *Upload an image of your job listing for automatic information extraction.
              Supported formats: JPG, PNG, GIF.
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 2 }}>
              Co-op Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <DropdownField<CommonData>
                  name="coop_year"
                  label="Co-op Year"
                  control={control}
                  options={COOP_YEARS}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <DropdownField<CommonData>
                  name="coop_round"
                  label="Co-op Round"
                  control={control}
                  options={COOP_ROUND}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <DropdownField<CommonData>
                  name="coop_cycle"
                  label="Co-op Cycle"
                  control={control}
                  options={COOP_CYCLES}
                />
              </Grid>

              <Grid item xs={12} md={5}>
                <DropdownField<CommonData>
                  name="program_level"
                  label="Program Level"
                  control={control}
                  options={PROGRAM_LEVELS}
                />
              </Grid>

              <Grid item xs={12} md={5}>
                <DatePickerField
                  name="year"
                  label="Year"
                  control={control}
                  views={['year']}
                  openTo="year"
                  minYear={2005}
                  onBlur={markYearFieldAsTouched}
                  error={yearFieldTouched && !!errors.year}
                  helperText={yearFieldTouched && errors.year ? errors.year.message : ''}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Drexel Banner URL Section */}
            <Accordion
              sx={{
                mb: 3,
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                borderRadius: 1,
                overflow: 'hidden',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ChevronDown size={18} />}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <Typography variant="body1" fontWeight="medium">
                  Guide To Access Your Ranking
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  *You should be logged into DrexelOne.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" component="span">
                    <Box>
                      *This Link must be open in a seprate tab :
                      <Link
                        href="https://bannersso.drexel.edu/ssomanager/c/SSB?pkg=bwszkfrag.P_DisplayFinResponsibility%3Fi_url%3Dhwczksrmp.P_StudentRequestMaintStud"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(e.currentTarget.href, '_blank', 'noopener,noreferrer,nofollow');
                          return false;
                        }}
                        sx={{
                          ml: 1,
                          fontWeight: 500,
                          color: 'primary.main',
                          textDecoration: 'underline',
                          display: 'inline-flex',
                          alignItems: 'center',
                          '&:hover': {
                            color: 'primary.dark'
                          }
                        }}
                      >
                        {"Banner "}
                        <ExternalLink size={14} sx={{ ml: 0.5 }} />
                      </Link>
                    </Box>
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  value={previewUrl}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="Copy URL">
                          <IconButton
                            size="small"
                            onClick={() => navigator.clipboard.writeText(previewUrl)}
                            color="primary"
                          >
                            <Clipboard size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open URL">
                          <IconButton
                            size="small"
                            onClick={handleOpenUrl}
                            color="primary"
                          >
                            <ExternalLink size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ),
                    sx: { typography: 'caption' }
                  }}
                  variant="outlined"
                  sx={{
                    my: 1,
                    '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' }
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  *Coop information affects the link; ensure all information is correctly entered
                </Typography>
              </AccordionDetails>
            </Accordion>

          </Box >
        </DialogContent >

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setIsModalOpen(false)}
            startIcon={<X size={16} />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit(onSubmit)}
            startIcon={<Upload size={16} />}
            disabled={!selectedFile || (yearFieldTouched && !!errors.year)}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog >
    </>
  );
};

export default FileUpload;
