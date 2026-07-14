import { z } from 'zod'
import { salaryReportUrl } from '@/lib/links'
import {
   COOP_CYCLE,
   COOP_YEAR,
   PROGRAM_LEVEL,
   encodeSalaryOffers,
   salaryOfferInputSchema,
   type SalaryOfferInput,
} from '@/lib/salary-encode'

export const salaryReportCommonSchema = z.object({
   year: z.number().int().min(2005).max(2100).optional(),
   coop_year: z.enum(COOP_YEAR).optional(),
   coop_cycle: z.enum(COOP_CYCLE).optional(),
   program_level: z.enum(PROGRAM_LEVEL).optional(),
   work_hours: z.number().int().min(5).max(60).optional(),
})

/** Looser offer shape — missing fields filled from common / defaults. */
export const salaryOfferBuildInputSchema = z.object({
   company: z.string().min(3).max(100),
   position: z.string().min(3).max(100),
   location: z.string().min(1),
   compensation: z.number().nonnegative(),
   work_hours: z.number().int().min(5).max(60).optional(),
   other_compensation: z.string().max(255).optional(),
   details: z.string().max(255).optional(),
   year: z.number().int().min(2005).max(2100).optional(),
   coop_year: z.enum(COOP_YEAR).optional(),
   coop_cycle: z.enum(COOP_CYCLE).optional(),
   program_level: z.enum(PROGRAM_LEVEL).optional(),
})

export const buildSalaryReportLinkInputSchema = z.object({
   offers: z.array(salaryOfferBuildInputSchema).min(1).max(50),
   common: salaryReportCommonSchema.optional(),
   start_index: z.number().int().min(0).optional(),
})

export type BuildSalaryReportLinkInput = z.infer<
   typeof buildSalaryReportLinkInputSchema
>

export type SalaryReportLinkResult = {
   openmario_salary_url: string
   offer_count: number
   per_offer_urls: string[]
   offers: Array<{
      company: string
      position: string
      location: string
      compensation: number
      year: number
   }>
   tip: string
}

function normalizeOffers(
   offers: z.infer<typeof salaryOfferBuildInputSchema>[],
   common: z.infer<typeof salaryReportCommonSchema>,
): SalaryOfferInput[] {
   const yearFallback = common.year ?? new Date().getFullYear()
   return offers.map(o =>
      salaryOfferInputSchema.parse({
         company: o.company,
         position: o.position,
         location: o.location,
         compensation: o.compensation,
         year: o.year ?? yearFallback,
         coop_year: o.coop_year ?? common.coop_year ?? '1st',
         coop_cycle: o.coop_cycle ?? common.coop_cycle ?? 'Fall/Winter',
         program_level: o.program_level ?? common.program_level ?? 'Undergraduate',
         work_hours: o.work_hours ?? common.work_hours ?? 40,
         other_compensation: o.other_compensation ?? '',
         details: o.details ?? '',
      }),
   )
}

/** Shared by MCP tool + HTTP POST /api/salary/report-link */
export function buildSalaryReportLink(
   input: BuildSalaryReportLinkInput,
): SalaryReportLinkResult {
   const parsed = buildSalaryReportLinkInputSchema.parse(input)
   const offers = normalizeOffers(parsed.offers, parsed.common ?? {})
   const encoded = encodeSalaryOffers(offers)
   const openmario_salary_url = salaryReportUrl({
      salariesEncoded: encoded,
      ...(parsed.start_index != null ? { idx: parsed.start_index } : {}),
   })

   const per_offer_urls =
      offers.length > 1
         ? offers.map((_, i) => salaryReportUrl({ salariesEncoded: encoded, idx: i }))
         : [openmario_salary_url]

   return {
      openmario_salary_url,
      offer_count: offers.length,
      per_offer_urls,
      offers: offers.map(o => ({
         company: o.company,
         position: o.position,
         location: o.location,
         compensation: o.compensation,
         year: o.year,
      })),
      tip:
         offers.length === 1
            ? `Present: [Report this salary](${openmario_salary_url})`
            : `Present one batch link (imports as drafts): [Import ${offers.length} salary drafts](${openmario_salary_url}). Or share per_offer_urls for single-offer forms.`,
   }
}

export { salaryOfferInputSchema, COOP_YEAR, COOP_CYCLE, PROGRAM_LEVEL }
