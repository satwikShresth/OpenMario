import React, { useState, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Paper,
  Backdrop,
  Fade,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Upload,
  X,
  ImagePlus,
  FileUp,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { PROGRAM_LEVELS, COOP_CYCLES, COOP_YEARS, type CommonData } from '#/types';

// Dropdown Field Component
const DropdownField: React.FC<{
  name: keyof CommonData;
  label: string;
  control: any;
  options: readonly string[];
}> = ({ name, label, control, options }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl fullWidth>
          <InputLabel>{label}</InputLabel>
          <Select {...field} label={label}>
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option.includes('/') ? option : `${option}${name === 'coop_year' ? ' Year' : ''}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    />
  );
};

interface FileUploadProps {
  onFileSelect: (file: File, common: CommonData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { control, handleSubmit, formState: { errors: _ } } = useForm<CommonData>({
    defaultValues: {
      coop_year: COOP_YEARS[0],
      coop_cycle: COOP_CYCLES[0],
      program_level: PROGRAM_LEVELS[0],
      year: new Date().getFullYear()
    }
  });

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
      setIsModalOpen(false);
      setSelectedFile(null);
    } else {
      alert('Please select a file');
    }
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
            Upload Job Listing Image
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

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Co-op Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DropdownField
                  name="coop_year"
                  label="Co-op Year"
                  control={control}
                  options={COOP_YEARS}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DropdownField
                  name="coop_cycle"
                  label="Co-op Cycle"
                  control={control}
                  options={COOP_CYCLES}
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

              <Grid item xs={12} md={6}>
                <Controller
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Year</InputLabel>
                      <Select {...field} label="Year">
                        {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
              Upload an image of your job listing for automatic information extraction.
              Supported formats: JPG, PNG, GIF.
            </Typography>
          </Box>
        </DialogContent>

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
            disabled={!selectedFile}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileUpload;
