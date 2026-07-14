import { z } from 'zod'

export const COOP_YEAR = ['1st', '2nd', '3rd'] as const
export const COOP_CYCLE = [
   'Fall/Winter',
   'Winter/Spring',
   'Spring/Summer',
   'Summer/Fall',
] as const
export const PROGRAM_LEVEL = ['Undergraduate', 'Graduate'] as const

export const salaryOfferSchema = z.object({
   company: z.string().min(3).max(100),
   position: z.string().min(3).max(100),
   location: z.string().min(1),
   work_hours: z.number().int().min(5).max(60),
   compensation: z.number().nonnegative(),
   other_compensation: z.string().max(255).optional().default(''),
   details: z.string().max(255).optional().default(''),
   year: z.number().int().min(2005).max(2100),
   coop_year: z.enum(COOP_YEAR),
   coop_cycle: z.enum(COOP_CYCLE),
   program_level: z.enum(PROGRAM_LEVEL),
})

export const salaryBatchSchema = z.object({
   v: z.literal(1),
   offers: z.array(salaryOfferSchema).min(1).max(50),
})

export type SalaryOffer = z.infer<typeof salaryOfferSchema>
export type SalaryBatch = z.infer<typeof salaryBatchSchema>

/** Compact wire format (short keys) for smaller share URLs. */
export type CompactSalaryOffer = {
   c: string
   p: string
   l: string
   w: number
   $: number
   oc?: string
   d?: string
   y: number
   cy: 0 | 1 | 2
   cc: 0 | 1 | 2 | 3
   pl: 0 | 1
}

export type CompactSalaryBatch = {
   v: 1
   o: CompactSalaryOffer[]
}
