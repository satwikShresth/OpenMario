/**
 * Convert Drexel catalog course-list / plan-grid HTML into clean markdown for LLMs.
 */

function decodeEntities(html: string): string {
   return html
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#160;/g, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/g, "'")
      .replace(/\u00a0/g, ' ')
}

function stripTags(html: string): string {
   return decodeEntities(
      html
         .replace(/<br\s*\/?>/gi, ' ')
         .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
         .replace(/<[^>]+>/g, ' '),
   )
      .replace(/\s+/g, ' ')
      .trim()
}

function normalizeCode(raw: string): string {
   return raw
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
}

/** Prefer showCourse('CODE') — handles UNIV CI101 etc. */
function extractCodes(cellHtml: string): string[] {
   const codes: string[] = []
   const re = /showCourse\(\s*this\s*,\s*'([^']+)'\s*\)/gi
   let m: RegExpExecArray | null
   while ((m = re.exec(cellHtml))) {
      const code = normalizeCode(m[1]!)
      if (code && !codes.includes(code)) codes.push(code)
   }
   if (codes.length === 0) {
      const titleRe = /title=["']([A-Z][^"']*)["']/gi
      while ((m = titleRe.exec(cellHtml))) {
         const code = normalizeCode(m[1]!)
         if (code && !codes.includes(code) && /[A-Z].*\d/.test(code)) {
            codes.push(code)
         }
      }
   }
   return codes
}

