import { createFileRoute } from '@tanstack/react-router';
import { Box, HStack, Separator, Text, VStack } from '@chakra-ui/react';
import {
   RefinementCheckbox,
   RefinementSelect,
   Search,
   SearchBox,
   SortSelect,
   Stats,
} from '@/components/Search';
// import { useMobile } from '@/hooks';
import { Index } from 'react-instantsearch';

export const Route = createFileRoute('/_search/courses')({
   component: () => {
      // const isMobile = useMobile();
      return (
         <Index indexName='sections'>
            <VStack>
               <HStack width='full' gap={5} justify='space-between'>
                  <SearchBox />
                  <RefinementSelect attribute='term' size='lg' />
               </HStack>
               <HStack width='full' align='normal' mt={1} gap={5} justify='space-between'>
                  <Box
                     maxW='330px'
                     p={2}
                     px={3}
                     height='fit-content'
                     position='sticky'
                     top={0}
                     zIndex={1}
                     borderWidth='thin'
                     borderRadius='lg'
                  >
                     <Text pt={2} px={2} fontSize='xl' fontWeight='bold'>Filters</Text>
                     <Separator mx={2} mt={1} />
                     <RefinementCheckbox attribute='days' />
                     <RefinementCheckbox attribute='instruction_type' />
                     <RefinementCheckbox attribute='subject_name' />
                     <RefinementCheckbox attribute='college_name' />
                     <RefinementCheckbox attribute='instruction_method' />
                     <RefinementCheckbox attribute='instructors.name' />
                     <RefinementCheckbox attribute='instructors.department' />
                  </Box>
                  <VStack w='full'>
                     <HStack w='full' justify='space-between'>
                        <Stats />
                        <SortSelect />
                     </HStack>
                     <VStack gap={5} align='start'>
                        <Search.Courses.Cards />
                        <Search.Courses.Pagination />
                     </VStack>
                  </VStack>
               </HStack>
            </VStack>
         </Index>
      );
   },
});
