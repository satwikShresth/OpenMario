import type { CategoryTone, CourseRef, MajorProgram, RequirementBlock } from './types'

export type MajorTreeKind =
   | 'program'
   | 'block'
   | 'sequence'
   | 'sequence-option'
   | 'course'
   | 'choice'
   | 'bucket'

export type MajorTreeNode = {
   id: string
   name: string
   kind: MajorTreeKind
   tone?: CategoryTone
   credits?: number
   summary?: string
   course?: CourseRef
   /** For sequence-option nodes: parent `one_of_sequences` block id. */
   sequenceParentId?: string
   children?: MajorTreeNode[]
}

function courseNode(course: CourseRef, parentId: string): MajorTreeNode {
   return {
      id: `${parentId}::course::${course.code}`,
      name: `${course.code} — ${course.title}`,
      kind: 'course',
      credits: course.credits,
      course,
   }
}

function blockToNode(block: RequirementBlock): MajorTreeNode {
   const children: MajorTreeNode[] = []

   if (block.kind === 'one_of_sequences' && block.children?.length) {
      for (const child of block.children) {
         const option = blockToNode(child)
         children.push({
            ...option,
            kind: 'sequence-option',
            sequenceParentId: block.id,
            summary:
               option.summary ??
               `Complete all ${option.children?.filter(c => c.kind === 'course').length ?? ''} courses in this sequence`,
         })
      }
      return {
         id: block.id,
         name: block.credits != null ? `${block.title} (${block.credits} cr)` : block.title,
         kind: 'sequence',
         tone: block.tone,
         credits: block.credits,
         summary: block.summary ?? 'Pick one sequence — finish every course in it',
         children,
      }
   }

   for (const child of block.children ?? []) {
      children.push(blockToNode(child))
   }

   for (const course of block.courses ?? []) {
      children.push(courseNode(course, block.id))
   }

   for (const [i, item] of (block.items ?? []).entries()) {
      if (item.type === 'course') {
         children.push(courseNode(item.course, block.id))
      } else {
         children.push({
            id: `${block.id}::or::${i}`,
            name: `Choose one`,
            kind: 'choice',
            tone: block.tone,
            children: item.courses.map(c => courseNode(c, `${block.id}::or::${i}`)),
         })
      }
   }

   if (block.kind === 'credits' && children.length === 0) {
      children.push({
         id: `${block.id}::bucket`,
         name: block.notes ?? `${block.credits ?? '?'} credits — pick freely`,
         kind: 'bucket',
         tone: block.tone,
         credits: block.credits,
      })
   }

   return {
      id: block.id,
      name: block.credits != null ? `${block.title} (${block.credits} cr)` : block.title,
      kind: 'block',
      tone: block.tone,
      credits: block.credits,
      summary: block.summary,
      children: children.length > 0 ? children : undefined,
   }
}

export function programToTreeNodes(program: MajorProgram): MajorTreeNode[] {
   return program.blocks.map(blockToNode)
}

export function courseFromTreeNode(node: MajorTreeNode): CourseRef | null {
   return node.kind === 'course' && node.course ? node.course : null
}