/** Primary title only (ignore nested "or …" blockindent alternatives). */
function primaryTitle(cellHtml: string): string {
   let s = cellHtml
      .replace(/<br\s*\/?>[\s\S]*$/i, '')
      .replace(/<div[^>]*class=["']blockindent["'][^>]*>[\s\S]*$/i, '')
      .replace(/<span[^>]*class=["']blockindent["'][^>]*>[\s\S]*$/i, '')
   return stripTags(s)
}

function altTitles(cellHtml: string): string[] {
   const alts: string[] = []
   const re =
      /<(?:div|span)[^>]*class=["']blockindent["'][^>]*>([\s\S]*?)<\/(?:div|span)>/gi
   let m: RegExpExecArray | null
   while ((m = re.exec(cellHtml))) {
      const t = stripTags(m[1]!).replace(/^or\s+/i, '').trim()
      if (t) alts.push(t)
   }
   return alts
}

type RowKind = 'header' | 'or' | 'course' | 'comment' | 'total' | 'other'

function classifyRow(trHtml: string): RowKind {
   if (/areaheader|courselistcomment\s+areaheader/i.test(trHtml)) return 'header'
   if (/class=["'][^"']*orclass/i.test(trHtml)) return 'or'
   if (/listsum/i.test(trHtml)) return 'total'
   if (/courselistcomment/i.test(trHtml) && !/codecol/i.test(trHtml)) return 'comment'
   if (/codecol/i.test(trHtml)) return 'course'
   if (/courselistcomment/i.test(trHtml)) return 'comment'
   return 'other'
}

function parseTableRows(tableHtml: string): string[] {
   const lines: string[] = []
   const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi
   let rowMatch: RegExpExecArray | null

   while ((rowMatch = rowRe.exec(tableHtml))) {
      const tr = rowMatch[0]
      const inner = rowMatch[1]!
      const kind = classifyRow(tr)
      const cells = [...inner.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
         m => m[1]!,
      )

      if (kind === 'header') {
         const title = stripTags(cells[0] ?? inner)
         if (title) {
            lines.push('')
            lines.push(`## ${title}`)
            lines.push('')
         }
         continue
      }

      if (kind === 'total') {
         const label = stripTags(cells[0] ?? cells[1] ?? 'Total Credits')
         const credits = stripTags(cells[cells.length - 1] ?? '')
         lines.push('')
         lines.push(`**${label}:** ${credits}`)
         continue
      }

      if (kind === 'comment') {
         const text = stripTags(cells[0] ?? inner)
         const credits = cells.length > 1 ? stripTags(cells[cells.length - 1]!) : ''
         if (!text) continue
         if (credits && /^\d/.test(credits)) {
            lines.push(`> ${text} (${credits} credits)`)
         } else {
            lines.push(`> ${text}`)
         }
         lines.push('')
         continue
      }

      if (kind === 'or') {
         const codes = extractCodes(inner)
         const title = primaryTitle(cells[1] ?? cells[0] ?? '').replace(/^or\s+/i, '')
         const code = codes[0] ?? ''
         if (code || title) {
            lines.push(`  - **or** ${code}${code && title ? ' — ' : ''}${title}`)
         }
         continue
      }

      if (kind === 'course') {
         const codes = extractCodes(cells[0] ?? inner)
         const title = primaryTitle(cells[1] ?? '')
         const titles = altTitles(cells[1] ?? '')
         const credits = stripTags(cells[2] ?? '')
         if (codes.length === 0 && !title) continue

         const cred = credits && /^\d/.test(credits) ? ` (${credits})` : ''

         if (codes.length > 1 && !/blockindent/i.test(cells[0] ?? '')) {
            // sequence like BIO 131 & BIO 134 (multiple top-level codes, not OR)
            lines.push(`- ${codes.join(' & ')}${cred}`)
            if (title) lines.push(`  - ${title}`)
         } else {
            const code = codes[0] ?? ''
            lines.push(
               `- ${code}${code && title ? ' — ' : ''}${title}${cred}`.replace(
                  /\s+—\s+$/,
                  '',
               ),
            )
            for (let i = 1; i < codes.length; i++) {
               const alt = titles[i - 1] ?? ''
               lines.push(
                  `  - **or** ${codes[i]}${alt ? ` — ${alt}` : ''}`.trimEnd(),
               )
            }
         }
         continue
      }

      const text = stripTags(inner)
      if (text) lines.push(`- ${text}`)
   }

   return lines
}

function footnotesToMarkdown(html: string): string[] {
   const lines: string[] = []
   const dl = html.match(
      /<dl[^>]*class=["'][^"']*sc_footnotes[^"']*["'][^>]*>([\s\S]*?)<\/dl>/i,
   )
   if (!dl) return lines
   lines.push('')
   lines.push('## Footnotes')
   lines.push('')
   const items = [
      ...dl[1]!.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/gi),
   ]
   for (const item of items) {
      const mark = stripTags(item[1]!)
      const body = stripTags(item[2]!)
      if (body) lines.push(`- **${mark}** ${body}`)
   }
   return lines
}

function electivesToMarkdown(html: string): string[] {
   const lines: string[] = []
   const h3Re = /<h3[^>]*>([\s\S]*?)<\/h3>/gi
   let m: RegExpExecArray | null
   const sections: { title: string; start: number; end: number }[] = []
   while ((m = h3Re.exec(html))) {
      const title = stripTags(m[1]!)
      if (/writing-intensive/i.test(title)) continue
      sections.push({ title, start: m.index + m[0].length, end: -1 })
   }
   for (let i = 0; i < sections.length; i++) {
      sections[i]!.end = sections[i + 1]?.start ?? html.length
   }

   for (const sec of sections) {
      const chunk = html.slice(sec.start, sec.end)
      const wi = chunk.search(/<h3[^>]*>[\s\S]*?Writing-Intensive/i)
      const body = wi === -1 ? chunk : chunk.slice(0, wi)

      lines.push('')
      lines.push(`## ${sec.title}`)
      lines.push('')

      const p = body.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
      if (p) {
         const intro = stripTags(p[1]!)
         if (intro) {
            lines.push(intro)
            lines.push('')
         }
      }

      const lis = [...body.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      for (const li of lis) {
         const text = stripTags(li[1]!)
         if (text) lines.push(`- ${text}`)
      }
   }

   return lines
}

function introParagraphs(html: string): string[] {
   const tableIdx = html.search(/<table[^>]*class=["'][^"']*sc_courselist/i)
   const head = tableIdx === -1 ? html : html.slice(0, tableIdx)
   const lines: string[] = []
   const ps = [...head.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
   for (const p of ps) {
      const text = stripTags(p[1]!)
      if (
         /^Major:|^Degree Awarded:|^Calendar Type:|^Minimum Required|^Co-op Options:|^Classification|^Standard Occupational/i.test(
            text,
         )
      ) {
         continue
      }
      if (text) lines.push(text)
   }
   return lines
}

export function courseListHtmlToMarkdown(
   html: string,
   title = 'Degree Requirements',
): string {
   const out: string[] = [`# ${title}`, '']

   const intro = introParagraphs(html)
   if (intro.length) {
      out.push(...intro, '')
   }

   const tableRe =
      /<table[^>]*class=["'][^"']*sc_courselist[^"']*["'][^>]*>([\s\S]*?)<\/table>/gi
   let tableMatch: RegExpExecArray | null
   let foundTable = false
   while ((tableMatch = tableRe.exec(html))) {
      foundTable = true
      out.push(...parseTableRows(tableMatch[1]!))
   }

   if (!foundTable) {
      out.push(stripTags(html))
   }

   out.push(...footnotesToMarkdown(html))
   out.push(...electivesToMarkdown(html))

   return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

/** Sample plan of study grid → markdown by year/term */
export function samplePlanHtmlToMarkdown(html: string): string {
   const out: string[] = ['# Sample Plan of Study', '']
   const rowRe = /<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi
   let m: RegExpExecArray | null

   while ((m = rowRe.exec(html))) {
      const attrs = m[1]!
      const inner = m[2]!
      const cells = [...inner.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
         c => c[1]!,
      )

      if (/plangridyear/i.test(attrs)) {
         const year = stripTags(cells[0] ?? inner)
         out.push(`## ${year}`)
         out.push('')
         continue
      }

      if (/plangridterm/i.test(attrs)) {
         const term = stripTags(cells[0] ?? inner).replace(/\s*Credits\s*$/i, '')
         out.push(`### ${term}`)
         out.push('')
         continue
      }

      if (/plangridsum|plangridtotal/i.test(attrs)) {
         const label = stripTags(cells[1] ?? cells[0] ?? 'Credits')
         const credits = stripTags(cells[cells.length - 1] ?? '')
         out.push(`*${label}: ${credits}*`)
         out.push('')
         continue
      }

      const comment = stripTags(
         inner.match(/class=["']comment["'][^>]*>([\s\S]*?)</i)?.[1] ?? '',
      )
      const codes = extractCodes(inner)
      const titleCell = cells[1] ?? ''
      const title = primaryTitle(titleCell)
      const titles = altTitles(titleCell)
      const credits = stripTags(cells[2] ?? '')

      if (comment && !codes.length) {
         out.push(`- ${comment}${credits ? ` (${credits})` : ''}`)
         continue
      }

      if (codes.length || title) {
         const code = codes[0] ?? ''
         const cred = credits ? ` (${credits})` : ''
         out.push(
            `- ${code}${code && title ? ' — ' : ''}${title}${cred}`.replace(
               /\s+—\s+$/,
               '',
            ),
         )
         for (let i = 1; i < codes.length; i++) {
            const alt = titles[i - 1] ?? ''
            out.push(`  - **or** ${codes[i]}${alt ? ` — ${alt}` : ''}`)
         }
      }
   }

   return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}
