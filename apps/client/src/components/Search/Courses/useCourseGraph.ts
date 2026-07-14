import { useToken } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMatch, useNavigate } from '@tanstack/react-router';
import type { Edge, Node } from '@xyflow/react';
import { orpc } from '@/helpers';
import {
   applyGraphTheme,
   buildPrerequisiteLogicGraph,
   createCorequisiteEdge,
   createCourseNode,
   createDependentEdge,
   createPrerequisiteEdge,
   getLayoutedElements,
   mergeUniqueEdges,
   toCourseSummary,
   type CourseGraphMode,
   type CourseNodeData,
   type CourseSummary,
   type GraphTheme,
   type LogicNodeData
} from './prerequisiteGraphUtils';
import type { Prerequisite } from '@openmario/contracts';

type UseCourseGraphOptions = {
   courseId: string;
   mode?: CourseGraphMode;
};

type ExpansionState = {
   expandedPrereqs: Set<string>;
   expandedDependents: Set<string>;
   expandingPrereqs: Set<string>;
   expandingDependents: Set<string>;
};

type GraphSeed = {
   courses: Map<string, CourseSummary>;
   logicNodes: Node<LogicNodeData>[];
   edges: Edge[];
   expandedPrereqs: Set<string>;
   expandedDependents: Set<string>;
};

function buildRequirementsSeed(
   courseId: string,
   data: {
      course: CourseSummary;
      prerequisiteGroups: Prerequisite[][];
      corequisites: CourseSummary[];
   }
): GraphSeed {
   const root = toCourseSummary(data.course);
   const corequisites = data.corequisites.map(toCourseSummary);
   const {
      courses: prereqCourses,
      logicNodes,
      edges: prereqEdges
   } = buildPrerequisiteLogicGraph(
      root.id,
      data.prerequisiteGroups.map(group => group.map(toCourseSummary)),
      courseId
   );

   const courses = new Map<string, CourseSummary>([
      [root.id, root],
      ...prereqCourses.map(course => [course.id, course] as const),
      ...corequisites.map(course => [course.id, course] as const)
   ]);

   return {
      courses,
      logicNodes,
      edges: mergeUniqueEdges(prereqEdges, [
         ...corequisites.map(coreq => createCorequisiteEdge(root.id, coreq.id))
      ]),
      expandedPrereqs: new Set([courseId]),
      expandedDependents: new Set([courseId])
   };
}

function buildVisualizerSeed(
   courseId: string,
   data: {
      course: CourseSummary;
      prerequisiteGroups: Prerequisite[][];
      corequisites: CourseSummary[];
      dependents: CourseSummary[];
   }
): GraphSeed {
   const root = toCourseSummary(data.course);
   const corequisites = data.corequisites.map(toCourseSummary);
   const dependents = data.dependents.map(toCourseSummary);
   const {
      courses: prereqCourses,
      logicNodes,
      edges: prereqEdges
   } = buildPrerequisiteLogicGraph(
      root.id,
      data.prerequisiteGroups.map(group => group.map(toCourseSummary)),
      courseId
   );

   const courses = new Map<string, CourseSummary>([
      [root.id, root],
      ...prereqCourses.map(course => [course.id, course] as const),
      ...corequisites.map(course => [course.id, course] as const),
      ...dependents.map(course => [course.id, course] as const)
   ]);

   return {
      courses,
      logicNodes,
      edges: mergeUniqueEdges(prereqEdges, [
         ...corequisites.map(coreq => createCorequisiteEdge(root.id, coreq.id)),
         ...dependents.map(dependent => createDependentEdge(root.id, dependent.id))
      ]),
      expandedPrereqs: new Set([courseId]),
      expandedDependents: new Set([courseId])
   };
}

function createDefaultNodeData(
   course: CourseSummary,
   rootCourseId: string,
   mode: CourseGraphMode,
   expansion: ExpansionState,
   handlers: {
      onExpandPrereqs: (courseId: string) => void;
      onExpandDependents: (courseId: string) => void;
      onSelect: (courseId: string) => void;
   }
): Node<CourseNodeData> {
   return createCourseNode(course, {
      isRoot: course.id === rootCourseId,
      showExpansion: mode === 'visualizer',
      expandedPrereqs: expansion.expandedPrereqs.has(course.id),
      expandedDependents: expansion.expandedDependents.has(course.id),
      expandingPrereqs: expansion.expandingPrereqs.has(course.id),
      expandingDependents: expansion.expandingDependents.has(course.id),
      onExpandPrereqs: () => handlers.onExpandPrereqs(course.id),
      onExpandDependents: () => handlers.onExpandDependents(course.id),
      onSelect: () => handlers.onSelect(course.id)
   });
}

