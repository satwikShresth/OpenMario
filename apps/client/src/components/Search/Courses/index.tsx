import { Pagination } from './Pagination';
import { Card, Cards } from './Card';
import { Index } from 'react-instantsearch';
import type { ReactNode } from 'react';
import { Filters } from './Filters';
import Req from './Req.tsx';
import ReqSection from './ReqSection.tsx';
import PrerequisiteGraph from './PrerequisiteGraph.tsx';
import Availabilites from './Availabilites.tsx';

type CoursesProps = { index: string; children?: ReactNode };
export default {
   Root: ({ index, children }: CoursesProps) => (
      <Index indexName={index}>
         {children}
      </Index>
   ),
   Availabilites,
   Req,
   ReqSection,
   PrerequisiteGraph,
   Pagination,
   Filters,
   Cards,
   Card,
};
