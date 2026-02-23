import { Separator } from '@chakra-ui/react';
import { useQueries } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useLayoutEffect } from 'react';
import { orpc } from '@/helpers/rpc.ts';
import { Professor, professorDetailStore, type Section, type ProfessorProfile, currentTermId } from '@/components/Professor';

export const Route = createFileRoute('/professors/$professor_id')({
   component: ProfessorPage,
});

function ProfessorPage() {
   const { professor_id } = Route.useParams();
   const profIdNum = Number(professor_id);

   const [profileQuery, sectionsQuery] = useQueries({
      queries: [
         orpc.professor.get.queryOptions({ input: { professor_id: profIdNum }, staleTime: 30_000 }),
         orpc.professor.sections.queryOptions({ input: { professor_id: profIdNum }, staleTime: 30_000 }),
      ],
   });

   const isLoading = profileQuery.isLoading || sectionsQuery.isLoading;
   const cutoff = currentTermId();
   const allSections = (sectionsQuery.data as Section[] | undefined) ?? [];

   useLayoutEffect(() => {
      professorDetailStore.setState(() => ({
         prof: profileQuery.data as ProfessorProfile | undefined,
         allSections,
         upcomingSections: allSections.filter(s => s.term_id >= cutoff),
         pastSections: allSections.filter(s => s.term_id < cutoff),
         isLoading,
      }));
   }, [profileQuery.data, allSections, isLoading, cutoff]);

   return (
      <Professor.Root maxW='5xl' py={8}>
         <Professor.Breadcrumb />
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