export function useCourseGraph({ courseId, mode = 'requirements' }: UseCourseGraphOptions) {
   const queryClient = useQueryClient();
   const navigate = useNavigate();
   const planMatch = useMatch({ from: '/courses/plan/schedule/$term_id/$course_id', shouldThrow: false });
   const profileMatch = useMatch({ from: '/courses/profile/$course_id', shouldThrow: false });
   const isVisualizer = mode === 'visualizer';
   const [expansion, setExpansion] = useState<ExpansionState>({
      expandedPrereqs: new Set(),
      expandedDependents: new Set(),
      expandingPrereqs: new Set(),
      expandingDependents: new Set()
   });
   const [expansionGraph, setExpansionGraph] = useState<{
      courses: Map<string, CourseSummary>;
      edges: Edge[];
   }>({ courses: new Map(), edges: [] });

   const { data: initialData, isPending, isError } = useQuery({
      queryKey: ['course-graph', courseId, mode],
      queryFn: async () => {
         const [prereqResult, coreqResult] = await Promise.all([
            queryClient.fetchQuery(
               orpc.course.prerequisites.queryOptions({
                  input: { params: { course_id: courseId } },
                  staleTime: 5 * 60 * 1000
               })
            ),
            queryClient.fetchQuery(
               orpc.course.corequisites.queryOptions({
                  input: { params: { course_id: courseId } },
                  staleTime: 5 * 60 * 1000
               })
            )
         ]);

         const base = {
            course: prereqResult.data!.course,
            prerequisiteGroups: prereqResult.data!.prerequisites,
            corequisites: coreqResult.data!.corequisites
         };

         if (!isVisualizer) return base;

         let dependents: Array<{
            id: string;
            name: string;
            subjectId: string;
            courseNumber: string;
         }> = [];

         try {
            const dependentResult = await queryClient.fetchQuery(
               orpc.course.dependents.queryOptions({
                  input: { params: { course_id: courseId } },
                  staleTime: 5 * 60 * 1000
               })
            );
            dependents = dependentResult.data?.dependents ?? [];
         } catch {
            dependents = [];
         }

         return { ...base, dependents };
      },
      enabled: !!courseId
   });

   useEffect(() => {
      setExpansion({
         expandedPrereqs: new Set(),
         expandedDependents: new Set(),
         expandingPrereqs: new Set(),
         expandingDependents: new Set()
      });
      setExpansionGraph({ courses: new Map(), edges: [] });
   }, [courseId, mode]);

   const seed = useMemo(() => {
      if (!initialData) return null;
      if (isVisualizer && 'dependents' in initialData) {
         return buildVisualizerSeed(courseId, initialData);
      }
      return buildRequirementsSeed(courseId, initialData);
   }, [courseId, initialData, isVisualizer]);

   const graph = useMemo(() => {
      if (!seed) {
         return {
            courses: new Map<string, CourseSummary>(),
            logicNodes: [] as Node<LogicNodeData>[],
            edges: [] as Edge[]
         };
      }

      const courses = new Map(seed.courses);
      if (isVisualizer) {
         for (const [id, course] of expansionGraph.courses) {
            courses.set(id, course);
         }
      }

      return {
         courses,
         logicNodes: seed.logicNodes,
         edges: isVisualizer
            ? mergeUniqueEdges(seed.edges, expansionGraph.edges)
            : seed.edges
      };
   }, [expansionGraph.courses, expansionGraph.edges, isVisualizer, seed]);

   const activeExpansion = useMemo<ExpansionState>(
      () => ({
         expandedPrereqs: new Set([
            ...(seed?.expandedPrereqs ?? []),
            ...expansion.expandedPrereqs
         ]),
         expandedDependents: new Set([
            ...(seed?.expandedDependents ?? []),
            ...expansion.expandedDependents
         ]),
         expandingPrereqs: expansion.expandingPrereqs,
         expandingDependents: expansion.expandingDependents
      }),
      [expansion, seed]
   );

   const onSelect = useCallback(
      (selectedCourseId: string) => {
         if (selectedCourseId === courseId) return;

         if (planMatch) {
            navigate({
               to: '/courses/plan/schedule/$term_id/$course_id',
               params: {
                  term_id: planMatch.params.term_id,
                  course_id: selectedCourseId
               },
               resetScroll: false
            });
            return;
         }

         if (profileMatch) {
            navigate({
               to: '/courses/profile/$course_id',
               params: { course_id: selectedCourseId },
               resetScroll: false
            });
            return;
         }

         navigate({
            to: '/courses/explore/$course_id',
            params: { course_id: selectedCourseId },
            resetScroll: false
         });
      },
      [courseId, navigate, planMatch, profileMatch]
   );

   const addCoursesAndEdges = useCallback(
      (nextCourses: CourseSummary[], nextEdges: Edge[]) => {
         setExpansionGraph(prev => {
            const courses = new Map(prev.courses);
            for (const course of nextCourses) {
               courses.set(course.id, course);
            }
            return {
               courses,
               edges: mergeUniqueEdges(prev.edges, nextEdges)
            };
         });
      },
      []
   );

   const expandPrereqs = useCallback(
      async (targetCourseId: string) => {
         if (!isVisualizer) return;

         setExpansion(prev => ({
            ...prev,
            expandingPrereqs: new Set(prev.expandingPrereqs).add(targetCourseId)
         }));

         try {
            const [prereqResult, coreqResult] = await Promise.all([
               queryClient.fetchQuery(
                  orpc.course.prerequisites.queryOptions({
                     input: { params: { course_id: targetCourseId } },
                     staleTime: 5 * 60 * 1000
                  })
               ),
               queryClient.fetchQuery(
                  orpc.course.corequisites.queryOptions({
                     input: { params: { course_id: targetCourseId } },
                     staleTime: 5 * 60 * 1000
                  })
               )
            ]);

            const prerequisites = prereqResult.data!.prerequisites.flat().map(toCourseSummary);
            const corequisites = coreqResult.data!.corequisites.map(toCourseSummary);
            const nextEdges = [
               ...prerequisites.map(prereq =>
                  createPrerequisiteEdge(prereq.id, targetCourseId)
               ),
               ...corequisites.map(coreq =>
                  createCorequisiteEdge(targetCourseId, coreq.id)
               )
            ];

            addCoursesAndEdges([...prerequisites, ...corequisites], nextEdges);
         } finally {
            setExpansion(prev => {
               const expandedPrereqs = new Set(prev.expandedPrereqs);
               const expandingPrereqs = new Set(prev.expandingPrereqs);
               expandedPrereqs.add(targetCourseId);
               expandingPrereqs.delete(targetCourseId);
               return { ...prev, expandedPrereqs, expandingPrereqs };
            });
         }
      },
      [addCoursesAndEdges, isVisualizer, queryClient]
   );

   const expandDependents = useCallback(
      async (targetCourseId: string) => {
         if (!isVisualizer) return;

         setExpansion(prev => ({
            ...prev,
            expandingDependents: new Set(prev.expandingDependents).add(targetCourseId)
         }));

         try {
            const result = await queryClient
               .fetchQuery(
                  orpc.course.dependents.queryOptions({
                     input: { params: { course_id: targetCourseId } },
                     staleTime: 5 * 60 * 1000
                  })
               )
               .catch(() => ({
                  data: {
                     course: { id: targetCourseId, name: '', subjectId: '', courseNumber: '' },
                     dependents: []
                  }
               }));

            const dependents = result.data!.dependents.map(toCourseSummary);
            const nextEdges = dependents.map(dependent =>
               createDependentEdge(targetCourseId, dependent.id)
            );

            addCoursesAndEdges(dependents, nextEdges);
         } finally {
            setExpansion(prev => {
               const expandedDependents = new Set(prev.expandedDependents);
               const expandingDependents = new Set(prev.expandingDependents);
               expandedDependents.add(targetCourseId);
               expandingDependents.delete(targetCourseId);
               return { ...prev, expandedDependents, expandingDependents };
            });
         }
      },
      [addCoursesAndEdges, isVisualizer, queryClient]
   );

   const handlers = useMemo(
      () => ({
         onExpandPrereqs: expandPrereqs,
         onExpandDependents: expandDependents,
         onSelect
      }),
      [expandDependents, expandPrereqs, onSelect]
   );

   const layoutDirection = isVisualizer ? 'LR' : 'TB';
   const [blue500, blue400, purple500, green500, fgMuted, bg] = useToken('colors', [
      'blue.500',
      'blue.400',
      'purple.500',
      'green.500',
      'fg.muted',
      'bg'
   ]);

   const graphTheme = useMemo<GraphTheme>(
      () => ({
         prereq: blue500 ?? '#3b82f6',
         dependent: purple500 ?? '#a855f7',
         coreq: green500 ?? '#22c55e',
         logic: blue400 ?? '#60a5fa',
         label: fgMuted ?? '#a1a1aa',
         labelBg: bg ?? '#09090b'
      }),
      [bg, blue400, blue500, fgMuted, green500, purple500]
   );

   const { nodes, edges: layoutedEdges } = useMemo(() => {
      const courseNodes = [...graph.courses.values()].map(course =>
         createDefaultNodeData(course, courseId, mode, activeExpansion, handlers)
      );
      return getLayoutedElements(
         [...courseNodes, ...graph.logicNodes],
         graph.edges,
         layoutDirection
      );
   }, [
      activeExpansion,
      courseId,
      graph.courses,
      graph.edges,
      graph.logicNodes,
      handlers,
      layoutDirection,
      mode
   ]);

   const edges = useMemo(
      () => applyGraphTheme(layoutedEdges, graphTheme),
      [graphTheme, layoutedEdges]
   );

   return {
      nodes,
      edges,
      isPending,
      isError,
      mode,
      onNodeSelect: onSelect
   };
}
