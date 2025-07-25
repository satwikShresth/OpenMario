import { Outlet } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { Index } from 'react-instantsearch';

export const Route = createFileRoute('/_search/courses')({
   component: () => (
      <Index indexName='sections'>
         <Outlet />
      </Index>
   ),
});
