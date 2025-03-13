import React from 'react';
import { Typography, Slider, Box } from '@mui/material';
import { Controller } from 'react-hook-form';
import type { Submission } from '#client/types.gen';

type SliderFieldProps = {
  name: keyof Submission;
  control: any;
  label: string;
  min: number;
  max: number;
  step: number;
  currentValue: number;
  marks?: { value: number; label: string }[];
  valueLabelFormat?: (value: number) => string;
  footer?: React.ReactNode;
};

export const SliderField: React.FC<SliderFieldProps> = ({
  name,
  control,
  min,
  max,
  step,
  marks,
  valueLabelFormat = (value) => `${value}`,
  footer
}) => {
  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Box sx={{ px: 1 }}>
            <Slider
              {...field}
              min={min}
              max={max}
              step={step}
              valueLabelDisplay="auto"
              valueLabelFormat={valueLabelFormat}
              marks={marks}
              onChange={(_, value) => field.onChange(value as number)}
            />
          </Box>
        )}
      />
      {footer}
    </>
  );
};
