import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useCompanyDetail } from './detailStore';

type BreadcrumbItem =
   | { type: 'link'; label: string; to: string; params?: Record<string, string> }
   | { type: 'current'; label: string }
   | { type: 'loading' };

export function CompanyBreadcrumb({ currentLabel }: { currentLabel?: string }) {
   const company_id = useCompanyDetail(s => s.company_id);
   const companyName = useCompanyDetail(s => s.company?.company_name);

   const items: BreadcrumbItem[] = [{ type: 'link', label: 'Companies', to: '/companies' }];

   if (currentLabel) {
      if (companyName) {
         items.push({ type: 'link', label: companyName, to: '/companies/$company_id', params: { company_id } });
      } else {
         items.push({ type: 'loading' });
      }
      items.push({ type: 'current', label: currentLabel });
   } else {
      if (companyName) {
         items.push({ type: 'current', label: companyName });
      } else {
         items.push({ type: 'loading' });
      }
   }

   return <Breadcrumb items={items} />;
}
