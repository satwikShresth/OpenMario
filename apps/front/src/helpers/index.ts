import type { CheckFn } from 'zod/v4/core';

export const coopYear = ['1st', '2nd', '3rd'] as const;
export const coopCycle = [
   'Fall/Winter',
   'Winter/Spring',
   'Spring/Summer',
   'Summer/Fall',
] as const;
export const programLevel = ['Undergraduate', 'Graduate'] as const;

export const zodCheckUnique: CheckFn<(string | number)[]> = (ctx) => {
   if (ctx.value.length !== new Set(ctx.value).size) {
      ctx.issues.push({
         code: 'custom',
         message: `No duplicates allowed.`,
         input: ctx.value,
         continue: false, // make this issue continuable (default: false)
      });
   }
};
