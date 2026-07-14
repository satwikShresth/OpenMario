import type { CheckFn } from 'zod/v4/core';
import { asyncComponents } from '@/components/common';
import { createListCollection } from '@chakra-ui/react';
import type { Submission } from '@/routes/-validator';
export * from './rpc';

export const coopYear = ['1st', '2nd', '3rd'] as const;
export const queryFields = [
   'coop',
   'company',
   'position',
   'location',
   'year',
   'compensation'
] as const;
export const coopCycle = [
   'Fall/Winter',
   'Winter/Spring',
   'Spring/Summer',
   'Summer/Fall'
] as const;
export const programLevel = ['Undergraduate', 'Graduate'] as const;
export const coopRound = ['A', 'B', 'C'] as const;

export const zodCheckUnique: CheckFn<(string | number)[]> = ctx => {
   if (ctx.value.length !== new Set(ctx.value).size) {
      ctx.issues.push({
         code: 'custom',
         message: `No duplicates allowed.`,
         input: ctx.value,
         continue: false // make this issue continuable (default: false)
      });
   }
};

export const capitalizeWords = (str: string) =>
   str.replace(/\b\w/g, char => char.toUpperCase());

type AutocompleteOptions = {
   value: string;
   label: string;
   variant: 'subtle';
};

export const selectProps = ({
   state,
   name,
   handleChange,
   handleBlur
}: any) => {
   const option =
      state?.value && String(state.value).length > 0
         ? { value: state.value, label: state.value, variant: 'subtle' as const }
         : null

   return {
      name,
      required: true,
      value: option,
      // Ensure prefilled string values (link / draft import) render without a prior search.
      defaultOptions: option ? [option] : true,
      cacheOptions: true,
      loadingMessage: () => 'Loading...',
      placeholder: `Select a ${name}`,
      components: asyncComponents,
      onBlur: handleBlur,
      invalid: !state.meta.isValid,
      onChange: (
         next: AutocompleteOptions | null,
         meta?: { action?: string },
      ) => {
         if (!next) {
            // Ignore mount/sync nulls — only clear when the user clears the control.
            if (
               meta?.action === 'clear' ||
               meta?.action === 'pop-value' ||
               meta?.action === 'remove-value'
            ) {
               handleChange('')
            }
            return
         }
         handleChange(next.value)
      },
      noOptionsMessage: () => 'Keeping typing for autocomplete',
   }
}

export const isInvalid = ({ state, field }: any) =>
   state !== undefined ? !state.meta.isValid : !field.state.meta.isValid;

export const convertFunc = (
   value: string | { name: string } | undefined
): AutocompleteOptions => ({
   value: typeof value === 'string' ? value : value?.name || '',
   label: typeof value === 'string' ? value : value?.name || '',
   variant: 'subtle'
});

export const coopCycleCollection = createListCollection({
   items: coopCycle.map(value => ({ label: value, value }))
});

export const coopRoundCollection = createListCollection({
   items: coopRound.map(value => ({ label: value, value }))
});

export const coopYearCollection = createListCollection({
   items: coopYear.map(value => ({ label: value, value }))
});

export const programLevelCollection = createListCollection({
   items: programLevel.map(value => ({ label: value, value }))
});

export const defaultValues: Submission = {
   company: '',
   position: '',
   location: '',
   company_id: '',
   position_id: '',
   location_id: '',
   program_level: 'Undergraduate',
   coop_cycle: 'Fall/Winter',
   coop_year: '1st',
   year: new Date().getFullYear(),
   work_hours: 40,
   compensation: 15.0,
   other_compensation: '',
   details: ''
};

export const marksMaker = (min: number, max: number, div: number) =>
   Array.from({ length: max - min + 1 }, (_, i) =>
      i % div === 0 ? { value: i + min, label: i + min } : null
   ).filter(value => value !== null);

export const formatTime = (timeString: any) => {
   if (!timeString) return '';

   const [hours, minutes] = timeString.split(':');

   let hour = Number.parseInt(hours, 10);
   const ampm = hour >= 12 ? 'PM' : 'AM';
   hour = hour % 12 || 12; // Convert 0 to 12 for 12 AM

   return `${hour}:${minutes} ${ampm}`;
};
