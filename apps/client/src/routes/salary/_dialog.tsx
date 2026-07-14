import { Outlet, createFileRoute, Link } from '@tanstack/react-router'
import { Box, Button, Icon } from '@chakra-ui/react'
import { ArrowLeftIcon } from '@/components/icons'

export const Route = createFileRoute('/salary/_dialog')({
   component: () => (
      <Box w='full' maxW='full' py={{ base: 1, md: 2 }}>
         <Button asChild variant='ghost' size='sm' w='fit-content' px={1} mb={5} color='fg.muted'>
            <Link to='/salary'>
               <Icon as={ArrowLeftIcon} />
               Back to Salary
            </Link>
         </Button>
         <Outlet />
      </Box>
   ),
})
