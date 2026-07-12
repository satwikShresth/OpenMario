import dagre from '@dagrejs/dagre';
import {
   MarkerType,
   Position,
   type Edge,
   type Node
} from '@xyflow/react';
import type { Corequisite, Dependent, Prerequisite } from '@openmario/contracts';

export const COURSE_NODE_TYPE = 'courseNode';
export const LOGIC_NODE_TYPE = 'logicNode';
export const NODE_WIDTH = 190;
export const NODE_HEIGHT = 80;
export const LOGIC_NODE_WIDTH = 64;
export const LOGIC_NODE_HEIGHT = 40;

export type CourseSummary = {
   id: string;
   subjectId: string;
   courseNumber: string;
   name: string;
};

export type CourseGraphMode = 'requirements' | 'visualizer';

export type CourseNodeData = {
   label: string;
   title: string;
   isRoot: boolean;
   showExpansion: boolean;
   expandedPrereqs: boolean;
   expandedDependents: boolean;
   expandingPrereqs: boolean;
   expandingDependents: boolean;
   onExpandPrereqs: () => void;
   onExpandDependents: () => void;
   onSelect: () => void;
};

export type CourseGraphEdgeType = 'prerequisite' | 'dependent' | 'corequisite' | 'logic';

export type LogicNodeData = {
   operator: 'OR' | 'AND';
};

export function courseLabel(course: Pick<CourseSummary, 'subjectId' | 'courseNumber'>) {
   return `${course.subjectId} ${course.courseNumber}`;
}

export function toCourseSummary(
   course: CourseSummary | Prerequisite | Corequisite | Dependent
): CourseSummary {
   return {
      id: course.id,
      subjectId: course.subjectId,
      courseNumber: course.courseNumber,
      name: course.name
   };
}

export function createCourseNode(
   course: CourseSummary,
   data: Omit<
      CourseNodeData,
      'label' | 'title'
   >
): Node<CourseNodeData> {
   return {
      id: course.id,
      type: COURSE_NODE_TYPE,
      position: { x: 0, y: 0 },
      selectable: true,
      draggable: false,
      className: 'nodrag nopan',
      data: {
         label: courseLabel(course),
         title: course.name,
         ...data
      }
   };
}

function edgeId(type: CourseGraphEdgeType, source: string, target: string) {
   return `${type}:${source}->${target}`;
}

export function createLogicNode(id: string, operator: 'OR' | 'AND'): Node<LogicNodeData> {
   return {
      id,
      type: LOGIC_NODE_TYPE,
      position: { x: 0, y: 0 },
      selectable: false,
      draggable: false,
      focusable: false,
      className: 'nodrag nopan',
      data: { operator }
   };
}

export function createLogicEdge(sourceId: string, targetId: string): Edge {
   return {
      id: `logic:${sourceId}->${targetId}`,
      source: sourceId,
      target: targetId,
      type: 'smoothstep',
      style: { stroke: 'var(--chakra-colors-blue-400)', strokeWidth: 1.5 },
      data: { edgeType: 'logic' satisfies CourseGraphEdgeType }
   };
}

export function buildPrerequisiteLogicGraph(
   rootId: string,
   prerequisiteGroups: CourseSummary[][],
   contextId: string
): {
   courses: CourseSummary[];
   logicNodes: Node<LogicNodeData>[];
   edges: Edge[];
} {
   const courses: CourseSummary[] = [];
   const logicNodes: Node<LogicNodeData>[] = [];
   const edges: Edge[] = [];
   const seenCourseIds = new Set<string>();

   const groups = prerequisiteGroups
      .map(group => group.map(toCourseSummary))
      .filter(group => group.length > 0);

   if (groups.length === 0) {
      return { courses, logicNodes, edges };
   }

   const groupOutputs: string[] = [];

   for (const [groupIndex, group] of groups.entries()) {
      for (const course of group) {
         if (!seenCourseIds.has(course.id)) {
            seenCourseIds.add(course.id);
            courses.push(course);
         }
      }

      if (group.length === 1) {
         groupOutputs.push(group[0]!.id);
      } else {
         const orNodeId = `or:${contextId}:${groupIndex}`;
         logicNodes.push(createLogicNode(orNodeId, 'OR'));
         for (const course of group) {
            edges.push(createLogicEdge(course.id, orNodeId));
         }
         groupOutputs.push(orNodeId);
      }
   }

   if (groupOutputs.length > 1) {
      const andNodeId = `and:${contextId}`;
      logicNodes.push(createLogicNode(andNodeId, 'AND'));
      for (const outputId of groupOutputs) {
         edges.push(createLogicEdge(outputId, andNodeId));
      }
      edges.push(createPrerequisiteEdge(andNodeId, rootId));
   } else {
      edges.push(createPrerequisiteEdge(groupOutputs[0]!, rootId));
   }

   return { courses, logicNodes, edges };
}

function getNodeDimensions(node: Node) {
   if (node.type === LOGIC_NODE_TYPE) {
      return { width: LOGIC_NODE_WIDTH, height: LOGIC_NODE_HEIGHT };
   }
   return { width: NODE_WIDTH, height: NODE_HEIGHT };
}

