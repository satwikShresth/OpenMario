import type { CheckFn } from "zod/v4/core";
import { asyncComponents } from "@/components/common";
import { createListCollection } from "@chakra-ui/react";
import type { SubmissionAggregate as Submission } from "@/client";

export const coopYear = ["1st", "2nd", "3rd"] as const;
export const coopCycle = [
  "Fall/Winter",
  "Winter/Spring",
  "Spring/Summer",
  "Summer/Fall",
] as const;
export const programLevel = ["Undergraduate", "Graduate"] as const;
export const coopRound = ["A", "B", "C"] as const;

export const zodCheckUnique: CheckFn<(string | number)[]> = (ctx) => {
  if (ctx.value.length !== new Set(ctx.value).size) {
    ctx.issues.push({
      code: "custom",
      message: `No duplicates allowed.`,
      input: ctx.value,
      continue: false, // make this issue continuable (default: false)
    });
  }
};

export const capitalizeWords = (str: string) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

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
  invalid: !state.meta.isValid,
  //@ts-ignore: shut up
  onChange: ({ value }) => handleChange(value),
  noOptionsMessage: () => "Keeping typing for autocomplete",
});

export const isInvalid = ({ state, field }: any) =>
  state !== undefined ? !state.meta.isValid : !field.state.meta.isValid;

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

export const coopRoundCollection = createListCollection({
  items: coopRound.map((value) => ({ label: value, value })),
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

export const marksMaker = (min: number, max: number, div: number) =>
  Array.from({ length: max - min + 1 }, (_, i) =>
    i % div === 0 ? { value: i + min, label: i + min } : null,
  ).filter((value) => value !== null);
