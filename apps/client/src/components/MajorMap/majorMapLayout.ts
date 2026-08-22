import dagre from '@dagrejs/dagre'
import {
   MarkerType,
   Position,
   type Edge,
   type Node,
} from '@xyflow/react'
import type {
   CategoryTone,
   CourseRef,
   MajorProgram,
   RequirementBlock,
} from '@/lib/major-map'
import {
   blockHasDrillTarget,
   countCourses,
   resolveFocus,
   TONE_COLORS,
} from '@/lib/major-map'

export const PROGRAM_NODE = 'programNode'
export const FACTION_NODE = 'factionNode'
export const CHOICE_NODE = 'choiceNode'
export const COURSE_LEAF = 'courseLeaf'
export const BUCKET_NODE = 'bucketNode'

export const PROGRAM_W = 220
export const PROGRAM_H = 100
export const FACTION_W = 220
export const FACTION_H = 108
export const CHOICE_W = 72
export const CHOICE_H = 36
export const COURSE_W = 176
export const COURSE_H = 68
export const BUCKET_W = 220
export const BUCKET_H = 88

export type ProgramNodeData = {
   name: string
   degree: string
   totalCredits: number
}

export type FactionNodeData = {
   title: string
   summary?: string
   tone: CategoryTone
   credits?: number
   courseCount?: number
   drillable: boolean
   onDrill?: () => void
}

export type ChoiceNodeData = {
   label: string
}

export type CourseLeafData = {
   code: string
   title: string
   credits?: number
   tone: CategoryTone
   completed?: boolean
   grade?: string | null
   onSelect: () => void
}

export type BucketNodeData = {
   title: string
   credits?: number
   notes?: string
   tone: CategoryTone
}

export type BuildFocusedGraphOptions = {
   path: string[]
   onDrill: (blockId: string) => void
   onCourseClick: (course: CourseRef) => void
   /** Normalized course code → completion snapshot for graph styling. */
   courseStatus?: Record<string, { completed: boolean; grade?: string | null }>
}

function dims(node: Node) {
   switch (node.type) {
      case PROGRAM_NODE:
         return { width: PROGRAM_W, height: PROGRAM_H }
      case FACTION_NODE:
         return { width: FACTION_W, height: FACTION_H }
      case CHOICE_NODE:
         return { width: CHOICE_W, height: CHOICE_H }
      case COURSE_LEAF:
         return { width: COURSE_W, height: COURSE_H }
      case BUCKET_NODE:
         return { width: BUCKET_W, height: BUCKET_H }
      default:
         return { width: COURSE_W, height: COURSE_H }
   }
}

function edge(source: string, target: string, tone: CategoryTone): Edge {
   const stroke = TONE_COLORS[tone].edge
   return {
      id: `${source}->${target}`,
      source,
      target,
      type: 'smoothstep',
      animated: false,
      markerEnd: {
         type: MarkerType.ArrowClosed,
         width: 14,
         height: 14,
         color: stroke,
      },
      style: { stroke, strokeWidth: 1.75 },
   }
}

function factionCard(
   block: RequirementBlock,
   onDrill: (id: string) => void,
): Node {
   const drillable = blockHasDrillTarget(block)
   return {
      id: `faction:${block.id}`,
      type: FACTION_NODE,
      position: { x: 0, y: 0 },
      selectable: drillable,
      draggable: false,
      className: 'nodrag nopan',
      data: {
         title: block.title,
         summary: block.summary ?? block.notes,
         tone: block.tone,
         credits: block.credits,
         courseCount: countCourses(block) || undefined,
         drillable,
         onDrill: drillable ? () => onDrill(block.id) : undefined,
      } satisfies FactionNodeData,
   }
}

function addCourseLeaf(
   nodes: Node[],
   edges: Edge[],
   parentId: string,
   blockId: string,
   course: CourseRef,
   tone: CategoryTone,
   idx: number,
   onCourseClick: (c: CourseRef) => void,
   courseStatus?: BuildFocusedGraphOptions['courseStatus'],
) {
   const id = `course:${blockId}:${course.code.replace(/\s+/g, '-')}:${idx}`
   const status = courseStatus?.[course.code.trim().replace(/\s+/g, ' ').toUpperCase()]
   nodes.push({
      id,
      type: COURSE_LEAF,
      position: { x: 0, y: 0 },
      selectable: true,
      draggable: false,
      className: 'nodrag nopan',
      data: {
         code: course.code,
         title: course.title,
         credits: course.credits,
         tone,
         completed: status?.completed,
         grade: status?.grade,
         onSelect: () => onCourseClick(course),
      } satisfies CourseLeafData,
   })
   edges.push(edge(parentId, id, tone))
}

