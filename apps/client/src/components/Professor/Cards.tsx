import { Box, VStack } from '@chakra-ui/react';
import { useNavigate } from '@tanstack/react-router';
import { useInfiniteHits } from 'react-instantsearch';
import { useCallback, useRef } from 'react';
import { ProfessorCard } from './Card';
import type { ProfessorListItem } from './types';

export function Cards() {
   const { items, showMore, isLastPage } = useInfiniteHits<ProfessorListItem>();
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
         {items.map(prof => (
            <ProfessorCard
               key={prof.id}
               prof={prof}
               onClick={() =>
                  navigate({
                     to: '/professors/$professor_id',
                     params: { professor_id: String(prof.id) },
                  })
               }
            />
         ))}
         <Box ref={sentinelCallbackRef} />
      </VStack>
   );
}
