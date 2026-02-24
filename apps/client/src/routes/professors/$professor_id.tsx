import { Separator } from '@chakra-ui/react';
import { useQueries } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useLayoutEffect } from 'react';
import { orpc } from '@/helpers/rpc.ts';
import { Professor, professorDetailStore, currentTermId } from '@/components/Professor';

export const Route = createFileRoute('/professors/$professor_id')({
   beforeLoad: ({ context: { queryClient }, params: { professor_id } }) => ({
      getLabel: () =>
         queryClient
            .ensureQueryData(orpc.professor.get.queryOptions({ input: { params: { professor_id: Number(professor_id) } }, staleTime: 30_000 }))
            .then((data) => data?.name),
   }),
   component: ProfessorPage,
});

function ProfessorPage() {
   const { professor_id } = Route.useParams();
   const profIdNum = Number(professor_id);

   const [profileQuery, sectionsQuery] = useQueries({
      queries: [
         orpc.professor.get.queryOptions({ input: { params: { professor_id: profIdNum }, }, staleTime: 30_000 }),
         orpc.professor.sections.queryOptions({ input: { params: { professor_id: profIdNum } }, staleTime: 30_000 }),
      ],
   });

   const isLoading = profileQuery.isLoading || sectionsQuery.isLoading;
   const cutoff = currentTermId();
   const allSections = sectionsQuery.data ?? [];

   useLayoutEffect(() => {
      professorDetailStore.setState(() => ({
         prof: profileQuery.data,
         allSections,
         upcomingSections: allSections.filter(s => s.term_id >= cutoff),
         pastSections: allSections.filter(s => s.term_id < cutoff),
         isLoading,
      }));
   }, [profileQuery.data, allSections, isLoading, cutoff]);

   return (
      <Professor.Root maxW='5xl'>
         <Professor.Header />
         <Separator />
         <Professor.StatsGrid />
         <Professor.SubjectBadges />
         <Professor.Charts />
         <Professor.InstructionMethods />
         <Professor.SectionsTab />
      </Professor.Root>
   );
}