function addOrGroup(
   nodes: Node[],
   edges: Edge[],
   parentId: string,
   blockId: string,
   courses: CourseRef[],
   tone: CategoryTone,
   groupIdx: number,
   onCourseClick: (c: CourseRef) => void,
   courseStatus?: BuildFocusedGraphOptions['courseStatus'],
) {
   const orId = `or:${blockId}:${groupIdx}`
   nodes.push({
      id: orId,
      type: CHOICE_NODE,
      position: { x: 0, y: 0 },
      selectable: false,
      draggable: false,
      className: 'nodrag nopan',
      data: { label: 'OR' } satisfies ChoiceNodeData,
   })
   edges.push(edge(parentId, orId, tone))
   courses.forEach((course, i) => {
      addCourseLeaf(
         nodes,
         edges,
         orId,
         `${blockId}-or${groupIdx}`,
         course,
         tone,
         i,
         onCourseClick,
         courseStatus,
      )
   })
}

/** Detail view: courses / pick-n / OR items under a focus root */
function buildDetailGraph(
   focus: RequirementBlock,
   opts: BuildFocusedGraphOptions,
): { nodes: Node[]; edges: Edge[] } {
   const nodes: Node[] = []
   const edges: Edge[] = []
   const rootId = `focus:${focus.id}`
   const { onCourseClick, courseStatus } = opts

   nodes.push({
      id: rootId,
      type: FACTION_NODE,
      position: { x: 0, y: 0 },
      selectable: false,
      draggable: false,
      className: 'nodrag nopan',
      data: {
         title: focus.title,
         summary:
            focus.kind === 'pick_n'
               ? `Pick ${focus.n}${focus.notes ? ` · ${focus.notes}` : ''}`
               : focus.summary ?? focus.notes,
         tone: focus.tone,
         credits: focus.credits,
         courseCount: countCourses(focus) || undefined,
         drillable: false,
      } satisfies FactionNodeData,
   })

   if (focus.kind === 'credits') {
      const bucketId = `bucket:${focus.id}`
      nodes.push({
         id: bucketId,
         type: BUCKET_NODE,
         position: { x: 0, y: 0 },
         selectable: false,
         draggable: false,
         className: 'nodrag nopan',
         data: {
            title: focus.title,
            credits: focus.credits,
            notes: focus.notes ?? focus.summary,
            tone: focus.tone,
         } satisfies BucketNodeData,
      })
      edges.push(edge(rootId, bucketId, focus.tone))
      return layoutElements(nodes, edges)
   }

   if (focus.kind === 'one_of_sequences' && focus.children?.length) {
      const orId = `or:${focus.id}:seq`
      nodes.push({
         id: orId,
         type: CHOICE_NODE,
         position: { x: 0, y: 0 },
         selectable: false,
         draggable: false,
         className: 'nodrag nopan',
         data: { label: 'OR' } satisfies ChoiceNodeData,
      })
      edges.push(edge(rootId, orId, focus.tone))
      for (const child of focus.children) {
         const card = factionCard(child, opts.onDrill)
         // re-parent under OR
         nodes.push(card)
         edges.push(edge(orId, card.id, focus.tone))
      }
      return layoutElements(nodes, edges)
   }

   if (focus.kind === 'pick_n' && focus.courses?.length) {
      const pickId = `pick:${focus.id}`
      nodes.push({
         id: pickId,
         type: CHOICE_NODE,
         position: { x: 0, y: 0 },
         selectable: false,
         draggable: false,
         className: 'nodrag nopan',
         data: { label: `Pick ${focus.n ?? 2}` } satisfies ChoiceNodeData,
      })
      edges.push(edge(rootId, pickId, focus.tone))
      focus.courses.forEach((course, i) => {
         addCourseLeaf(
            nodes,
            edges,
            pickId,
            focus.id,
            course,
            focus.tone,
            i,
            onCourseClick,
            courseStatus,
         )
      })
      return layoutElements(nodes, edges)
   }

   let idx = 0
   if (focus.items?.length) {
      for (const item of focus.items) {
         if (item.type === 'course') {
            addCourseLeaf(
               nodes,
               edges,
               rootId,
               focus.id,
               item.course,
               focus.tone,
               idx++,
               onCourseClick,
               courseStatus,
            )
         } else {
            addOrGroup(
               nodes,
               edges,
               rootId,
               focus.id,
               item.courses,
               focus.tone,
               idx++,
               onCourseClick,
               courseStatus,
            )
         }
      }
   }

   if (focus.courses?.length) {
      focus.courses.forEach((course, i) => {
         addCourseLeaf(
            nodes,
            edges,
            rootId,
            focus.id,
            course,
            focus.tone,
            i,
            onCourseClick,
            courseStatus,
         )
      })
   }

   return layoutElements(nodes, edges)
}

