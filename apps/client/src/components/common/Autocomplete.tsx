import { Combobox, HStack, type ListCollection, Portal, Span, Spinner } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export type AutocompleteOptions = {
   id: string;
   name: string;
};

type ComboboxAutoCompleteProps = {
   combobox: any; // Replace with actual combobox hook type
   label: string;
   collection: ListCollection<AutocompleteOptions>;
   status: 'error' | 'pending' | 'success';
   children?: ReactNode;
};

export const Autocomplete = ({
   combobox,
   label,
   collection,
   status,
   children,
}: ComboboxAutoCompleteProps) => (
   <Combobox.RootProvider value={combobox} width='320px'>
      <Combobox.Label>{label}</Combobox.Label>
      <Combobox.Control>
         <Combobox.Input placeholder='Select a company' />
         <Combobox.IndicatorGroup>
            <Combobox.ClearTrigger />
            <Combobox.Trigger />
         </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal>
         <Combobox.Positioner>
            <Combobox.Content minW='sm'>
               <CombooxUIContent collection={collection} status={status}>
                  {children}
               </CombooxUIContent>
            </Combobox.Content>
         </Combobox.Positioner>
      </Portal>
   </Combobox.RootProvider>
);

type CombooxUIContentProps = {
   collection: ListCollection<AutocompleteOptions>;
   status: 'error' | 'pending' | 'success';
   children?: ReactNode;
};

const CombooxUIContent = ({ collection, status, children }: CombooxUIContentProps) => {
   if (status === 'pending') {
      return (
         <HStack p='2'>
            <Spinner size='xs' borderWidth='1px' />
            <Span>Loading...</Span>
         </HStack>
      );
   }

   if (status === 'error') {
      return (
         <Span p='2' color='fg.error'>
            Error fetching
         </Span>
      );
   }

   return (
      collection.items?.map((character) => (
         <Combobox.Item key={character.name} item={character}>
            <HStack justify='space-between' textStyle='sm'>
               <Span fontWeight='medium' truncate>
                  {character.name}
               </Span>
            </HStack>
            {children}
            <Combobox.ItemIndicator />
         </Combobox.Item>
      ))
   );
};
