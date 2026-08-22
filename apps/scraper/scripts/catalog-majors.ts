/**
 * Discover UG majors from catalog.drexel.edu/majors/ and scrape
 * Degree Requirements (+ sample plan of study when present) as LLM-ready markdown.
 *
 * Usage:
 *   bun run scripts/catalog-majors.ts discover
 *   bun run scripts/catalog-majors.ts scrape [--id computerscience] [--limit N]
 *   bun run scripts/catalog-majors.ts markdown [--id computerscience]  # from page.html
 *   bun run scripts/catalog-majors.ts all [--limit N]
 */

import { mkdir, writeFile, readFile, unlink, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import {
   courseListHtmlToMarkdown,
   samplePlanHtmlToMarkdown,
} from './catalog-to-markdown'

const CATALOG = 'https://catalog.drexel.edu'
const MAJORS_INDEX = `${CATALOG}/majors/`
const UA =
   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
const DELAY_MS = 400

const DATA_DIR = join(import.meta.dir, '../data/majors')
const INDEX_PATH = join(DATA_DIR, 'index.json')
const RAW_DIR = join(DATA_DIR, 'raw')
const ENUM_PATH = join(
   import.meta.dir,
   '../../../packages/db/src/schema/enums/undergraduate.majors.json',
)

type CatalogMajor = {
   id: string
   name: string
   href: string
   url: string
   matchedEnumName: string | null
   hasDegreeRequirements?: boolean
   hasSamplePlan?: boolean
   scrapedAt?: string
   error?: string
}

function sleep(ms: number) {
   return new Promise(r => setTimeout(r, ms))
}

async function fetchText(url: string): Promise<string> {
   const res = await fetch(url, {
      headers: {
         'User-Agent': UA,
         Accept: 'text/html,application/xhtml+xml',
      },
   })
   if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
   return res.text()
}

function slugFromHref(href: string): string {
   const parts = href.replace(/\/+$/, '').split('/').filter(Boolean)
   const last = parts[parts.length - 1] ?? 'unknown'
   return last
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
}

function normalizeName(s: string): string {
   return s
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[()]/g, '')
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9 ]/g, '')
      .trim()
}

function matchEnum(name: string, enums: string[]): string | null {
   const n = normalizeName(name)
   for (const e of enums) {
      if (normalizeName(e) === n) return e
   }
   // loose: catalog "Computer Science (BSCS)" vs enum "Computer Science (BSCS)"
   for (const e of enums) {
      const en = normalizeName(e)
      if (en.includes(n) || n.includes(en)) return e
   }
   return null
}

function decodeEntities(html: string): string {
   return html
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#160;/g, ' ')
      .replace(/\u00a0/g, ' ')
}

