import { Card, Center, EmptyState, Spinner, Text, VStack } from '@chakra-ui/react';
import { MdFilePresent } from 'react-icons/md';

interface NotFoundComponentProps {
   title?: string;
   message?: string;
   data?: unknown;
}

export const LoadingComponent: React.FC<NotFoundComponentProps> = ({
   title = 'Loading...',
   message = 'Please wait',
}) => (
   <Center>
      <EmptyState.Root size='lg'>
         <EmptyState.Content>
            <Card.Root size='lg' p='10'>
               <Card.Header>
                  <EmptyState.Indicator>
                     <MdFilePresent />
                  </EmptyState.Indicator>
               </Card.Header>
               <Card.Body>
                  <VStack textAlign='center' gap='4'>
                     <EmptyState.Title>
                        <Text>{title}</Text>
                     </EmptyState.Title>
                     <EmptyState.Description>
                        <Text>{message}</Text>
                     </EmptyState.Description>

                     <VStack gap='2' w='full'>
                        <Text fontSize='sm' color='gray.500'>
                        </Text>
                     </VStack>
                     <Spinner size='xl' />
                  </VStack>
               </Card.Body>
            </Card.Root>
         </EmptyState.Content>
      </EmptyState.Root>
   </Center>
);
