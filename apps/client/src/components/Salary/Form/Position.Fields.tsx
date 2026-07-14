import { Field, Stack, Text } from '@chakra-ui/react'
import type { withForm } from './context'
import { capitalizeWords, defaultValues, isInvalid, orpc, useSearchClient } from '@/helpers'
import {
   searchCompanyOptions,
   searchPositionOptions,
   type EntityOption,
} from '@/helpers/salary-meili'
import { AsyncCreatableSelect } from 'chakra-react-select'
import { useMutation } from '@tanstack/react-query'
import { useMobile } from '@/hooks'
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
         const createCompany = useMutation(orpc.company.create.mutationOptions())
         const createPosition = useMutation(orpc.position.create.mutationOptions())

         return (
            <Stack direction={isMobile ? 'column' : 'row'} mb={2} gap={6}>
               <form.Field
                  name='company'
                  listeners={{
                     onChange: ({ value, fieldApi }) => {
                        const current = fieldApi.form.getFieldValue('position')
                        if (value && current) {
                           fieldApi.form.setFieldValue('position', '')
                           fieldApi.form.setFieldValue('position_id', '')
                        }
                     },
                  }}
               >
                  {field => (
                     <Field.Root required invalid={isInvalid({ field })}>
                        <Field.Label fontSize='md'>
                           {capitalizeWords(field.name)}
                           <Field.RequiredIndicator />
                        </Field.Label>
                        {/*@ts-ignore*/}
                        <AsyncCreatableSelect
                           name='company'
                           required
                           components={asyncComponents}
                           placeholder='Select a company'
                           isDisabled={createBusy.busy}
                           isLoading={createCompany.isPending}
                           loadingMessage={() => 'Loading…'}
                           noOptionsMessage={() => 'Keep typing — or add a new company'}
                           value={entityValue(
                              form.getFieldValue('company_id'),
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
                                    form.setFieldValue('company_id', '')
                                    form.setFieldValue('position', '')
                                    form.setFieldValue('position_id', '')
                                 }
                                 return
                              }
                              field.handleChange(opt.label)
                              form.setFieldValue('company_id', opt.value)
                           }}
                           onCreateOption={async name => {
                              createBusy.begin('Creating company…')
                              try {
                                 const { company } = await createCompany.mutateAsync({ name })
                                 field.handleChange(company.name)
                                 form.setFieldValue('company_id', company.id)
                                 form.setFieldValue('position', '')
                                 form.setFieldValue('position_id', '')
                                 toaster.create({
                                    title: 'Company added',
                                    type: 'success',
                                 })
                              } catch (e) {
                                 console.error(e)
                                 toaster.create({
                                    title: 'Failed to create company',
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
                              void searchCompanyOptions(searchClient as never, q)
                                 .then(callback)
                                 .catch(() => callback([]))
                           }}
                           formatCreateLabel={(input: string) => `Add company “${input}”`}
                        />
                        <Field.HelperText>
                           <Text textStyle='2xs' color='fg.muted'>
                              Pick a match or add a new company when none appear
                           </Text>
                        </Field.HelperText>
                     </Field.Root>
                  )}
               </form.Field>

               <form.Subscribe selector={state => state.values.company_id}>
                  {companyId => (
                     <form.Field name='position'>
                        {field => (
                           <Field.Root required invalid={isInvalid({ field })}>
                              <Field.Label fontSize='md'>
                                 {capitalizeWords(field.name)}
                                 <Field.RequiredIndicator />
                              </Field.Label>
                              {/*@ts-ignore*/}
                              <AsyncCreatableSelect
                                 name='position'
                                 required
                                 components={asyncComponents}
                                 placeholder='Select a position'
                                 isDisabled={!companyId || createBusy.busy}
                                 isLoading={createPosition.isPending}
                                 loadingMessage={() => 'Loading…'}
                                 noOptionsMessage={() =>
                                    companyId
                                       ? 'Keep typing — or add a new position'
                                       : 'Select a company first'
                                 }
                                 value={entityValue(
                                    form.getFieldValue('position_id'),
                                    field.state.value,
                                 )}
                                 defaultOptions
                                 cacheOptions
                                 onBlur={field.handleBlur}
                                 onChange={(
                                    opt: EntityOption | null,
                                    meta?: { action?: string },
                                 ) => {
                                    if (!opt) {
                                       if (
                                          meta?.action === 'clear' ||
                                          meta?.action === 'pop-value' ||
                                          meta?.action === 'remove-value'
                                       ) {
                                          field.handleChange('')
                                          form.setFieldValue('position_id', '')
                                       }
                                       return
                                    }
                                    field.handleChange(opt.label)
                                    form.setFieldValue('position_id', opt.value)
                                 }}
                                 onCreateOption={async name => {
                                    if (!companyId) return
                                    createBusy.begin('Creating position…')
                                    try {
                                       const { position } = await createPosition.mutateAsync({
                                          name,
                                          company_id: companyId,
                                       })
                                       field.handleChange(position.name)
                                       form.setFieldValue('position_id', position.id)
                                       toaster.create({
                                          title: 'Position added',
                                          type: 'success',
                                       })
                                    } catch (e) {
                                       console.error(e)
                                       toaster.create({
                                          title: 'Failed to create position',
                                          type: 'error',
                                       })
                                    } finally {
                                       createBusy.end()
                                    }
                                 }}
                                 loadOptions={(inputValue, callback) => {
                                    if (!companyId) {
                                       callback([])
                                       return
                                    }
                                    const q =
                                       inputValue.length >= 1 ? inputValue : field.state.value
                                    if (!q || q.length < 1) {
                                       callback([])
                                       return
                                    }
                                    void searchPositionOptions(searchClient as never, q, companyId)
                                       .then(callback)
                                       .catch(() => callback([]))
                                 }}
                                 formatCreateLabel={(input: string) => `Add position “${input}”`}
                              />
                           </Field.Root>
                        )}
                     </form.Field>
                  )}
               </form.Subscribe>
            </Stack>
         )
      },
   })