function extractSection(html: string, sectionId: string): string | null {
   const open = new RegExp(
      `<div[^>]*id=["']${sectionId}container["'][^>]*>`,
      'i',
   )
   const m = open.exec(html)
   if (!m || m.index == null) return null
   const start = m.index + m[0].length
   const rest = html.slice(start)
   const next = rest.search(
      /<div[^>]*id=["'][a-z0-9]+container["'][^>]*(?:class=["'][^"']*page_content|role=["']tabpanel)/i,
   )
   const chunk = next === -1 ? rest : rest.slice(0, next)
   return chunk.trim()
}

/** Catalog uses many aliases: degreerequirementstext, concentrationrequirementstext, requirementsbstext, … */
function findTabsByLabel(html: string, label: RegExp): string[] {
   const ids: string[] = []
   // Keep match inside a single <li>…</li>
   const tabRe =
      /<li[^>]*id=["']([a-z0-9]+)tab["'][^>]*>[\s\S]*?<\/li>/gi
   let m: RegExpExecArray | null
   while ((m = tabRe.exec(html))) {
      const li = m[0]
      const id = m[1]!
      if (label.test(li)) ids.push(id)
   }
   return ids
}

function findDegreeRequirementSectionIds(html: string): string[] {
   const ids = new Set<string>(
      findTabsByLabel(html, /Degree\s+Requirements/i),
   )

   const vh = html.match(/var\s+validhashes\s*=\s*"([^"]+)"/i)?.[1] ?? ''
   for (const h of vh.split(',').filter(Boolean)) {
      if (/requirement/i.test(h) && !/sampleplan/i.test(h)) ids.add(h)
   }

   if (/name=["']degreerequirementstext["']/.test(html)) {
      ids.add('degreerequirementstext')
   }

   // Prefer specific requirement hashes over bare "text"
   return [...ids].filter(id => id !== 'text')
}

function findSamplePlanSectionIds(html: string): string[] {
   const ids = new Set<string>(
      findTabsByLabel(html, /Sample\s+Plan\s+of\s+Study/i),
   )
   const vh = html.match(/var\s+validhashes\s*=\s*"([^"]+)"/i)?.[1] ?? ''
   for (const h of vh.split(',').filter(Boolean)) {
      if (/sampleplan/i.test(h)) ids.add(h)
   }
   return [...ids]
}

function parseMajorsIndex(html: string, enums: string[]): CatalogMajor[] {
   const majors: CatalogMajor[] = []
   const seen = new Set<string>()
   // <a href="/undergraduate/.../slug/">Name (BS)</a>
   const re =
      /<a\s+href="(\/undergraduate\/[^"]+)"[^>]*>\s*([^<]+?)\s*<\/a>/gi
   let match: RegExpExecArray | null
   while ((match = re.exec(html))) {
      let href = match[1]!.trim()
      // keep index.html paths as-is; otherwise ensure trailing slash
      if (!/\.html?$/i.test(href)) {
         href = href.replace(/\/+$/, '') + '/'
      }
      const name = decodeEntities(match[2]!).trim()
      if (!name || name.length < 2) continue
      // skip non-program noise
      if (/^https?:/i.test(href)) continue
      if (/tuition|fees|archive|certificate/i.test(name)) continue
      if (/tuition|fees/i.test(href)) continue
      const id = slugFromHref(href)
      if (seen.has(id)) continue
      seen.add(id)
      majors.push({
         id,
         name,
         href,
         url: `${CATALOG}${href}`,
         matchedEnumName: matchEnum(name, enums),
      })
   }
   return majors
}

async function discover(): Promise<CatalogMajor[]> {
   console.log(`Fetching ${MAJORS_INDEX}…`)
   const html = await fetchText(MAJORS_INDEX)
   const enums: string[] = existsSync(ENUM_PATH)
      ? JSON.parse(await readFile(ENUM_PATH, 'utf8'))
      : []

   const majors = parseMajorsIndex(html, enums)
   await mkdir(DATA_DIR, { recursive: true })
   await writeFile(INDEX_PATH, JSON.stringify(majors, null, 2) + '\n')

   const matched = majors.filter(m => m.matchedEnumName).length
   console.log(
      `Discovered ${majors.length} catalog majors (${matched} matched enum list of ${enums.length}).`,
   )
   console.log(`Wrote ${INDEX_PATH}`)
   return majors
}

async function loadIndex(): Promise<CatalogMajor[]> {
   if (!existsSync(INDEX_PATH)) {
      return discover()
   }
   return JSON.parse(await readFile(INDEX_PATH, 'utf8'))
}

const LEGACY_SECTION_FILES = [
   'degree-requirements.html',
   'degree-requirements.txt',
   'sample-plan.html',
   'sample-plan.txt',
] as const

async function removeLegacySectionFiles(outDir: string) {
   for (const name of LEGACY_SECTION_FILES) {
      const p = join(outDir, name)
      if (existsSync(p)) await unlink(p)
   }
}

