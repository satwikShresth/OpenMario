import {
   Badge,
   Field,
   HStack,
   InputGroup,
   NumberInput,
   Slider,
   Stack,
   useBreakpointValue,
} from '@chakra-ui/react';
import type { withForm } from './index.tsx';
import { defaultValues, isInvalid } from '../helpers.ts';
import { capitalizeWords } from '@/helpers/index.ts';
import { LuDollarSign } from 'react-icons/lu';

export default (withForm: withForm) =>
   withForm({
      defaultValues,
      render: ({ form }) => {
         const isMobile = useBreakpointValue({ base: true, md: false });
         const min = 0;
         const max = 60;
         const marks = Array.from(
            { length: max - min + 1 },
            (_, i) => i % 5 === 0 ? ({ value: i + min, label: i + min }) : null,
         ).filter((value) => value !== null);

         const wageMin = 0;
         const wageMax = 100;
         const wageMarks = Array.from(
            { length: wageMax - wageMin + 1 },
            (_, i) => i % 10 === 0 ? ({ value: i + min, label: i + min }) : null,
         ).filter((value) => value !== null);

         return (
            <Stack
               direction={isMobile ? 'column' : 'row'}
               mb={2}
               gap={6}
               mt={3}
               justify='space-between'
            >
               <form.Field name='work_hours'>
                  {({ state, handleBlur, handleChange, name }) => (
                     <Field.Root required invalid={isInvalid({ state })}>
                        <Slider.Root
                           width='full'
                           minW='300px'
                           min={min}
                           max={max}
                           onBlur={handleBlur}
                           value={[state.value]}
                           onValueChange={({ value }) =>
                              handleChange(value[0])}
                           colorPalette='cyan'
                           _invalid={{ colorPalette: 'red' }}
                        >
                           <HStack justify='space-between'>
                              <Slider.Label fontSize='md'>
                                 {capitalizeWords(name.replaceAll('_', ' '))}
                                 <Field.RequiredIndicator
                                    ml={1}
                                    fallback={<Badge size='xs' variant='surface'>Optional</Badge>}
                                 />
                              </Slider.Label>
                              <NumberInput.Root
                                 minW='120px'
                                 width='120px'
                                 required
                                 variant='subtle'
                                 onBlur={handleBlur}
                                 value={String(state.value)}
                                 //@ts-ignore: shut up
                                 onValueChange={({ value }) =>
                                    handleChange(parseInt(value[0]))}
                              >
                                 <InputGroup endElement='hrs/week'>
                                    <NumberInput.Input />
                                 </InputGroup>
                              </NumberInput.Root>
                           </HStack>
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
                              <Slider.Marks fontWeight='medium' marks={marks} />
                           </Slider.Control>
                           <Field.HelperText mt={2}>
                              Required weekly work hours
                           </Field.HelperText>
                        </Slider.Root>
                        <Field.ErrorText>
                           {/*@ts-ignore: shut up*/}
                           {state.meta.errors.map(({ message }) => message).join(', ')}
                        </Field.ErrorText>
                     </Field.Root>
                  )}
               </form.Field>
               <form.Subscribe selector={(state) => state.values.work_hours}>
                  {(work_hours) => (
                     <form.Field name='compensation'>
                        {({ state, handleBlur, handleChange, name }) => (
                           <Field.Root required invalid={isInvalid({ state })}>
                              <Slider.Root
                                 width='full'
                                 minW='300px'
                                 min={wageMin}
                                 onBlur={handleBlur}
                                 value={[state.value]}
                                 defaultValue={[15]}
                                 onValueChange={({ value }) =>
                                    handleChange(value[0])}
                                 colorPalette='cyan'
                                 _invalid={{ colorPalette: 'red' }}
                              >
                                 <HStack justify='space-between'>
                                    <Slider.Label fontSize='md'>
                                       {capitalizeWords(name.replaceAll('_', ' '))}
                                       <Field.RequiredIndicator ml={1} />
                                    </Slider.Label>
                                    <NumberInput.Root
                                       minW='110px'
                                       width='110px'
                                       required
                                       variant='subtle'
                                       onBlur={handleBlur}
                                       defaultValue='15'
                                       value={String(state.value)}
                                       //@ts-ignore: shut up
                                       onValueChange={({ value }) =>
                                          handleChange(parseInt(value[0]))}
                                    >
                                       <InputGroup startElement={<LuDollarSign />} endElement='/hr'>
                                          <NumberInput.Input />
                                       </InputGroup>
                                    </NumberInput.Root>
                                 </HStack>
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
                                    <Slider.Marks fontWeight='medium' marks={wageMarks} />
                                 </Slider.Control>
                                 <Field.HelperText mt={2}>
                                    Weekly Compensation: ${work_hours * state.value}
                                 </Field.HelperText>
                                 <Field.ErrorText>
                                    {/*@ts-ignore: shut up*/}
                                    {state.meta.errors.map(({ message }) => message).join(
                                       ', ',
                                    )}
                                 </Field.ErrorText>
                              </Slider.Root>
                           </Field.Root>
                        )}
                     </form.Field>
                  )}
               </form.Subscribe>
            </Stack>
         );
      },
   });
