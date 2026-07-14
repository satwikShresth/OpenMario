import { Field, Select, Stack, Text } from '@chakra-ui/react'
import type { withForm } from './context'
import {
   capitalizeWords,
   defaultValues,
   isInvalid,
   orpc,
   programLevelCollection,
   useSearchClient,
} from '@/helpers'
import {
   parseLocationLabel,
   searchLocationOptions,
   type EntityOption,
} from '@/helpers/salary-meili'
import { useMobile } from '@/hooks'
import { AsyncCreatableSelect } from 'chakra-react-select'
import { useMutation } from '@tanstack/react-query'
import { toaster } from '@/components/ui/toaster'
import { asyncComponents } from '@/components/common'
import { useEntityCreateBusy } from './entityCreateBusy'

function entityValue(id: string | undefined, name: string | undefined): EntityOption | null {
   if (id && name) return { value: id, label: name, variant: 'subtle' }
   return null
}

export default (withForm: withForm) =>
   withForm({
      defaultValues,
      render: ({ form }) => {
         const isMobile = useMobile()
         const { searchClient } = useSearchClient()
         const createBusy = useEntityCreateBusy()
         const createLocation = useMutation(orpc.location.create.mutationOptions())

         return (
            <Stack direction={isMobile ? 'column' : 'row'} mb={2} gap={6} mt={3}>
               <form.Field name='location'>
                  {field => (
                     <Field.Root required invalid={isInvalid({ field })}>
                        <Field.Label fontSize='md'>
                           {capitalizeWords(field.name)}
                           <Field.RequiredIndicator />
                        </Field.Label>
                        {/*@ts-ignore*/}
                        <AsyncCreatableSelect
                           name='location'
                           required
                           components={asyncComponents}
                           placeholder='Select a location'
                           isDisabled={createBusy.busy}
                           isLoading={createLocation.isPending}
                           loadingMessage={() => 'Loading…'}
                           noOptionsMessage={() => 'Keep typing — or add “City, ST”'}
                           value={entityValue(
                              form.getFieldValue('location_id'),
                              field.state.value,
                           )}
                           defaultOptions
                           cacheOptions
                           onBlur={field.handleBlur}
                           onChange={(opt: EntityOption | null, meta?: { action?: string }) => {
                              if (!opt) {
                                 if (
                                    meta?.action === 'clear' ||
                                    meta?.action === 'pop-value' ||
                                    meta?.action === 'remove-value'
                                 ) {
                                    field.handleChange('')
                                    form.setFieldValue('location_id', '')
                                 }
                                 return
                              }
                              field.handleChange(opt.label)
                              form.setFieldValue('location_id', opt.value)
                           }}
                           onCreateOption={async label => {
                              const parsed = parseLocationLabel(label)
                              if (!parsed) {
                                 toaster.create({
                                    title: 'Use “City, ST” format',
                                    type: 'warning',
                                 })
                                 return
                              }
                              createBusy.begin('Creating location…')
                              try {
                                 const { location } = await createLocation.mutateAsync(parsed)
                                 field.handleChange(location.label)
                                 form.setFieldValue('location_id', location.id)
                                 toaster.create({
                                    title: 'Location added',
                                    type: 'success',
                                 })
                              } catch (e) {
                                 console.error(e)
                                 toaster.create({
                                    title: 'Failed to create location',
                                    type: 'error',
                                 })
                              } finally {
                                 createBusy.end()
                              }
                           }}
                           loadOptions={(inputValue, callback) => {
                              const q = inputValue.length >= 1 ? inputValue : field.state.value
                              if (!q || q.length < 1) {
                                 callback([])
                                 return
                              }
                              void searchLocationOptions(searchClient as never, q)
                                 .then(callback)
                                 .catch(() => callback([]))
                           }}
                           formatCreateLabel={(input: string) => `Add location “${input}”`}
                        />
                        <Field.HelperText>
                           <Text textStyle='2xs' color='fg.muted'>
                              Prefer City, ST — add if it is not listed
                           </Text>
                        </Field.HelperText>
                     </Field.Root>
                  )}
               </form.Field>

               <form.Field name='program_level'>
                  {({ state, handleChange, handleBlur, name }) => (
                     <Field.Root required invalid={isInvalid({ state })}>
                        <Select.Root
                           value={[state?.value!]}
                           onValueChange={({ value: [change] }) =>
                              //@ts-ignore
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
                                 {programLevelCollection.items.map(level => (
                                    <Select.Item item={level} key={level.value}>
                                       {level.label}
                                       <Select.ItemIndicator />
                                    </Select.Item>
                                 ))}
                              </Select.Content>
                           </Select.Positioner>
                        </Select.Root>
                     </Field.Root>
                  )}
               </form.Field>
            </Stack>
         )
      },
   })