function pickDegreeHtml(html: string): string | null {
   const degreeIds = findDegreeRequirementSectionIds(html)
   let degreeHtml: string | null = null
   let bestLen = 0
   for (const id of degreeIds) {
      const chunk = extractSection(html, id)
      if (!chunk) continue
      const score =
         chunk.length +
         (/sc_courselist|class=["']codecol["']/i.test(chunk) ? 50_000 : 0)
      if (score > bestLen) {
         bestLen = score
         degreeHtml = chunk
      }
   }
   return degreeHtml
}

function pickPlanHtml(html: string): string | null {
   for (const id of findSamplePlanSectionIds(html)) {
      const planHtml = extractSection(html, id)
      if (planHtml && planHtml.length > 80) return planHtml
   }
   return null
}

async function writeMarkdownFromPage(
   outDir: string,
   html: string,
   major: Pick<CatalogMajor, 'id' | 'name' | 'url' | 'matchedEnumName'>,
): Promise<{ hasDegreeRequirements: boolean; hasSamplePlan: boolean }> {
   const degreeHtml = pickDegreeHtml(html)
   const planHtml = pickPlanHtml(html)

   if (degreeHtml) {
      await writeFile(
         join(outDir, 'degree-requirements.md'),
         courseListHtmlToMarkdown(degreeHtml, `Degree Requirements — ${major.name}`),
      )
   }
   if (planHtml) {
      await writeFile(
         join(outDir, 'sample-plan.md'),
         samplePlanHtmlToMarkdown(planHtml),
      )
   }

   await removeLegacySectionFiles(outDir)

   const degreeAwarded =
      html.match(/Degree Awarded:\s*([^<\n]+)/i)?.[1]?.trim() ?? null
   const minCredits =
      html.match(/Minimum Required Credits:\s*([\d.]+)/i)?.[1] ?? null

   const meta = {
      id: major.id,
      name: major.name,
      url: major.url,
      matchedEnumName: major.matchedEnumName,
      degreeAwarded,
      minCredits: minCredits ? Number(minCredits) : null,
      hasDegreeRequirements: Boolean(degreeHtml),
      hasSamplePlan: Boolean(planHtml),
      scrapedAt: new Date().toISOString(),
   }
   await writeFile(join(outDir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n')

   return {
      hasDegreeRequirements: meta.hasDegreeRequirements,
      hasSamplePlan: meta.hasSamplePlan,
   }
}

async function scrapeOne(major: CatalogMajor): Promise<CatalogMajor> {
   const outDir = join(RAW_DIR, major.id)
   await mkdir(outDir, { recursive: true })

   try {
      const html = await fetchText(major.url)
      await writeFile(join(outDir, 'page.html'), html)

      const { hasDegreeRequirements, hasSamplePlan } = await writeMarkdownFromPage(
         outDir,
         html,
         major,
      )

      return {
         ...major,
         hasDegreeRequirements,
         hasSamplePlan,
         scrapedAt: new Date().toISOString(),
         error: undefined,
      }
   } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      await writeFile(
         join(outDir, 'error.json'),
         JSON.stringify({ error: message, at: new Date().toISOString() }, null, 2) +
            '\n',
      )
      return { ...major, error: message, scrapedAt: new Date().toISOString() }
   }
}

/** Reprocess existing page.html → markdown (no network). */
async function markdownAll(opts: { id?: string }) {
   if (!existsSync(RAW_DIR)) {
      throw new Error(`No raw scrape dir at ${RAW_DIR}. Run scrape first.`)
   }

   const index = existsSync(INDEX_PATH)
      ? (JSON.parse(await readFile(INDEX_PATH, 'utf8')) as CatalogMajor[])
      : []
   const byId = new Map(index.map(m => [m.id, m]))

   let ids = opts.id
      ? [opts.id]
      : (await readdir(RAW_DIR, { withFileTypes: true }))
           .filter(d => d.isDirectory())
           .map(d => d.name)

   console.log(`Converting ${ids.length} major(s) to markdown…`)
   let ok = 0
   let skip = 0
   let fail = 0

   for (let i = 0; i < ids.length; i++) {
      const id = ids[i]!
      const outDir = join(RAW_DIR, id)
      const pagePath = join(outDir, 'page.html')
      process.stdout.write(`[${i + 1}/${ids.length}] ${id}… `)

      if (!existsSync(pagePath)) {
         skip++
         console.log('no page.html')
         continue
      }

      try {
         const html = await readFile(pagePath, 'utf8')
         const fromIndex = byId.get(id)
         const major = {
            id,
            name: fromIndex?.name ?? id,
            url: fromIndex?.url ?? '',
            matchedEnumName: fromIndex?.matchedEnumName ?? null,
         }
         const result = await writeMarkdownFromPage(outDir, html, major)
         if (fromIndex) {
            byId.set(id, {
               ...fromIndex,
               hasDegreeRequirements: result.hasDegreeRequirements,
               hasSamplePlan: result.hasSamplePlan,
               scrapedAt: new Date().toISOString(),
            })
         }
         ok++
         console.log(
            `ok${result.hasSamplePlan ? ' +sample-plan' : ''}${result.hasDegreeRequirements ? '' : ' (no degree md)'}`,
         )
      } catch (err) {
         fail++
         console.log(err instanceof Error ? err.message : String(err))
      }
   }

   if (index.length) {
      await writeFile(
         INDEX_PATH,
         JSON.stringify([...byId.values()], null, 2) + '\n',
      )
   }
   console.log(`\nDone. ok=${ok} skip=${skip} failed=${fail}`)
}

async function scrapeAll(opts: { id?: string; limit?: number }) {
   const index = await loadIndex()
   let targets = index
   if (opts.id) {
      targets = index.filter(m => m.id === opts.id)
      if (targets.length === 0) {
         throw new Error(`No major with id "${opts.id}" in index. Run discover first.`)
      }
   }
   if (opts.limit != null) targets = targets.slice(0, opts.limit)

   console.log(`Scraping ${targets.length} major(s)…`)
   const updated = new Map(index.map(m => [m.id, m]))

   let ok = 0
   let fail = 0
   let noDeg = 0

   for (let i = 0; i < targets.length; i++) {
      const m = targets[i]!
      process.stdout.write(`[${i + 1}/${targets.length}] ${m.name}… `)
      const result = await scrapeOne(m)
      updated.set(m.id, result)
      if (result.error) {
         fail++
         console.log(`ERROR ${result.error}`)
      } else if (!result.hasDegreeRequirements) {
         noDeg++
         console.log('no #degreerequirementstext')
      } else {
         ok++
         console.log(
            `ok${result.hasSamplePlan ? ' +sample-plan' : ''}`,
         )
      }
      await sleep(DELAY_MS)
   }

   const next = [...updated.values()]
   await writeFile(INDEX_PATH, JSON.stringify(next, null, 2) + '\n')
   console.log(
      `\nDone. ok=${ok} no-degree-section=${noDeg} failed=${fail}. Index updated.`,
   )
}

function parseArgs(argv: string[]) {
   const cmd = argv[0] ?? 'all'
   let id: string | undefined
   let limit: number | undefined
   for (let i = 1; i < argv.length; i++) {
      if (argv[i] === '--id') id = argv[++i]
      else if (argv[i] === '--limit') limit = Number(argv[++i])
   }
   return { cmd, id, limit }
}

async function main() {
   const { cmd, id, limit } = parseArgs(process.argv.slice(2))
   if (cmd === 'discover') {
      await discover()
   } else if (cmd === 'scrape') {
      await scrapeAll({ id, limit })
   } else if (cmd === 'markdown') {
      await markdownAll({ id })
   } else if (cmd === 'all') {
      await discover()
      await scrapeAll({ id, limit })
   } else {
      console.error(
         'Usage: bun run scripts/catalog-majors.ts <discover|scrape|markdown|all> [--id slug] [--limit N]',
      )
      process.exit(1)
   }
}

main().catch(err => {
   console.error(err)
   process.exit(1)
})
