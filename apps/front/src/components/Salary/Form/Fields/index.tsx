import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import PositionFields from './PositionFields';
import CompensationFields from './CompensationFields';
import CoopDetailsFields from './CoopDetailsFields';
import Footer from './Footer';
import LocationProgramFields from './LocationProgramFields';
import OtherDetailFields from './OtherDetailFields';

const { fieldContext, formContext } = createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
   fieldContext,
   formContext,
   fieldComponents: {},
   formComponents: {},
});

export type withForm = typeof withForm;

export const Fields = {
   useAppForm,
   PositionFields: PositionFields(withForm),
   CompensationFields: CompensationFields(withForm),
   CoopDetailsFields: CoopDetailsFields(withForm),
   OtherDetailFields: OtherDetailFields(withForm),
   LocationProgramFields: LocationProgramFields(withForm),
   Footer: Footer(withForm),
};
