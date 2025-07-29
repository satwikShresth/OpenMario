import { Box, Card, Center, EmptyState, Spinner, Text, VStack } from '@chakra-ui/react';
import { MdHourglassEmpty, MdRefresh } from 'react-icons/md';
import { keyframes } from '@emotion/react';

interface LoadingComponentProps {
   title?: string;
   message?: string;
   variant?: 'default' | 'processing' | 'fetching';
   size?: 'sm' | 'md' | 'lg';
}

// Custom pulse animation for the icon
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

// Rotation animation for processing variant
const rotateAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const LoadingComponent: React.FC<LoadingComponentProps> = ({
   title = 'Loading...',
   message = 'Please wait while we process your request',
   variant = 'default',
   size = 'lg',
}) => {
   const getIcon = () => {
      switch (variant) {
         case 'processing':
            return <MdRefresh />;
         case 'fetching':
            return <MdHourglassEmpty />;
         default:
            return <MdHourglassEmpty />;
      }
   };

   const getIconAnimation = () => {
      switch (variant) {
         case 'processing':
            return `${rotateAnimation} 2s linear infinite`;
         default:
            return `${pulseAnimation} 2s ease-in-out infinite`;
      }
   };

   const cardSize = size === 'sm' ? 'md' : size;
   const spinnerSize = size === 'sm' ? 'md' : 'xl';
   const iconSize = size === 'sm' ? '32px' : '48px';

   return (
      <Center minH='200px' p={4}>
         <EmptyState.Root size={size}>
            <EmptyState.Content>
               <Card.Root
                  size={cardSize}
                  p={size === 'sm' ? '6' : '10'}
                  bg='white'
                  boxShadow='lg'
                  borderRadius='xl'
                  border='1px solid'
                  borderColor='gray.100'
               >
                  <Card.Header pb={2}>
                     <EmptyState.Indicator>
                        <Box
                           fontSize={iconSize}
                           color='blue.500'
                           animation={getIconAnimation()}
                        >
                           {getIcon()}
                        </Box>
                     </EmptyState.Indicator>
                  </Card.Header>
                  <Card.Body>
                     <VStack textAlign='center' gap={size === 'sm' ? '3' : '5'}>
                        <EmptyState.Title>
                           <Text
                              fontSize={size === 'sm' ? 'lg' : 'xl'}
                              fontWeight='semibold'
                              color='gray.800'
                           >
                              {title}
                           </Text>
                        </EmptyState.Title>

                        <EmptyState.Description
                           fontSize={size === 'sm' ? 'sm' : 'md'}
                           color='gray.600'
                           maxW='300px'
                        >
                           {message}
                        </EmptyState.Description>

                        <Box pt={2}>
                           <Spinner
                              size={spinnerSize}
                              color='blue.500'
                           />
                        </Box>

                        <Text
                           fontSize='xs'
                           color='gray.400'
                           fontStyle='italic'
                        >
                           This may take a moment...
                        </Text>
                     </VStack>
                  </Card.Body>
               </Card.Root>
            </EmptyState.Content>
         </EmptyState.Root>
      </Center>
   );
};
