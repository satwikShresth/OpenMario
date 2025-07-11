import { useCallback, useEffect, useState } from 'react';
import {
   Box,
   Button,
   Divider,
   Drawer,
   FormControl,
   FormControlLabel,
   FormLabel,
   Grid,
   IconButton,
   Radio,
   RadioGroup,
   Slider,
   Typography,
} from '@mui/material';
import {
   Briefcase,
   Building,
   Calendar,
   CalendarDays,
   Filter,
   MapPin,
   School,
   X,
} from 'lucide-react';
import { useFilterStore } from '#/stores/useFilterStore';
import { FormProvider, useForm } from 'react-hook-form';
import { COOP_CYCLES, COOP_YEARS, PROGRAM_LEVELS } from '#/types';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import {
   getAutocompleteCompanyOptions,
   getAutocompleteLocationOptions,
   getAutocompletePositionOptions,
} from '#client/react-query.gen';
import { DropdownField, MultiselectFieldWithIcon } from '#/components/Job/Form/fields';

// Combined form interface
interface FilterFormData {
   company: string[];
   position: string[];
   location: string[];
   year: number[];
   coop_year: string[];
   coop_cycle: string[];
   program_level: string;
   distinct: boolean;
}

const FilterDrawer = () => {
   const [open, setOpen] = useState(false);
   const currentYear = useFilterStore((state) => state.year);
   const currentCoopYear = useFilterStore((state) => state.coop_year);
   const currentCoopCycle = useFilterStore((state) => state.coop_cycle);
   const currentProgramLevel = useFilterStore((state) => state.program_level);
   const currentCompany = useFilterStore((state) => state.company);
   const currentPosition = useFilterStore((state) => state.position);
   const currentLocation = useFilterStore((state) => state.location);
   const currentDistinct = useFilterStore((state) => state.distinct);
   const {
      pageSize,
      setPagination,
      setYear,
      setCoopYear,
      setCoopCycle,
      setProgramLevel,
      setCompany,
      setPosition,
      setLocation,
      setDistinct,
      resetFilters,
   } = useFilterStore();

   const methods = useForm<FilterFormData>({
      defaultValues: {
         company: currentCompany || [],
         position: currentPosition || [],
         location: currentLocation || [],
         year: currentYear ||
            [new Date().getFullYear() - 5, new Date().getFullYear()],
         coop_year: currentCoopYear || [],
         coop_cycle: currentCoopCycle || [],
         program_level: currentProgramLevel || '',
         distinct: currentDistinct || true,
      },
   });

   const { control, watch, setValue, reset } = methods;

   const {
      year: yearRange,
      coop_year: coopYearValues,
      coop_cycle: coopCycleValues,
      program_level: programLevelValue,
      company: companyValues,
      position: positionValues,
      location: locationValues,
      distinct: distinctValue,
   } = watch();

   const minDistance = 2;

   // Search state for autocomplete fields
   const [searchInputs, setSearchInputs] = useState({
      company: '',
      position: '',
      location: '',
   });

   const debouncedSearch = useCallback(
      debounce((field, value) => {
         setSearchInputs((prev) => ({ ...prev, [field]: value }));
      }, 300),
      [],
   );
   const debouncedSetYearRange = useCallback(
      debounce((value) => setYear(value), 300),
      [],
   );

   // Queries for autocomplete fields
   const companyQuery = useQuery({
      ...getAutocompleteCompanyOptions({
         query: { comp: searchInputs.company },
      }),
      enabled: searchInputs?.company?.length >= 3,
      staleTime: 30000,
      placeholderData: (previousData) => previousData,
   });

   const positionQuery = useQuery({
      ...getAutocompletePositionOptions({
         query: {
            comp: '*',
            pos: searchInputs.position,
         },
      }),
      enabled: searchInputs.position.length >= 3,
      staleTime: 30000,
      placeholderData: (previousData) => previousData,
   });

   const locationQuery = useQuery({
      ...getAutocompleteLocationOptions({
         query: {
            loc: searchInputs.location || '',
         },
      }),
      enabled: searchInputs.location.length >= 2,
      staleTime: 30000,
      placeholderData: (previousData) => previousData,
   });

   // Handler for year slider
   const handleYearChange = useCallback((
      event: Event,
      newValue: number | number[],
      activeThumb: number,
   ) => {
      if (!Array.isArray(newValue)) {
         return;
      }
      if (activeThumb === 0) {
         setValue('year', [
            Math.min(newValue[0], yearRange[1] - minDistance),
            yearRange[1],
         ]);
      } else {
         setValue('year', [
            yearRange[0],
            Math.max(newValue[1], yearRange[0] + minDistance),
         ]);
      }
   }, [setValue, minDistance, yearRange]);

   // Handler for distinct radio button
   const handleDistinctChange = (event) => {
      const newValue = event.target.value === 'true';
      setValue('distinct', newValue);
   };

   // Make sure values are arrays
   const makeSureArray = (val) => (Array.isArray(val) ? val : [val]);

   // Update store when form values change
   useEffect(() => {
      if (yearRange?.length) debouncedSetYearRange([yearRange[0], yearRange[1]]);
      if (coopYearValues) setCoopYear(coopYearValues);
      if (coopCycleValues) setCoopCycle(coopCycleValues);
      if (programLevelValue) setProgramLevel(programLevelValue);
      if (companyValues) setCompany(makeSureArray(companyValues));
      if (positionValues) setPosition(makeSureArray(positionValues));
      if (locationValues) setLocation(makeSureArray(locationValues));
      if (distinctValue !== undefined) setDistinct(distinctValue);
      setPagination({ pageIndex: 0, pageSize });
   }, [
      yearRange,
      coopYearValues,
      coopCycleValues,
      programLevelValue,
      companyValues,
      positionValues,
      locationValues,
      distinctValue,
   ]);

   const valuetext = (value) => `${value}`;

   const toggleDrawer = () => {
      setOpen(!open);
   };

   const handleClearAll = () => {
      resetFilters();
   };

   // Default year range for display
   const defaultYearRange = [
      new Date().getFullYear() - 5,
      new Date().getFullYear(),
   ];

   return (
      <>
         <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
               variant='outlined'
               startIcon={<Filter size={18} />}
               onClick={toggleDrawer}
            >
               Filters
            </Button>
         </Box>

         <Drawer
            anchor='right'
            open={open}
            onClose={toggleDrawer}
            sx={{
               '& .MuiDrawer-paper': {
                  width: { xs: '85%', sm: 350 },
                  p: 3,
                  boxSizing: 'border-box',
               },
            }}
         >
            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
               }}
            >
               <Typography variant='h6'>Filters</Typography>
               <IconButton onClick={toggleDrawer} size='small'>
                  <Typography variant='body2' color='primary'>Close</Typography>
               </IconButton>
            </Box>

            {/* Integrated Form */}
            <FormProvider {...methods}>
               <form>
                  {/* Query Filters Section */}
                  <Box sx={{ mb: 3 }}>
                     <Typography variant='subtitle1' sx={{ mb: 2 }}>
                        Query Filters
                     </Typography>
                     <Grid container spacing={2}>
                        <Grid item xs={12}>
                           <MultiselectFieldWithIcon
                              name='company'
                              label='Company'
                              control={control}
                              multiple
                              icon={<Building size={18} />}
                              options={companyQuery?.data?.map((item) => item.name) || []}
                              loading={companyQuery?.isLoading}
                              getOptionLabel={(option) => option ?? ''}
                              isOptionEqualToValue={(option, value) => option === value}
                              onInputChange={(_, value) => debouncedSearch('company', value)}
                              placeholder='Search for companies...'
                              freeSolo={false}
                           />
                        </Grid>

                        <Grid item xs={12}>
                           <MultiselectFieldWithIcon
                              name='position'
                              label='Position'
                              control={control}
                              multiple
                              icon={<Briefcase size={18} />}
                              options={positionQuery?.data?.map((item) => item.name) ||
                                 []}
                              loading={positionQuery.isFetching}
                              getOptionLabel={(option) => option ?? ''}
                              isOptionEqualToValue={(option, value) => option === value}
                              onInputChange={(_, value) => debouncedSearch('position', value)}
                              placeholder='Search for positions...'
                           />
                        </Grid>

                        <Grid item xs={12}>
                           <MultiselectFieldWithIcon
                              name='location'
                              label='Location'
                              control={control}
                              multiple
                              icon={<MapPin size={18} />}
                              options={locationQuery?.data?.map((item) => item.name) ||
                                 []}
                              loading={locationQuery.isFetching}
                              getOptionLabel={(option) => option ?? ''}
                              isOptionEqualToValue={(option, value) => option === value}
                              onInputChange={(_, value) => {
                                 debouncedSearch('location', value);
                              }}
                              placeholder='Search for locations...'
                              freeSolo={false}
                           />
                        </Grid>
                     </Grid>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Additional Filters Section */}
                  <Typography variant='subtitle1' sx={{ mb: 2 }}>
                     Additional Filters
                  </Typography>

                  {/* Year Range Slider */}
                  <Box sx={{ mt: 2, mb: 4 }}>
                     <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                     >
                        <CalendarDays size={18} />
                        <Typography variant='body2'>
                           Year Range
                        </Typography>
                     </Box>
                     <Slider
                        getAriaLabel={() => 'Year range'}
                        value={yearRange || defaultYearRange}
                        onChange={handleYearChange}
                        valueLabelDisplay='auto'
                        getAriaValueText={valuetext}
                        disableSwap
                        min={new Date().getFullYear() - 20}
                        max={new Date().getFullYear()}
                        step={1}
                        marks
                        sx={{ mt: 2 }}
                     />
                     <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                     >
                        <span>{yearRange?.[0] || defaultYearRange[0]}</span>
                        <span>{yearRange?.[1] || defaultYearRange[1]}</span>
                     </Typography>
                  </Box>

                  {/* Co-op Year Multiselect */}
                  <Box sx={{ mb: 3 }}>
                     <MultiselectFieldWithIcon
                        name='coop_year'
                        label='Co-op Year'
                        control={control}
                        multiple
                        icon={<School size={18} />}
                        options={COOP_YEARS}
                        getOptionLabel={(option) => `${option} Year`}
                        isOptionEqualToValue={(option, value) => option === value}
                        placeholder='Select co-op years...'
                        helperText='Select one or more co-op years'
                        chipColor='primary'
                        freeSolo={false}
                     />
                  </Box>

                  {/* Co-op Cycle Multiselect */}
                  <Box sx={{ mb: 3 }}>
                     <MultiselectFieldWithIcon
                        name='coop_cycle'
                        label='Co-op Cycle'
                        control={control}
                        multiple
                        icon={<Calendar size={18} />}
                        options={COOP_CYCLES}
                        getOptionLabel={(option) => option}
                        isOptionEqualToValue={(option, value) => option === value}
                        placeholder='Select co-op cycles...'
                        helperText='Select one or more cycles'
                        chipColor='primary'
                        freeSolo={false}
                     />
                  </Box>

                  {/* Program Level Select */}
                  <Box sx={{ mb: 3 }}>
                     <DropdownField
                        name='program_level'
                        label='Program Level'
                        icon={<Briefcase size={18} />}
                        control={control}
                        options={PROGRAM_LEVELS}
                     />
                  </Box>

                  {/* Distinct Radio Button */}
                  <Box sx={{ mb: 3 }}>
                     <FormControl component='fieldset'>
                        <FormLabel component='legend'>Show Distinct Results</FormLabel>
                        <RadioGroup
                           row
                           name='distinct'
                           value={distinctValue.toString()}
                           onChange={handleDistinctChange}
                        >
                           <FormControlLabel
                              value={true}
                              control={<Radio />}
                              label='On'
                           />
                           <FormControlLabel
                              value={false}
                              control={<Radio />}
                              label='Off'
                           />
                        </RadioGroup>
                     </FormControl>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                     <Button
                        variant='outlined'
                        color='error'
                        startIcon={<X size={18} />}
                        onClick={handleClearAll}
                        fullWidth
                        sx={{ color: '#FF5238' }}
                     >
                        Clear All Filters
                     </Button>
                  </Box>
               </form>
            </FormProvider>
         </Drawer>
      </>
   );
};

export default FilterDrawer;
