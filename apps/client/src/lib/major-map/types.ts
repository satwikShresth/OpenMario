export type CourseRef = {
   code: string
   title: string
   credits?: number
}

export type CategoryTone =
   | 'program'
   | 'university'
   | 'cs'
   | 'ci'
   | 'math'
   | 'science'
   | 'ah'
   | 'free'

export type ReqItem =
   | { type: 'course'; course: CourseRef }
   | { type: 'or'; courses: CourseRef[] }

export type RequirementBlock = {
   id: string
   title: string
   credits?: number
   kind: 'faction' | 'all' | 'pick_n' | 'credits' | 'one_of_sequences'
   n?: number
   tone: CategoryTone
   /** Short blurb on overview cards */
   summary?: string
   courses?: CourseRef[]
   items?: ReqItem[]
   children?: RequirementBlock[]
   notes?: string
}

export type MajorProgram = {
   id: string
   name: string
   degree: string
   totalCredits: number
   description: string
   /** Top-level factions only */
   blocks: RequirementBlock[]
   footnotes?: string[]
}

export const TONE_COLORS: Record<
   CategoryTone,
   { border: string; bg: string; bgDark: string; fg: string; fgDark: string; edge: string }
> = {
   program: {
      border: 'teal.600',
      bg: 'teal.50',
      bgDark: 'teal.950',
      fg: 'teal.800',
      fgDark: 'teal.100',
      edge: 'var(--chakra-colors-teal-500)',
   },
   university: {
      border: 'gray.500',
      bg: 'gray.50',
      bgDark: 'gray.900',
      fg: 'gray.700',
      fgDark: 'gray.200',
      edge: 'var(--chakra-colors-gray-400)',
   },
   cs: {
      border: 'cyan.500',
      bg: 'cyan.50',
      bgDark: 'cyan.950',
      fg: 'cyan.800',
      fgDark: 'cyan.100',
      edge: 'var(--chakra-colors-cyan-500)',
   },
   ci: {
      border: 'teal.500',
      bg: 'teal.50',
      bgDark: 'teal.950',
      fg: 'teal.800',
      fgDark: 'teal.100',
      edge: 'var(--chakra-colors-teal-400)',
   },
   math: {
      border: 'blue.500',
      bg: 'blue.50',
      bgDark: 'blue.950',
      fg: 'blue.800',
      fgDark: 'blue.100',
      edge: 'var(--chakra-colors-blue-500)',
   },
   science: {
      border: 'green.500',
      bg: 'green.50',
      bgDark: 'green.950',
      fg: 'green.800',
      fgDark: 'green.100',
      edge: 'var(--chakra-colors-green-500)',
   },
   ah: {
      border: 'orange.500',
      bg: 'orange.50',
      bgDark: 'orange.950',
      fg: 'orange.800',
      fgDark: 'orange.100',
      edge: 'var(--chakra-colors-orange-500)',
   },
   free: {
      border: 'yellow.600',
      bg: 'yellow.50',
      bgDark: 'yellow.950',
      fg: 'yellow.800',
      fgDark: 'yellow.100',
      edge: 'var(--chakra-colors-yellow-600)',
   },
}

export function findBlock(
   blocks: RequirementBlock[],
   id: string,
): RequirementBlock | undefined {
   for (const b of blocks) {
      if (b.id === id) return b
      if (b.children?.length) {
         const found = findBlock(b.children, id)
         if (found) return found
      }
   }
   return undefined
}

export function resolveFocus(
   program: MajorProgram,
   path: string[],
): { focus: RequirementBlock | null; trail: RequirementBlock[] } {
   const trail: RequirementBlock[] = []
   let current: RequirementBlock[] = program.blocks
   let focus: RequirementBlock | null = null

   for (const id of path) {
      const next = current.find(b => b.id === id) ?? findBlock(program.blocks, id)
      if (!next) break
      trail.push(next)
      focus = next
      current = next.children ?? []
   }

   return { focus, trail }
}

export function blockHasDrillTarget(block: RequirementBlock): boolean {
   if (block.children && block.children.length > 0) return true
   if (block.courses && block.courses.length > 0) return true
   if (block.items && block.items.length > 0) return true
   return block.kind === 'credits'
}

export function countCourses(block: RequirementBlock): number {
   let n = block.courses?.length ?? 0
   for (const item of block.items ?? []) {
      if (item.type === 'course') n += 1
      else n += item.courses.length
   }
   for (const child of block.children ?? []) {
      n += countCourses(child)
   }
   return n
}
