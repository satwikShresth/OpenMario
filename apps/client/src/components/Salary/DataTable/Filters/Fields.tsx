import {
   createListCollection,
   Portal,
   Select,
   Slider,
   Stack,
   Switch,
   VStack,
} from '@chakra-ui/react';
import { useForm } from '@tanstack/react-form';
import { CheckIcon, CloseIcon } from '@/components/icons';
import { useMobile } from '@/hooks';
import { capitalizeWords, coopCycle, coopYear, marksMaker, programLevel } from '@/helpers';
import { useSearch } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';

export default () => {
   const query = useSearch({ from: '/salary' });
   const navigate = useNavigate({ from: '/salary' });
   const min = 2016;
   const max = new Date().getFullYear();
   const marks = marksMaker(min, max, 3);

   const defaultValues = {
      year: query?.year ?? [],
      coop_cycle: query?.coop_cycle ?? [],
      coop_year: query?.coop_year ?? [],
      program_level: query?.program_level ?? '',
      distinct: query?.distinct ?? true,
   };

   const isMobile = useMobile();
   const form = useForm({
      defaultValues,
      listeners: {
         onChange: ({ formApi }) => {
            const values = formApi.state.values;
            navigate({
               search: (prev) => ({
                  ...prev,
                  ...values,
               }),
               reloadDocument: false,
               resetScroll: false,
               replace: true,
            });
         },
      },
   });

   return (
      <form onSubmit={(e) => e.preventDefault()}>
         <VStack width='full'>
            <Stack
               direction={isMobile ? 'column' : 'row'}
               w='full'
               mb={2}
               gap={5}
            >
               <form.Field name='distinct'>
                  {({ state, handleChange, name }) => (
                     <Switch.Root
                        size='lg'
                        checked={state.value}
                        onCheckedChange={({ checked }) => handleChange(checked)}
                        mt={5}
                     >
                        <Switch.Label>{capitalizeWords(name)}</Switch.Label>
                        <Switch.HiddenInput />
                        <Switch.Control>
                           <Switch.Thumb>
                              <Switch.ThumbIndicator
                                 fallback={<CloseIcon color='black' />}
                              >
                                 <CheckIcon />
                              </Switch.ThumbIndicator>
                           </Switch.Thumb>
                        </Switch.Control>
                     </Switch.Root>
                  )}
               </form.Field>
            </Stack>
            <Stack
               direction={isMobile ? 'column' : 'row'}
               w='full'
               mb={2}
               gap={5}
            >
               <form.Field name='year'>
                  {({ state, handleChange, name }) => (
                     <Slider.Root
                        width='full'
                        value={state.value}
                        onValueChange={({ value }) => handleChange(value)}
                        min={min}
                        max={max}
                        minStepsBetweenThumbs={1}
                        step={1}
                        colorPalette='cyan'
                     >
                        <Slider.Label>{capitalizeWords(name)}</Slider.Label>
                        <Slider.Control>
                           <Slider.Track>
                              <Slider.Range />
                           </Slider.Track>
                           <Slider.Thumb index={0}>
                              <Slider.DraggingIndicator
                                 layerStyle='fill.solid'
                                 top='6'
                                 rounded='sm'
                                 py='2'
                                 px='3'
                                 fontWeight='medium'
                              />
                           </Slider.Thumb>
                           <Slider.Thumb index={1}>
                              <Slider.DraggingIndicator
                                 layerStyle='fill.solid'
                                 top='6'
                                 rounded='sm'
                                 py='2'
                                 px='3'
                                 fontWeight='medium'
                              />
                           </Slider.Thumb>
                           <Slider.Marks fontWeight='medium' marks={marks} />
                        </Slider.Control>
                     </Slider.Root>
                  )}
               </form.Field>
               <form.Field name='coop_year'>
                  {({ state, handleChange, name }) => (
                     <Select.Root
                        value={state?.value}
                        multiple
                        //@ts-ignore: shut up
                        onValueChange={({ value }) => handleChange(value)}
                        collection={coopYearCollection}
                     >
                        <Select.HiddenSelect />
                        <Select.Label>{capitalizeWords(name.replaceAll('_', ' '))}</Select.Label>
                        <Select.Control>
                           <Select.Trigger>
                              <Select.ValueText placeholder='Select coop year' />
                           </Select.Trigger>
                           <Select.IndicatorGroup>
                              <Select.ClearTrigger />
                              <Select.Indicator />
                           </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                           <Select.Positioner>
                              <Select.Content>
                                 {coopYearCollection
                                    .items
                                    .map((level) => (
                                       <Select.Item
                                          item={level}
                                          key={level.value}
                                       >
                                          {level.label}
                                          <Select.ItemIndicator />
                                       </Select.Item>
                                    ))}
                              </Select.Content>
                           </Select.Positioner>
                        </Portal>
                     </Select.Root>
                  )}
               </form.Field>
               <form.Field name='coop_cycle'>
                  {({ state, handleChange, name }) => (
                     <Select.Root
                        value={state?.value}
                        //@ts-ignore: shut up
                        onValueChange={({ value }) => handleChange(value)}
                        collection={coopCycleCollection}
                        multiple
                     >
                        <Select.HiddenSelect />
                        <Select.Label>{capitalizeWords(name.replaceAll('_', ' '))}</Select.Label>
                        <Select.Control>
                           <Select.Trigger>
                              <Select.ValueText placeholder='Select coop cycle' />
                           </Select.Trigger>
                           <Select.IndicatorGroup>
                              <Select.ClearTrigger />
                              <Select.Indicator />
                           </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                           <Select.Positioner>
                              <Select.Content>
                                 {coopCycleCollection
                                    .items
                                    .map((level) => (
                                       <Select.Item
                                          item={level}
                                          key={level.value}
                                       >
                                          {level.label}
                                          <Select.ItemIndicator />
                                       </Select.Item>
                                    ))}
                              </Select.Content>
                           </Select.Positioner>
                        </Portal>
                     </Select.Root>
                  )}
               </form.Field>

               <form.Field name='program_level'>
                  {({ state, handleChange, name }) => (
                     <Select.Root
                        value={[state?.value!]}
                        //@ts-ignore: shut up
                        onValueChange={({ value: [change] }) => handleChange(change!)}
                        collection={programLevelCollection}
                     >
                        <Select.HiddenSelect />
                        <Select.Label>{capitalizeWords(name.replaceAll('_', ' '))}</Select.Label>
                        <Select.Control>
                           <Select.Trigger>
                              <Select.ValueText />
                           </Select.Trigger>
                           <Select.IndicatorGroup>
                              <Select.Indicator />
                           </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                           <Select.Positioner>
                              <Select.Content>
                                 {programLevelCollection
                                    .items
                                    .map((level) => (
                                       <Select.Item
                                          item={level}
                                          key={level.value}
                                       >
                                          {level.label}
                                          <Select.ItemIndicator />
                                       </Select.Item>
                                    ))}
                              </Select.Content>
                           </Select.Positioner>
                        </Portal>
                     </Select.Root>
                  )}
               </form.Field>
            </Stack>
         </VStack>
      </form>
   );
};

const coopCycleCollection = createListCollection({
   items: coopCycle.map((value) => ({ label: value, value })),
});

const coopYearCollection = createListCollection({
   items: coopYear.map((value) => ({ label: value, value })),
});

const programLevelCollection = createListCollection({
   items: programLevel.map((value) => ({ label: value, value })),
});
