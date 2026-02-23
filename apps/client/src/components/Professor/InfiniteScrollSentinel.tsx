import { Box, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { useProfessorList } from './listStore';

export function InfiniteScrollSentinel() {
   const isFetchingNextPage = useProfessorList(s => s.isFetchingNextPage);
   const hasNextPage = useProfessorList(s => s.hasNextPage);
   const totalCount = useProfessorList(s => s.totalCount);
   const fetchNextPage = useProfessorList(s => s.fetchNextPage);
   const sentinelRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const el = sentinelRef.current;
      if (!el) return;
      const observer = new IntersectionObserver(
         entries => {
            if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage)
               fetchNextPage();
         },
         { threshold: 0.1 }
      );
      observer.observe(el);
      return () => observer.disconnect();
   }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

   return (
      <Box ref={sentinelRef} py={4} display='flex' justifyContent='center'>
         {isFetchingNextPage && <Spinner size='sm' color='fg.muted' />}
         {!hasNextPage && totalCount > 0 && (
            <Text fontSize='sm' color='fg.subtle'>All {totalCount} professors loaded</Text>
         )}
      </Box>
   );
}
