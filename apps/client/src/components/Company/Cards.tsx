import { Box, VStack } from '@chakra-ui/react';
import { useNavigate } from '@tanstack/react-router';
import { useInfiniteHits } from 'react-instantsearch';
import { useCallback, useRef } from 'react';
import { Card } from './Card';
import type { CompanyListItem } from './types';

export function Cards() {
   const { items, showMore, isLastPage } = useInfiniteHits<CompanyListItem>();
   const navigate = useNavigate();

   const showMoreRef = useRef(showMore);
   const isLastPageRef = useRef(isLastPage);
   showMoreRef.current = showMore;
   isLastPageRef.current = isLastPage;

   const observerRef = useRef<IntersectionObserver | null>(null);

   const sentinelCallbackRef = useCallback((el: HTMLDivElement | null) => {
      if (el) {
         observerRef.current = new IntersectionObserver(entries => {
            entries.forEach(entry => {
               if (entry.isIntersecting && !isLastPageRef.current) {
                  showMoreRef.current();
               }
            });
         });
         observerRef.current.observe(el);
      } else {
         observerRef.current?.disconnect();
         observerRef.current = null;
      }
   }, []);

   return (
      <VStack gap={3} align='stretch'>
         {items.map(company => (
            <Card
               key={company.company_id}
               company={company}
               onClick={() =>
                  navigate({ to: '/companies/$company_id', params: { company_id: company.company_id } })
               }
            />
         ))}
         <Box ref={sentinelCallbackRef} />
      </VStack>
   );
}
