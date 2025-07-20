import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import PositionFields from "./Position.Fields";
import CompensationFields from "./Compensation.Fields";
import CoopDetailsFields from "./CoopDetails.Fields";
import Footer from "./Footer";
import LocationProgramFields from "./LocationProgram.Fields";
import OtherDetailFields from "./OtherDetail.Fields";

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
