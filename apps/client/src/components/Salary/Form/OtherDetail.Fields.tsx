import { Badge, Field, Textarea, VStack } from '@chakra-ui/react'
import type { withForm } from './context'
import { defaultValues, isInvalid } from '@/helpers'
import { capitalizeWords } from '@/helpers/index.ts'

function errorText(errors: unknown[]): string {
   return errors
      .map(err => {
         if (typeof err === 'string') return err
         if (err && typeof err === 'object' && 'message' in err) {
            return String((err as { message: unknown }).message)
         }
         return null
      })
      .filter(Boolean)
      .join(', ')
}

export default (withForm: withForm) =>
   withForm({
      defaultValues,
      render: ({ form }) => (
         <VStack gap={6} align='stretch'>
            <form.Field name='other_compensation'>
               {({ state, handleBlur, handleChange, name }) => (
                  <Field.Root invalid={isInvalid({ state })}>
                     <Field.Label fontSize='md'>
                        {capitalizeWords(name.replaceAll('_', ' '))}
                        <Field.RequiredIndicator
                           fallback={
                              <Badge size='xs' variant='surface'>
                                 Optional
                              </Badge>
                           }
                        />
                     </Field.Label>
                     <Textarea
                        value={state.value ?? ''}
                        onBlur={handleBlur}
                        onChange={({ target: { value } }) => handleChange(value)}
                        placeholder='1000$ stipend; Monthly septa pass; 20 PTO'
                        variant='outline'
                        minH='5.5rem'
                     />
                     <Field.HelperText>Max 256 characters.</Field.HelperText>
                     <Field.ErrorText>{errorText(state.meta.errors)}</Field.ErrorText>
                  </Field.Root>
               )}
            </form.Field>
            <form.Field name='details'>
               {({ state, handleBlur, handleChange, name }) => (
                  <Field.Root invalid={isInvalid({ state })}>
                     <Field.Label fontSize='md'>
                        {capitalizeWords(name.replaceAll('_', ' '))}
                        <Field.RequiredIndicator
                           fallback={
                              <Badge size='xs' variant='surface'>
                                 Optional
                              </Badge>
                           }
                        />
                     </Field.Label>
                     <Textarea
                        value={state.value ?? ''}
                        onBlur={handleBlur}
                        onChange={({ target: { value } }) => handleChange(value)}
                        placeholder='Anything else about the co-op experience'
                        variant='outline'
                        minH='5.5rem'
                     />
                     <Field.HelperText>Max 256 characters.</Field.HelperText>
                     <Field.ErrorText>{errorText(state.meta.errors)}</Field.ErrorText>
                  </Field.Root>
               )}
            </form.Field>
         </VStack>
      ),
   })
