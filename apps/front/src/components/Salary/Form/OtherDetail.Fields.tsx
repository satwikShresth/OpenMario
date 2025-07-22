import { Badge, Field, Textarea, VStack } from '@chakra-ui/react';
import type { withForm } from './context';
import { defaultValues, isInvalid } from '@/helpers';
import { capitalizeWords } from '@/helpers/index.ts';

export default (withForm: withForm) =>
   withForm({
      defaultValues,
      render: ({ form }) => (
         <VStack gap={6}>
            <form.Field name='other_compensation'>
               {({ state, handleBlur, handleChange, name }) => (
                  <Field.Root invalid={isInvalid({ state })}>
                     <Field.Label fontSize='md'>
                        {capitalizeWords(name.replaceAll('_', ' '))}
                        <Field.RequiredIndicator
                           fallback={<Badge size='xs' variant='surface'>Optional</Badge>}
                        />
                     </Field.Label>
                     <Textarea
                        value={state.value}
                        onBlur={handleBlur}
                        onChange={({ target: { value } }) =>
                           handleChange(value)}
                        placeholder='1000$ stipend; Monthly septa pass; 20 PTO'
                        variant='outline'
                     />
                     <Field.HelperText>Max 256 characters.</Field.HelperText>
                  </Field.Root>
               )}
            </form.Field>
            <form.Field name='details'>
               {({ state, handleBlur, handleChange, name }) => (
                  <Field.Root invalid={isInvalid({ state })}>
                     <Field.Label fontSize='md'>
                        {capitalizeWords(name.replaceAll('_', ' '))}
                        <Field.RequiredIndicator
                           fallback={<Badge size='xs' variant='surface'>Optional</Badge>}
                        />
                     </Field.Label>
                     <Textarea
                        value={state.value}
                        onBlur={handleBlur}
                        onChange={({ target: { value } }) =>
                           handleChange(value)}
                        placeholder='1000$ stipend; Monthly septa pass; 20 PTO'
                        variant='outline'
                     />
                     <Field.HelperText>Max 256 characters.</Field.HelperText>
                     <Field.ErrorText>
                        {/*@ts-ignore: shut up*/}
                        {state.meta.errors.map(({ message }) => message).join(', ')}
                     </Field.ErrorText>
                  </Field.Root>
               )}
            </form.Field>
         </VStack>
      ),
   });
