import {
   Badge,
   Field,
   NumberInput,
   Select,
   Stack,
   Text,
   useBreakpointValue,
} from '@chakra-ui/react';
import type { withForm } from './index.tsx';
import { coopCycleCollection, coopYearCollection, defaultValues, isInvalid } from '../helpers.ts';
import { capitalizeWords } from '@/helpers/index.ts';

export default (withForm: withForm) =>
   withForm({
      defaultValues,
      render: ({ form }) => {
         const isMobile = useBreakpointValue({ base: true, md: false });
         return (
            <Stack
               direction={isMobile ? 'column' : 'row'}
               gap={6}
               mt={3}
               justify='space-between'
            >
               <form.Field name='year'>
                  {({ state, handleChange, handleBlur, name }) => (
                     <Field.Root required invalid={isInvalid({ state })}>
                        <NumberInput.Root
                           minW='200px'
                           width='full'
                           required
                           name={name}
                           defaultValue={String(new Date().getFullYear())}
                           min={2015}
                           max={new Date().getFullYear() + 1}
                           value={String(state.value)}
                           onBlur={handleBlur}
                           //@ts-ignore: shut up
                           onValueChange={({ value }) =>
                              handleChange(parseInt(value))}
                        >
                           <NumberInput.Label fontSize='md'>
                              {capitalizeWords(name)}
                              <Field.RequiredIndicator
                                 ml={1}
                                 fallback={<Badge size='xs' variant='surface'>Optional</Badge>}
                              />
                           </NumberInput.Label>
                           <NumberInput.Input mt={1} />
                        </NumberInput.Root>
                        <Field.ErrorText>
                           {/*@ts-ignore: shut up*/}
                           {state.meta.errors.map(({ message }) =>
                              message
                           ).join(', ')}
                        </Field.ErrorText>
                     </Field.Root>
                  )}
               </form.Field>
               <form.Field name='coop_year'>
                  {({ state, handleBlur, handleChange, name }) => (
                     <Field.Root required invalid={isInvalid({ state })}>
                        <Select.Root
                           minW='200px'
                           width='full'
                           value={[state?.value]}
                           required
                           onBlur={handleBlur}
                           onValueChange={({ value }) =>
                              //@ts-ignore: shut up
                              handleChange(value[0])}
                           collection={coopYearCollection}
                        >
                           <Select.HiddenSelect />
                           <Select.Label>
                              {capitalizeWords(name.replaceAll('_', ' '))}
                              <Field.RequiredIndicator
                                 ml={1}
                                 fallback={<Badge size='xs' variant='surface'>Optional</Badge>}
                              />
                           </Select.Label>
                           <Select.Control>
                              <Select.Trigger>
                                 <Select.ValueText placeholder='Select coop year' />
                              </Select.Trigger>
                              <Select.IndicatorGroup>
                                 <Select.Indicator />
                              </Select.IndicatorGroup>
                           </Select.Control>
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
                        </Select.Root>
                        <Field.ErrorText>
                           {/*@ts-ignore: shut up*/}
                           {state.meta.errors.map(({ message }) =>
                              message
                           ).join(', ')}
                        </Field.ErrorText>
                     </Field.Root>
                  )}
               </form.Field>
               <form.Field name='coop_cycle'>
                  {({ state, handleBlur, handleChange, name }) => (
                     <Field.Root required invalid={isInvalid({ state })}>
                        <Select.Root
                           value={[state?.value]}
                           minW='200px'
                           width='full'
                           required
                           onBlur={handleBlur}
                           onValueChange={({ value }) =>
                              //@ts-ignore: shut up
                              handleChange(value[0])}
                           collection={coopCycleCollection}
                        >
                           <Select.HiddenSelect />
                           <Select.Label>
                              {capitalizeWords(name.replaceAll('_', ' '))}
                              <Field.RequiredIndicator
                                 ml={1}
                                 fallback={<Badge size='xs' variant='surface'>Optional</Badge>}
                              />
                           </Select.Label>
                           <Select.Control>
                              <Select.Trigger>
                                 <Select.ValueText placeholder='Select coop cycle' />
                              </Select.Trigger>
                              <Select.IndicatorGroup>
                                 <Select.Indicator />
                              </Select.IndicatorGroup>
                           </Select.Control>
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
                           {isInvalid({ state }) && (
                              <Text color='red' mt={2}>
                                 {/*@ts-ignore: shut up*/}
                                 {state.meta.errors.map(({ message }) => message).join(', ')}
                              </Text>
                           )}
                        </Select.Root>
                        <Field.ErrorText>
                           {/*@ts-ignore: shut up*/}
                           {state.meta.errors.map(({ message }) =>
                              message
                           ).join(', ')}
                        </Field.ErrorText>
                     </Field.Root>
                  )}
               </form.Field>
            </Stack>
         );
      },
   });
