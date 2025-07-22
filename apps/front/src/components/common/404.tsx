import {
   AbsoluteCenter,
   Button,
   Card,
   EmptyState,
   HStack,
   Icon,
   Progress,
   Text,
   VStack,
} from '@chakra-ui/react';
import { MdArrowBack, MdFilePresent, MdHome } from 'react-icons/md';
import { Link, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

interface NotFoundComponentProps {
   title?: string;
   message?: string;
   data?: unknown;
}

export const NotFoundComponent: React.FC<NotFoundComponentProps> = ({
   title = 'Page Not Found',
   message = "The page you're looking for doesn't exist.",
}) => {
   const router = useRouter();
   const [progress, setProgress] = useState(0);

   useEffect(() => {
      const interval = setInterval(() => {
         setProgress((prev) => {
            if (prev >= 100) {
               clearInterval(interval);
               router.history.back();
               return 100;
            }
            return prev + 2;
         });
      }, 100);

      return () => clearInterval(interval);
   }, [router]);

   return (
      <AbsoluteCenter mt='-100px'>
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
                              Going back in {Math.ceil((100 - progress) / 20)} seconds...
                           </Text>
                           <Progress.Root
                              value={progress}
                              w='full'
                              colorPalette='blue'
                              striped
                              animated
                           >
                              <Progress.Track>
                                 <Progress.Range />
                              </Progress.Track>
                           </Progress.Root>
                        </VStack>
                     </VStack>
                  </Card.Body>
                  <Card.Footer justifyContent='center'>
                     <HStack gap='3'>
                        <Button
                           colorPalette='gray'
                           variant='outline'
                           onClick={() => router.history.back()}
                        >
                           <Icon as={MdArrowBack} />
                           <Text>Go Back Now</Text>
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
