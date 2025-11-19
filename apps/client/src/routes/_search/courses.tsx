import { createFileRoute } from '@tanstack/react-router';
import {
   Box,
   Button,
   createListCollection,
   Flex,
   Icon,
   Switch,
   Text,
   useDisclosure,
} from '@chakra-ui/react';
import {
   RefinementSelect,
   Search,
   SearchBox,
   SortSelect,
   Stats,
   useFavoritesStore,
} from '@/components/Search';
import { useMobile } from '@/hooks';
import { HiFilter } from 'react-icons/hi';
import { Outlet } from '@tanstack/react-router';
import { RiHeartFill, RiHeartLine } from 'react-icons/ri';
import { Configure } from 'react-instantsearch';

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

export const Route = createFileRoute('/_search/courses')({
   component: () => {
      const { open: isFilterOpen, onOpen: openFilter, onClose: closeFilter } = useDisclosure();
      const isMobile = useMobile();

      return (
         <Search.Courses.Root index='sections'>
            <Flex
               gap={{ base: 3, md: 4 }}
               px={{ base: 3, md: 4 }}
               py={{ base: 3, md: 4 }}
               direction='column'
               minHeight='0'
               width='full'
               flex='1'
            >
               {/* Search Header */}
               <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  align={{ base: 'stretch', sm: 'center' }}
                  gap={{ base: 3, sm: 4, md: 5 }}
                  width='full'
               >
                  <Box flex='1' minWidth='0'>
                     <SearchBox />
                  </Box>
                  <Box flexShrink={0} width={{ base: 'full', sm: 'auto' }}>
                     <RefinementSelect attribute='term' size={{ base: 'md', md: 'lg' }} />
                  </Box>
               </Flex>

               {/* Mobile Filter and Sort Controls */}
               {isMobile && (
                  <Flex direction='row' width='full' gap={3} justify='space-between'>
                     {/* Filter Button */}
                     <Button onClick={openFilter} variant='outline' size='md'>
                        <Icon as={HiFilter} />
                        <Text>Filters</Text>
                     </Button>

                     {/* Sort Select */}
                     <SortSelect sortBy={sortBy} />
                  </Flex>
               )}

               {/* Main Content Area */}
               <Flex
                  direction={{ base: 'column', lg: 'row' }}
                  flex='1'
                  width='full'
                  minHeight='0'
                  gap={{ base: 4, md: 5 }}
                  align='stretch'
               >
                  {/* Desktop Filters Sidebar - Only show on desktop */}
                  {!isMobile && (
                     <Box width='280px' flexShrink={0}>
                        <Search.Courses.Filters open={isFilterOpen} onClose={closeFilter} />
                     </Box>
                  )}

                  {/* Results Area */}
                  <Flex direction='column' flex='1' minWidth='0' gap={{ base: 3, md: 4 }}>
                     {/* Desktop Stats and Sort Controls - Only show on desktop */}
                     {!isMobile
                        ? (
                           <Flex justify='space-between' align='center' gap={3}>
                              <Box flex='1' minWidth='0'>
                                 <Stats />
                              </Box>
                              <ToggleFav />
                              <Box flexShrink={0}>
                                 <SortSelect sortBy={sortBy} />
                              </Box>
                           </Flex>
                        )
                        : <ToggleFav />}

                     {/* Cards and Pagination */}
                     {isMobile && <Stats />}
                     <Flex
                        direction='column'
                        flex='1'
                        minHeight='0'
                        gap={{ base: 4, md: 5 }}
                        align='stretch'
                     >
                        <Box flex='1' minHeight='0' overflow='hidden'>
                           <Search.Courses.Cards />
                        </Box>
                        <Box flexShrink={0}>
                           <Search.Courses.Pagination />
                        </Box>
                     </Flex>
                  </Flex>
               </Flex>

               <Outlet />
               {/* Mobile Filter Modal/Drawer */}
               {isMobile && (
                  <Search.Courses.Filters
                     open={isFilterOpen}
                     onClose={closeFilter}
                  />
               )}
            </Flex>
         </Search.Courses.Root>
      );
   },
});

const ToggleFav = () => {
   const navigate = Route.useNavigate();
   const showFavorites = Route.useSearch({ select: (s) => s?.showFavorites! === true });

   const favoritesLength = useFavoritesStore((s) => s.actions.getAllFavorites().length);
   const favoritesFilter = useFavoritesStore((s) =>
      s.actions.getAllFavorites().map((fav) => `course_id = "${fav}"`).join(' OR ')
   );

   console.log(favoritesFilter);

   const handleToggle = (checked: boolean) => {
      navigate({
         search: (prev) => ({
            ...prev,
            showFavorites: checked ? true : undefined,
         }),
      });
   };

   return (
      <>
         {showFavorites && favoritesLength > 0 && <Configure filters={favoritesFilter} />}
         <Switch.Root
            colorPalette='pink'
            size='md'
            checked={showFavorites}
            onCheckedChange={({ checked }) => {
               handleToggle(checked);
            }}
         >
            <Switch.Label>Show liked courses ({favoritesLength})</Switch.Label>
            <Switch.HiddenInput />
            <Switch.Control>
               <Switch.Thumb>
                  <Switch.ThumbIndicator fallback={<Icon as={RiHeartLine} />}>
                     <Icon as={RiHeartFill} />
                  </Switch.ThumbIndicator>
               </Switch.Thumb>
            </Switch.Control>
         </Switch.Root>
      </>
   );
};
