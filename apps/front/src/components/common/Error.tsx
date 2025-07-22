import {
   AbsoluteCenter,
   Button,
   Card,
   EmptyState,
   HStack,
   Icon,
   Text,
   VStack,
} from '@chakra-ui/react';
import { MdError, MdHome, MdRefresh } from 'react-icons/md';
import { type ErrorComponentProps as TanStackErrorProps, useRouter } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';

interface ErrorComponentProps extends Partial<TanStackErrorProps> {
   title?: string;
   message?: string;
   onRetry?: () => void;
}

export const ErrorComponent: React.FC<ErrorComponentProps> = ({
   reset,
   title = 'Something went wrong',
   message = 'An unexpected error occurred.',
   onRetry,
}) => {
   const router = useRouter();

   const handleRetry = async () => {
      if (onRetry) {
         onRetry();
      } else if (reset) {
         reset();
      } else {
         await router.invalidate();
      }
   };

   return (
      <AbsoluteCenter mt='-100px'>
         <EmptyState.Root size='lg'>
            <EmptyState.Content>
               <Card.Root size='lg' p='10'>
                  <Card.Header>
                     <EmptyState.Indicator>
                        <Icon as={MdError} boxSize={12} color='red.500' />
                     </EmptyState.Indicator>
                  </Card.Header>
                  <Card.Body>
                     <VStack textAlign='center' gap='4'>
                        <EmptyState.Title>
                           <Text fontSize='xl' fontWeight='semibold'>{title}</Text>
                        </EmptyState.Title>
                        <EmptyState.Description>
                           <Text>{message}</Text>
                        </EmptyState.Description>
                     </VStack>
                  </Card.Body>
                  <Card.Footer justifyContent='center'>
                     <HStack gap='3'>
                        <Button onClick={handleRetry} colorPalette='red'>
                           <Icon as={MdRefresh} />
                           Try Again
                        </Button>
                        <Link to='/'>
                           <Button colorPalette='blue'>
                              <Icon as={MdHome} />
                              <Text>Go Home</Text>
                           </Button>
                        </Link>
                     </HStack>
                  </Card.Footer>
               </Card.Root>
            </EmptyState.Content>
         </EmptyState.Root>
      </AbsoluteCenter>
   );
};
