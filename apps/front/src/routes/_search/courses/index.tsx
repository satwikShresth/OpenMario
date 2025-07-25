import { createFileRoute } from '@tanstack/react-router';
import { useSearchBox, useSortBy, useStats } from 'react-instantsearch';
import {
   Box,
   CloseButton,
   createListCollection,
   Field,
   HStack,
   Input,
   InputGroup,
   Portal,
   Select,
   Separator,
   Stat,
   Text,
   VStack,
} from '@chakra-ui/react';
import { RefinementCheckbox, RefinementSelect } from '@/components/search';
import { useMobile } from '@/hooks';
import Courses from './-courses.tsx';
import { InfoTip } from '@/components/ui';

export const Route = createFileRoute('/_search/courses/')({
   component: () => {
      const isMobile = useMobile();
      const search = useSearchBox();
      const stats = useStats();
      const sort = useSortBy({ items: sortBy.items });

      return (
         <VStack>
            <HStack width='full' gap={5} justify='space-between'>
               <Field.Root>
                  <Field.Label hidden={!isMobile} fontSize='xl' fontWeight='semibold'>
                     Search
                  </Field.Label>
                  <InputGroup
                     startAddon='Search'
                     endElement={search.query
                        ? (
                           <CloseButton
                              size='xs'
                              onClick={() => search.clear()}
                           />
                        )
                        : undefined}
                  >
                     <Input
                        size='xl'
                        fontSize='xl'
                        placeholder='Start typing to search...'
                        value={search.query}
                        onChange={(e) => search.refine(e.target.value)}
                     />
                  </InputGroup>
               </Field.Root>
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
                     <Stat.Root ml={1}>
                        <Stat.Label>
                           Stats
                           <InfoTip>Search performance</InfoTip>
                        </Stat.Label>
                        <Stat.ValueText alignItems='baseline'>
                           {stats.nbHits}
                           <Stat.ValueUnit>hits in</Stat.ValueUnit>
                           {stats.processingTimeMS}
                           <Stat.ValueUnit>ms</Stat.ValueUnit>
                        </Stat.ValueText>
                     </Stat.Root>
                     <Select.Root
                        collection={sortBy}
                        maxW='320px'
                        value={[sort.currentRefinement]}
                        onValueChange={(e) => sort.refine(e.value[0])}
                     >
                        <Select.HiddenSelect />
                        <Select.Label>Sort</Select.Label>
                        <Select.Control>
                           <Select.Trigger>
                              <Select.ValueText />
                           </Select.Trigger>
                           <Select.IndicatorGroup>
                              <Select.Indicator />
                           </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                           <Select.Positioner>
                              <Select.Content>
                                 {sortBy.items.map((sorting) => (
                                    <Select.Item item={sorting} key={sorting.value}>
                                       {sorting.label}
                                       <Select.ItemIndicator />
                                    </Select.Item>
                                 ))}
                              </Select.Content>
                           </Select.Positioner>
                        </Portal>
                     </Select.Root>
                  </HStack>
                  <Courses />
               </VStack>
            </HStack>
         </VStack>
      );
   },
});

const sortBy = createListCollection({
   items: [
      { label: 'Most Relevant', value: 'sections' },
      {
         label: 'Course Number (Low to High)',
         value: 'sections:course_number:asc',
      },
      {
         label: 'Course Number (High to Low)',
         value: 'sections:course_number:desc',
      },
      {
         label: 'Credits (Highest)',
         value: 'sections:credits:desc',
      },
      {
         label: 'Credits (Lowest)',
         value: 'sections:credits:asc',
      },
      {
         label: 'Start Time (Earliest)',
         value: 'sections:start_time:asc',
      },
      {
         label: 'Start Time (Latest)',
         value: 'sections:start_time:desc',
      },
      {
         label: 'Instructor Rating (Highest)',
         value: 'sections:instructors.avg_rating:desc',
      },
   ],
});
