import { useHitsPerPage, usePagination } from 'react-instantsearch';
import { useMemo } from 'react';
import {
   ButtonGroup,
   createListCollection,
   Flex,
   IconButton,
   Pagination as CPagination,
   Portal,
   Select,
   Text,
} from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { useMobile } from '@/hooks';

export const Pagination = () => {
   const instantPagination = usePagination();
   const hitsPerPage = useHitsPerPage({ items: pageSizes.items });
   const isMobile = useMobile();

   const currentValue = useMemo(
      () => hitsPerPage.items.find(({ isRefined }) => isRefined)?.label!,
      [hitsPerPage.items],
   );

   return (
      <Flex
         direction={{ base: 'column', sm: 'row' }}
         align='center'
         justify='center'
         gap={{ base: 3, sm: 4 }}
         mt={3}
         px={{ base: 4, sm: 0 }}
      >
         {/* Page Size Selector */}
         <Flex align='center' gap={2} order={{ base: 2, sm: 1 }}>
            <Text fontSize={{ base: 'sm', sm: 'md' }} flexShrink={0}>
               Show
            </Text>
            <Select.Root
               collection={pageSizes}
               defaultValue={['10']}
               value={[currentValue]}
               onValueChange={({ value }) => hitsPerPage.refine(parseInt(value[0]))}
               width={{ base: '70px', sm: '80px' }}
            >
               <Select.HiddenSelect />
               <Select.Control>
                  <Select.Trigger>
                     <Select.ValueText>
                        <Text fontSize={{ base: 'sm', sm: 'md' }}>
                           {currentValue}
                        </Text>
                     </Select.ValueText>
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                     <Select.Indicator />
                  </Select.IndicatorGroup>
               </Select.Control>
               <Portal>
                  <Select.Positioner>
                     <Select.Content>
                        {pageSizes.items.map((page) => (
                           <Select.Item item={page} key={page.value}>
                              {page.label}
                              <Select.ItemIndicator />
                           </Select.Item>
                        ))}
                     </Select.Content>
                  </Select.Positioner>
               </Portal>
            </Select.Root>
            <Text fontSize={{ base: 'sm', sm: 'md' }} flexShrink={0}>
               per page
            </Text>
         </Flex>

         {/* Pagination Controls */}
         <CPagination.Root
            page={instantPagination.currentRefinement}
            count={instantPagination.nbHits}
            pageSize={parseInt(currentValue)}
            onPageChange={({ page }) => instantPagination.refine(page)}
            siblingCount={isMobile ? 0 : 2}
            order={{ base: 1, sm: 2 }}
         >
            {isMobile
               ? (
                  // Compact mobile pagination
                  <ButtonGroup gap={3} size='sm' variant='ghost'>
                     <CPagination.PrevTrigger asChild>
                        <IconButton size='sm' disabled={!instantPagination.isFirstPage === false}>
                           <LuChevronLeft />
                        </IconButton>
                     </CPagination.PrevTrigger>

                     <CPagination.PageText
                        fontSize='sm'
                        fontWeight='medium'
                        minWidth='fit-content'
                        textAlign='center'
                     />

                     <CPagination.NextTrigger asChild>
                        <IconButton size='sm' disabled={!instantPagination.isLastPage === false}>
                           <LuChevronRight />
                        </IconButton>
                     </CPagination.NextTrigger>
                  </ButtonGroup>
               )
               : (
                  // Full desktop pagination
                  <ButtonGroup variant='ghost' size='sm' gap={1}>
                     <CPagination.PrevTrigger asChild>
                        <IconButton>
                           <LuChevronLeft />
                        </IconButton>
                     </CPagination.PrevTrigger>

                     <CPagination.Items
                        render={(page) => (
                           <IconButton
                              variant={{ base: 'ghost', _selected: 'outline' }}
                              minWidth='36px'
                           >
                              {page.value}
                           </IconButton>
                        )}
                     />

                     <CPagination.NextTrigger asChild>
                        <IconButton>
                           <LuChevronRight />
                        </IconButton>
                     </CPagination.NextTrigger>
                  </ButtonGroup>
               )}
         </CPagination.Root>
      </Flex>
   );
};

const pageSizes = createListCollection({
   items: [5, 10, 15, 20, 25, 30].map((value) => ({
      default: value === 10,
      label: String(value),
      value,
   })),
});
