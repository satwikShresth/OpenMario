import { Hono } from 'hono'
import { ZodError } from 'zod'
import {
   buildSalaryReportLink,
   buildSalaryReportLinkInputSchema,
} from '@/lib/salary-report-link'

export const salaryHttpRoutes = new Hono()
   .post('/salary/report-link', async c => {
      let body: unknown
      try {
         body = await c.req.json()
      } catch {
         return c.json({ error: 'Invalid JSON body' }, 400)
      }

      try {
         const input = buildSalaryReportLinkInputSchema.parse(body)
         const result = buildSalaryReportLink(input)
         return c.json({
            openmario_salary_url: result.openmario_salary_url,
            offer_count: result.offer_count,
            tip:
               result.offer_count === 1
                  ? 'Open the URL to prefill the report form, then submit in the browser.'
                  : 'Open the URL to import all offers as drafts at /salary/drafts, then submit each one.',
         })
      } catch (e) {
         if (e instanceof ZodError) {
            return c.json(
               {
                  error: 'Invalid offers payload',
                  details: e.flatten(),
               },
               400,
            )
         }
         return c.json(
            {
               error:
                  e instanceof Error
                     ? e.message
                     : 'Failed to encode salary report link',
            },
            400,
         )
      }
   })
   .get('/salary/report-link', c =>
      c.json({
         method: 'POST',
         path: '/api/salary/report-link',
         description:
            'Encode co-op offer JSON into an OpenMario salary report share URL (same logic as MCP generate_salary_report_link). Does not submit salaries.',
         body: {
            offers: [
               {
                  company: 'string',
                  position: 'string',
                  location: 'City, ST',
                  compensation: 0,
                  year: 2026,
                  coop_year: '1st|2nd|3rd',
                  coop_cycle: 'Fall/Winter|…',
                  program_level: 'Undergraduate|Graduate',
                  work_hours: 40,
               },
            ],
            common: {
               year: 'optional shared defaults',
            },
         },
      }),
   )
