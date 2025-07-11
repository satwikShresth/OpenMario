import { useEffect, useRef } from 'react';
import { useFilterStore } from '#/stores';
import DataTable from '#/components/Home';
import { Banknote, Share } from 'lucide-react';
import { type Filter, FilterSchema, handleShare } from '#/utils';
import { zodValidator } from '@tanstack/zod-adapter';
import FilterDrawer from '#/components/Home/FilterDrawer';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { createFileRoute, redirect, retainSearchParams } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';

export const Route = createFileRoute('/salary')({
   validateSearch: zodValidator({
      schema: FilterSchema,
      input: 'output',
      output: 'input',
   }),
   search: { middlewares: [retainSearchParams(true)] },
   beforeLoad: ({ search, cause }) => {
      const {
         setSearch,
         company,
         position,
         location,
         year,
         coop_year,
         coop_cycle,
         program_level,
         distinct,
         pageIndex,
         pageSize,
      } = useFilterStore.getState();
      switch (cause) {
         case 'enter':
            if (Object.keys(search).length === 0) {
               throw redirect({
                  search: {
                     company,
                     position,
                     location,
                     year,
                     coop_year,
                     coop_cycle,
                     program_level,
                     distinct,
                     pageIndex,
                     pageSize,
                  },
               });
            } else {
               setSearch(search);
            }
            break;
      }
   },
   errorComponent: ({ error }) => (
      <Container maxWidth='lg'>
         <Box
            sx={{
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               height: '50vh',
            }}
         >
            <Typography color='error'>
               Error loading data: {error.message}
            </Typography>
         </Box>
      </Container>
   ),
   component: () => {
      const navigate = Route.useNavigate();
      const search = Route.useSearch() as Filter;
      const { enqueueSnackbar } = useSnackbar();
      let timer: number | null = null;
      const isInitialRender = useRef(true);
      const filterUndefinedValues = (obj) =>
         Object.entries(obj).reduce(
            (acc, [key, value]) =>
               (value !== undefined && !(Array.isArray(value) && value.length === 0))
                  ? { ...acc, [key]: value }
                  : acc,
            {},
         );

      useEffect(() => {
         const unsubscribePositionStore = useFilterStore
            .subscribe(
               (
                  {
                     company,
                     position,
                     location,
                     year,
                     coop_year,
                     coop_cycle,
                     program_level,
                     distinct,
                     pageIndex,
                     pageSize,
                  },
               ) => {
                  if (!isInitialRender.current) {
                     isInitialRender.current = false;
                  } else {
                     timer = setTimeout(() => {
                        const search = filterUndefinedValues({
                           company,
                           position,
                           location,
                           year,
                           coop_year,
                           coop_cycle,
                           program_level,
                           distinct,
                           pageIndex,
                           pageSize,
                        });
                        console.log(search);
                        navigate({
                           from: '/salary',
                           to: '/salary',
                           search,
                           replace: true,
                           reloadDocument: false,
                           resetScroll: false,
                        });
                     }, 100);
                  }
               },
            );
         return () => {
            clearTimeout(timer!);
            unsubscribePositionStore();
         };
      }, []);

      return (
         <Container maxWidth='lg'>
            <Box sx={{ width: '100%' }}>
               <Box
                  sx={{
                     display: 'flex',
                     justifyContent: 'space-between',
                     mb: 2,
                     ml: 2,
                     width: '100%',
                  }}
               >
                  <Typography
                     variant='h5'
                     component='h1'
                     sx={{ display: 'flex', alignItems: 'center' }}
                  >
                     <Banknote size={24} style={{ marginRight: '8px' }} />
                     Anonymous Salary Information
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                     <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                           variant='outlined'
                           startIcon={<Share size={18} />}
                           onClick={() => {
                              handleShare(window.location.href, enqueueSnackbar);
                           }}
                        >
                           Share
                        </Button>
                     </Box>

                     <FilterDrawer />
                  </Box>
               </Box>

               <DataTable query={search} />

               <Paper elevation={1} sx={{ p: 2, mt: 4, borderRadius: 1, mb: 2 }}>
                  <Typography variant='caption' color='text.secondary'>
                     Note: All compensation data is self-reported by students.
                  </Typography>
               </Paper>
            </Box>
         </Container>
      );
   },
});
