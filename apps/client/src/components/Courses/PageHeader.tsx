import { Text } from '@chakra-ui/react';

export function PageHeader({ title }: { title: string }) {
   return <Text fontSize='2xl' fontWeight='bold'>{title}</Text>;
}
