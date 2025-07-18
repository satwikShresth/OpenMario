import { asyncComponents } from "@/components/common";
import { createListCollection } from "@chakra-ui/react";
import { programLevel, coopYear, coopCycle } from "@/helpers";
import type { SubmissionAggregate as Submission } from "@/client";

export const selectProps = ({
  state,
  name,
  handleChange,
  handleBlur,
}: any) => ({
  name,
  required: true,
  value:
    state?.value.length > 0
      ? { value: state?.value, label: state?.value, variant: "subtle" }
      : null,
  loadingMessage: () => "Loading...",
  placeholder: `Select a ${name}`,
  components: asyncComponents,
  onBlur: handleBlur,
  invalid: state.meta.isDirty && !state.meta.isValid,
  //@ts-ignore: shut up
  onChange: ({ value }) => handleChange(value),
  noOptionsMessage: () => "Keeping typing for autocomplete",
});

export const isInvalid = ({ state, field }: any) =>
  state !== undefined
    ? state.meta.isDirty && !state.meta.isValid
    : field.state.meta.isDirty && !field.state.meta.isValid;

type AutocompleteOptions = {
  value: string;
  label: string;
  variant: string;
};

export const convertFunc = (
  value: string | { name: string } | undefined,
): AutocompleteOptions => ({
  value: typeof value === "string" ? value : value?.name || "",
  label: typeof value === "string" ? value : value?.name || "",
  variant: "subtle",
});

export const coopCycleCollection = createListCollection({
  items: coopCycle.map((value) => ({ label: value, value })),
});

export const coopYearCollection = createListCollection({
  items: coopYear.map((value) => ({ label: value, value })),
});

export const programLevelCollection = createListCollection({
  items: programLevel.map((value) => ({ label: value, value })),
});

export const defaultValues: Submission = {
  company: "",
  position: "",
  location: "",
  program_level: "Undergraduate",
  coop_cycle: "Fall/Winter",
  coop_year: "1st",
  year: new Date().getFullYear(),
  work_hours: 40,
  compensation: 15.0,
  other_compensation: "",
  details: `Employer ID: 'N/A', Position ID: 'N/A', Job Length: 'N/A', Coop Round: 'N/A'`,
};
