import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useProfessorDetail } from './detailStore';

export function ProfessorBreadcrumb() {
   const name = useProfessorDetail(s => s.prof?.instructor_name);
   return (
      <Breadcrumb items={[
         { type: 'link', label: 'Professors', to: '/professors' },
         name ? { type: 'current', label: name } : { type: 'loading' },
      ]} />
   );
}
