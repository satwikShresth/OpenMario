import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import CoopDetailsFields from './CoopDetails.Fields';

const { fieldContext, formContext } = createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
   fieldContext,
   formContext,
   fieldComponents: {},
   formComponents: {},
});

export type withForm = typeof withForm;

export const defaultValues = {
   step: 2,
   canPrev: true,
   canFinish: false,
   program_level: 'Undergraduate',
   coop_cycle: 'Fall/Winter',
   coop_year: '1st',
   year: 0,
   coop_round: 'A',
};

export const Fields = {
   useAppForm,
   defaultValues,
   CoopDetailsFields: CoopDetailsFields(withForm),
};
