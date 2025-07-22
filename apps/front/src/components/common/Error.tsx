import { Box, Button, Icon, Text, VStack } from '@chakra-ui/react';
import { MdError, MdRefresh } from 'react-icons/md';
import { type ErrorComponentProps as TanStackErrorProps, useRouter } from '@tanstack/react-router';

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
      <Box p={8} textAlign='center'>
         <VStack gap={4}>
            <Icon as={MdError} boxSize={12} color='red.500' />
            <Text fontSize='xl' fontWeight='semibold'>{title}</Text>
            <Text color='gray.600'>{message}</Text>
            <Button onClick={handleRetry} colorPalette='red'>
               <Icon as={MdRefresh} />
               Try Again
            </Button>
         </VStack>
      </Box>
   );
};
