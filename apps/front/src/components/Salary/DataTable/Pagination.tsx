import {
   ButtonGroup,
   createListCollection,
   HStack,
   Pagination,
   Portal,
   Select,
} from '@chakra-ui/react';
import { PaginationLink } from '../../common/index.tsx';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { useSalaryTableStore } from '../Store.ts';

const pageSizes = createListCollection({
   items: ['10', '20', '30', '40', '50'].map((value) => ({
      label: value,
      value,
   })),
});

export default ({ count }: { count: number }) => {
   const { Route } = useSalaryTableStore();
   const query = Route.useSearch();
   const navigate = Route.useNavigate();

   return (
      <HStack mt='3' justifySelf='center'>
         <Select.Root
            collection={pageSizes}
            width='70px'
            defaultValue={[String(query.pageSize)]}
            value={[String(query.pageSize)]}
            onValueChange={({ value: [pageSize] }) => {
               navigate({
                  search: (prev) => ({ ...prev, pageSize }),
               });
            }}
         >
            <Select.HiddenSelect />
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
                     {pageSizes.items.map((framework) => (
                        <Select.Item
                           item={framework}
                           key={framework.value}
                        >
                           {framework.label}
                           <Select.ItemIndicator />
                        </Select.Item>
                     ))}
                  </Select.Content>
               </Select.Positioner>
            </Portal>
         </Select.Root>
         <Pagination.Root
            count={count}
            pageSize={query.pageSize}
            page={query.pageIndex}
            onPageChange={({ page }) => {
               navigate({
                  search: (prev) => ({ ...prev, pageIndex: page }),
               });
            }}
         >
            <ButtonGroup variant='ghost' size='sm' wrap='wrap'>
               <PaginationLink to={Route.path} page='prev'>
                  <LuChevronLeft />
               </PaginationLink>

               <Pagination.Items
                  render={(page) => (
                     <PaginationLink
                        to={Route.path}
                        page={page.value}
                        variant={{
                           base: 'ghost',
                           _selected: 'outline',
                        }}
                     >
                        {page.value}
                     </PaginationLink>
                  )}
               />

               <PaginationLink to={Route.path} page='next'>
                  <LuChevronRight />
               </PaginationLink>
            </ButtonGroup>
         </Pagination.Root>
      </HStack>
   );
};