/** Overview or faction-with-children: big cards only */
function buildChunkGraph(
   program: MajorProgram,
   children: RequirementBlock[],
   header: { title: string; degree?: string; credits?: number; tone: CategoryTone },
   opts: BuildFocusedGraphOptions,
): { nodes: Node[]; edges: Edge[] } {
   const nodes: Node[] = []
   const edges: Edge[] = []
   const rootId = 'focus:root'

   if (header.degree) {
      nodes.push({
         id: rootId,
         type: PROGRAM_NODE,
         position: { x: 0, y: 0 },
         selectable: false,
         draggable: false,
         className: 'nodrag nopan',
         data: {
            name: header.title,
            degree: header.degree,
            totalCredits: header.credits ?? program.totalCredits,
         } satisfies ProgramNodeData,
      })
   } else {
      nodes.push({
         id: rootId,
         type: FACTION_NODE,
         position: { x: 0, y: 0 },
         selectable: false,
         draggable: false,
         className: 'nodrag nopan',
         data: {
            title: header.title,
            tone: header.tone,
            credits: header.credits,
            drillable: false,
         } satisfies FactionNodeData,
      })
   }

   for (const child of children) {
      // Pure credit leaf with no further content: show as bucket under root
      if (
         child.kind === 'credits' &&
         !child.children?.length &&
         !child.courses?.length &&
         !child.items?.length
      ) {
         const bucketId = `bucket:${child.id}`
         nodes.push({
            id: bucketId,
            type: BUCKET_NODE,
            position: { x: 0, y: 0 },
            selectable: false,
            draggable: false,
            className: 'nodrag nopan',
            data: {
               title: child.title,
               credits: child.credits,
               notes: child.notes ?? child.summary,
               tone: child.tone,
            } satisfies BucketNodeData,
         })
         edges.push(edge(rootId, bucketId, child.tone))
         continue
      }

      const card = factionCard(child, opts.onDrill)
      nodes.push(card)
      edges.push(edge(rootId, card.id, child.tone))
   }

   return layoutElements(nodes, edges)
}

export function buildFocusedGraph(
   program: MajorProgram,
   opts: BuildFocusedGraphOptions,
): { nodes: Node[]; edges: Edge[] } {
   const { focus } = resolveFocus(program, opts.path)

   // Overview
   if (!focus) {
      return buildChunkGraph(
         program,
         program.blocks,
         {
            title: program.name,
            degree: program.degree,
            credits: program.totalCredits,
            tone: 'program',
         },
         opts,
      )
   }

   // Faction / parent with children → show only those chunks
   if (focus.children && focus.children.length > 0) {
      return buildChunkGraph(
         program,
         focus.children,
         {
            title: focus.title,
            credits: focus.credits,
            tone: focus.tone,
         },
         opts,
      )
   }

   // Leaf detail (courses / credits)
   return buildDetailGraph(focus, opts)
}

function layoutElements(nodes: Node[], edges: Edge[]) {
   const graph = new dagre.graphlib.Graph()
   graph.setDefaultEdgeLabel(() => ({}))
   graph.setGraph({
      rankdir: 'LR',
      nodesep: 28,
      ranksep: 80,
      marginx: 32,
      marginy: 32,
   })

   for (const node of nodes) {
      const { width, height } = dims(node)
      graph.setNode(node.id, { width, height })
   }
   for (const e of edges) {
      graph.setEdge(e.source, e.target)
   }

   dagre.layout(graph)

   const layouted = nodes.map((node, index) => {
      const pos = graph.node(node.id)
      const { width, height } = dims(node)
      const x = Number.isFinite(pos?.x) ? pos.x - width / 2 : index * (COURSE_W + 24)
      const y = Number.isFinite(pos?.y) ? pos.y - height / 2 : index * (COURSE_H + 20)
      return {
         ...node,
         position: { x, y },
         sourcePosition: Position.Right,
         targetPosition: Position.Left,
      }
   })

   return { nodes: layouted, edges }
}