export function createPrerequisiteEdge(sourceId: string, targetId: string): Edge {
   return {
      id: edgeId('prerequisite', sourceId, targetId),
      source: sourceId,
      target: targetId,
      type: 'smoothstep',
      animated: false,
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      style: { stroke: 'var(--chakra-colors-blue-500)', strokeWidth: 2 },
      label: 'prereq',
      labelStyle: { fontSize: 10, fill: 'var(--chakra-colors-fg-muted)' },
      labelBgStyle: { fill: 'var(--chakra-colors-bg)' },
      data: { edgeType: 'prerequisite' satisfies CourseGraphEdgeType }
   };
}

export function createDependentEdge(sourceId: string, targetId: string): Edge {
   return {
      id: edgeId('dependent', sourceId, targetId),
      source: sourceId,
      target: targetId,
      type: 'smoothstep',
      animated: false,
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      style: { stroke: 'var(--chakra-colors-purple-500)', strokeWidth: 2 },
      label: 'required by',
      labelStyle: { fontSize: 10, fill: 'var(--chakra-colors-fg-muted)' },
      labelBgStyle: { fill: 'var(--chakra-colors-bg)' },
      data: { edgeType: 'dependent' satisfies CourseGraphEdgeType }
   };
}

export function createCorequisiteEdge(sourceId: string, targetId: string): Edge {
   const sortedIds = [sourceId, targetId].sort();
   const a = sortedIds[0]!;
   const b = sortedIds[1]!;
   return {
      id: edgeId('corequisite', a, b),
      source: sourceId,
      target: targetId,
      type: 'straight',
      animated: true,
      style: {
         stroke: 'var(--chakra-colors-green-500)',
         strokeWidth: 2,
         strokeDasharray: '6 4'
      },
      label: 'coreq',
      labelStyle: { fontSize: 10, fill: 'var(--chakra-colors-fg-muted)' },
      labelBgStyle: { fill: 'var(--chakra-colors-bg)' },
      data: { edgeType: 'corequisite' satisfies CourseGraphEdgeType }
   };
}

export type GraphTheme = {
   prereq: string;
   dependent: string;
   coreq: string;
   logic: string;
   label: string;
   labelBg: string;
};

export function applyGraphTheme(edges: Edge[], theme: GraphTheme): Edge[] {
   return edges.map(edge => {
      const type = edge.data?.edgeType as CourseGraphEdgeType | undefined;
      const stroke =
         type === 'dependent'
            ? theme.dependent
            : type === 'corequisite'
              ? theme.coreq
              : type === 'logic'
                ? theme.logic
                : theme.prereq;

      return {
         ...edge,
         style: { ...edge.style, stroke },
         labelStyle: edge.labelStyle ? { ...edge.labelStyle, fill: theme.label } : undefined,
         labelBgStyle: edge.labelBgStyle ? { ...edge.labelBgStyle, fill: theme.labelBg } : undefined,
         markerEnd:
            edge.markerEnd && typeof edge.markerEnd === 'object'
               ? { ...edge.markerEnd, color: stroke }
               : edge.markerEnd
      };
   });
}

export function mergeUniqueEdges(existing: Edge[], incoming: Edge[]) {
   const seen = new Set(existing.map(edge => edge.id));
   const merged = [...existing];

   for (const edge of incoming) {
      if (seen.has(edge.id)) continue;
      seen.add(edge.id);
      merged.push(edge);
   }

   return merged;
}

export function mergeUniqueNodes(existing: Node<CourseNodeData>[], incoming: Node<CourseNodeData>[]) {
   const byId = new Map(existing.map(node => [node.id, node]));

   for (const node of incoming) {
      if (!byId.has(node.id)) {
         byId.set(node.id, node);
      }
   }

   return [...byId.values()];
}

export function getLayoutedElements(
   nodes: Node[],
   edges: Edge[],
   direction: 'LR' | 'TB' = 'TB'
) {
   const graph = new dagre.graphlib.Graph();
   graph.setDefaultEdgeLabel(() => ({}));
   graph.setGraph({
      rankdir: direction,
      nodesep: direction === 'TB' ? 56 : 48,
      ranksep: direction === 'TB' ? 72 : 90,
      marginx: 24,
      marginy: 24
   });

   nodes.forEach(node => {
      const { width, height } = getNodeDimensions(node);
      graph.setNode(node.id, { width, height });
   });

   edges
      .filter(edge => direction === 'TB' || edge.data?.edgeType !== 'corequisite')
      .forEach(edge => {
         graph.setEdge(edge.source, edge.target);
      });

   dagre.layout(graph);

   const isVertical = direction === 'TB';
   const layoutedNodes = nodes.map((node, index) => {
      const position = graph.node(node.id);
      const { width, height } = getNodeDimensions(node);
      const x = Number.isFinite(position?.x) ? position.x - width / 2 : index * (NODE_WIDTH + 40);
      const y = Number.isFinite(position?.y) ? position.y - height / 2 : index * (NODE_HEIGHT + 32);
      return {
         ...node,
         position: { x, y },
         sourcePosition: isVertical ? Position.Bottom : Position.Right,
         targetPosition: isVertical ? Position.Top : Position.Left
      };
   });

   return { nodes: layoutedNodes, edges };
}
