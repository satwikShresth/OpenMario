import { Badge, Box, Field, HStack, NumberInput, Select, Text } from '@chakra-ui/react';
import type { withForm } from './index.tsx';
import {
   capitalizeWords,
   coopCycleCollection,
   coopRoundCollection,
   coopYearCollection,
   isInvalid,
   programLevelCollection,
} from '@/helpers';
import { defaultValues } from './index';
import { year } from '@/routes/-validator.ts';

export default (withForm: withForm) =>
   withForm({
      defaultValues,
      render: ({ form }) => {
         return (
            <Box>
               <HStack gap={6} mt={3}>
                  <form.Field
                     name='year'
                     //@ts-ignore: shutup
                     validators={{ onMount: year, onChange: year }}
                  >
                     {({ state, handleChange, handleBlur, name }) => (
                        <Field.Root required invalid={isInvalid({ state })}>
                           <NumberInput.Root
                              minW='200px'
                              width='full'
                              required
                              name={name}
                              min={2005}
                              value={String(state.value)}
                              onBlur={handleBlur}
                              //@ts-ignore: shut up
                              onValueChange={({ value }) =>
                                 handleChange(parseInt(value!) || 0)}
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
                           <Field.HelperText>
                              Year you recieved an offer
                           </Field.HelperText>
                           <Field.ErrorText>
                              {/*@ts-ignore: shut up*/}
                              {state.meta.errors.map(({ message }) =>
                                 message
                              ).join(', ')}
                           </Field.ErrorText>
                        </Field.Root>
                     )}
                  </form.Field>
                  <form.Field name='coop_round'>
                     {({ state, handleBlur, handleChange, name }) => (
                        <Field.Root required invalid={isInvalid({ state })}>
                           <Select.Root
                              value={[state?.value]}
                              required
                              onBlur={handleBlur}
                              onValueChange={({ value }) =>
                                 //@ts-ignore: shut up
                                 handleChange(value[0])}
                              collection={coopRoundCollection}
                           >
                              <Select.HiddenSelect />
                              <Select.Label>
                                 {capitalizeWords(name.replaceAll('_', ' '))}
                                 <Field.RequiredIndicator ml={1} />
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
                                    {coopRoundCollection
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
               </HStack>
               <HStack gap={6} mt={3}>
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
                  <form.Field name='program_level'>
                     {({ state, handleChange, handleBlur, name }) => (
                        <Field.Root required invalid={isInvalid({ state })}>
                           <Select.Root
                              minW='170px'
                              width='full'
                              value={[state?.value!]}
                              onValueChange={({ value: [change] }) =>
                                 //@ts-ignore: shut up
                                 handleChange(change!)}
                              collection={programLevelCollection}
                              required
                              onBlur={handleBlur}
                           >
                              <Select.HiddenSelect />
                              <Select.Label fontSize='md'>
                                 {capitalizeWords(name.replaceAll('_', ' '))}
                                 <Field.RequiredIndicator ml={1} />
                              </Select.Label>
                              <Select.Control>
                                 <Select.Trigger>
                                    <Select.ValueText />
                                 </Select.Trigger>
                                 <Select.IndicatorGroup>
                                    <Select.Indicator />
                                 </Select.IndicatorGroup>
                              </Select.Control>
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

                  <form.Subscribe
                     selector={(state) => [state.isValid, state.isDirty]}
                  >
                     {([isValid, isDirty]) => (isValid && isDirty) ? null : null}
                  </form.Subscribe>
               </HStack>
            </Box>
         );
      },
   });
