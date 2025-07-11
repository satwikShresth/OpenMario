import React from 'react';
import { Divider, Typography } from '@mui/material';

type SectionHeaderProps = {
   title: string;
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
   <>
      <Typography variant='subtitle1' gutterBottom sx={{ mt: 2 }}>
         {title}
      </Typography>
      <Divider />
   </>
);
