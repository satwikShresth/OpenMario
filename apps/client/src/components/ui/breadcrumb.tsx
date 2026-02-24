import { HStack, Skeleton, Text } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { ChevronRightIcon } from '@/components/icons';

export type BreadcrumbItem<TPrams> =
   | { type: 'link'; label: string; to: string; params?: TPrams }
   | { type: 'current'; label: string }
   | { type: 'loading' };

interface BreadcrumbProps<TPrams> {
   items: BreadcrumbItem<TPrams>[];
}

export function Breadcrumb<TPrams>({ items }: BreadcrumbProps<TPrams>) {
   return (
      <HStack gap={1.5} fontSize='sm' color='fg.muted' flexWrap='wrap'>
         {items.map((item, i) => (
            <HStack key={i} gap={1.5}>
               {i > 0 && <ChevronRightIcon size={13} />}
               {item.type === 'link' ? (
                  <Link to={item.to} params={item.params!}>
                     <Text
                        fontSize='sm'
                        color='fg.muted'
                        _hover={{ color: 'fg', textDecoration: 'underline' }}
                        transition='color 0.15s'
                     >
                        {item.label}
                     </Text>
                  </Link>
               ) : item.type === 'current' ? (
                  <Text fontSize='sm' color='fg' fontWeight='medium' lineClamp={1} maxW='360px'>
                     {item.label}
                  </Text>
               ) : (
                  <Skeleton height='14px' width='140px' borderRadius='sm' />
               )}
            </HStack>
         ))}
      </HStack>
   );
}
