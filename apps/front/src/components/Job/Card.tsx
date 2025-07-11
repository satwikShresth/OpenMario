// components/Job/Card.tsx
import React from 'react';
import {
   Box,
   Card,
   CardActions,
   CardContent,
   Chip,
   Divider,
   Grid,
   IconButton,
   Tooltip,
   Typography,
} from '@mui/material';
import {
   ArrowRight,
   Building,
   Calendar,
   Clock,
   DollarSign,
   Edit,
   GraduationCap,
   MapPin,
   Trash2,
} from 'lucide-react';
import type { Submission } from '#/types';

interface JobCardProps {
   submission: Submission;
   index: number;
   onEdit: (index: number) => void;
   onDelete: (index: number) => void;
   isDraft?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
   submission,
   index,
   onEdit,
   onDelete,
   isDraft = false,
}) => {
   const weeklyPay = submission?.compensation
      ? `$${(submission?.compensation * submission?.work_hours).toFixed(2)}/week`
      : null;

   const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(index);
   };

   const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(index);
   };

   return (
      <Card
         elevation={2}
         sx={{
            mb: 2,
            position: 'relative',
            transition: isDraft ? 'all 0.2s' : 'none',
            '&:hover': isDraft
               ? {
                  boxShadow: 3,
               }
               : {},
         }}
      >
         {isDraft && (
            <Chip
               label='DRAFT'
               size='small'
               color='warning'
               sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  zIndex: 1,
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
               }}
            />
         )}

         <CardContent sx={{ pb: 1 }}>
            {/* Title and Company */}
            <Box
               sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 1,
               }}
            >
               <Box>
                  <Typography
                     variant='h6'
                     component='div'
                     color='primary'
                     sx={{ fontWeight: 'medium' }}
                  >
                     {submission?.position || 'Untitled Position'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                     <Building size={16} />
                     <Typography variant='body1' sx={{ ml: 1 }}>
                        {submission?.company || 'No Company'}
                     </Typography>
                  </Box>
               </Box>
               <Box sx={{ display: 'flex' }}>
                  <Tooltip title='Edit'>
                     <IconButton size='small' onClick={handleEditClick}>
                        <Edit size={18} />
                     </IconButton>
                  </Tooltip>
                  <Tooltip title='Delete'>
                     <IconButton
                        size='small'
                        color='error'
                        onClick={handleDeleteClick}
                     >
                        <Trash2 size={18} />
                     </IconButton>
                  </Tooltip>
                  {isDraft && (
                     <Tooltip title='Complete Submission'>
                        <IconButton
                           size='small'
                           color='success'
                           onClick={handleEditClick}
                        >
                           <ArrowRight size={18} />
                        </IconButton>
                     </Tooltip>
                  )}
               </Box>
            </Box>

            {/* Location */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
               <MapPin size={16} />
               <Typography variant='body2' sx={{ ml: 1 }}>
                  {submission?.location || 'No Location'}
               </Typography>
            </Box>

            {/* Co-op Details */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
               <Grid item xs={12} sm={6}>
                  <Grid container spacing={1}>
                     <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                           <GraduationCap size={16} />
                           <Typography variant='body2' sx={{ ml: 1 }}>
                              {submission?.program_level || 'Undergraduate'}
                           </Typography>
                        </Box>
                     </Grid>
                     <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                           <Calendar size={16} />
                           <Typography variant='body2' sx={{ ml: 1 }}>
                              {submission?.coop_cycle || 'No Cycle'},{' '}
                              {submission?.year || new Date().getFullYear()}{' '}
                              ({submission?.coop_year || '1st'} year)
                           </Typography>
                        </Box>
                     </Grid>
                  </Grid>
               </Grid>

               <Grid item xs={12} sm={6}>
                  <Grid container spacing={1}>
                     <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                           <Clock size={16} />
                           <Typography variant='body2' sx={{ ml: 1 }}>
                              {submission?.work_hours || 40} hours/week
                           </Typography>
                        </Box>
                     </Grid>
                     {submission?.compensation && (
                        <Grid item xs={12}>
                           <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <DollarSign size={16} />
                              <Typography variant='body2' sx={{ ml: 1 }}>
                                 ${parseFloat(submission?.compensation.toString()).toFixed(
                                    2,
                                 )}/hour {weeklyPay && `(${weeklyPay})`}
                              </Typography>
                           </Box>
                        </Grid>
                     )}
                  </Grid>
               </Grid>
            </Grid>

            {/* Other Compensation */}
            {submission?.other_compensation && (
               <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant='body2' color='text.secondary'>
                     <strong>Other Compensation:</strong> {submission?.other_compensation}
                  </Typography>
               </Box>
            )}

            {/* Details */}
            {submission?.details && (
               <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant='body2' color='text.secondary'>
                     <strong>Details:</strong> {submission?.details}
                  </Typography>
               </Box>
            )}
         </CardContent>

         <CardActions sx={{ pt: 0, pb: 1.5, px: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
               <Chip
                  label={submission?.program_level || 'Undergraduate'}
                  size='small'
                  color='primary'
                  variant='outlined'
               />
               <Chip
                  label={submission?.coop_cycle || 'No Cycle'}
                  size='small'
                  color='secondary'
                  variant='outlined'
               />
               <Chip
                  label={`${submission?.coop_year || '1st'} year`}
                  size='small'
                  color='info'
                  variant='outlined'
               />
            </Box>
         </CardActions>
      </Card>
   );
};

export default JobCard;
