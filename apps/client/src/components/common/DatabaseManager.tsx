import React from 'react';
import {
   Box,
   Button,
   CloseButton,
   Dialog,
   Heading,
   Portal,
   Stack,
   Text,
   VStack,
   useDialog
} from '@chakra-ui/react';
import { DatabaseIcon, DownloadIcon, WarningIcon } from '@/components/icons';
import { exportDatabaseAsCSV, clearDatabaseAndReload } from '@/helpers/database';
import { toaster } from '@/components/ui/toaster';

export function DatabaseManagerDialog({ trigger }: { trigger?: React.ReactElement } = {}) {
   const dialog = useDialog();
   const [isExporting, setIsExporting] = React.useState(false);
   const [isClearing, setIsClearing] = React.useState(false);
   const [showConfirmation, setShowConfirmation] = React.useState(false);

   const handleExport = async () => {
      setIsExporting(true);
      try {
         const result = await exportDatabaseAsCSV();

         if (result.success) {
            toaster.success({
               title: 'Export Successful',
               description: result.message,
               duration: 5000
            });
         } else {
            toaster.error({
               title: 'Export Failed',
               description: result.message,
               duration: 5000
            });
         }
      } catch (error) {
         toaster.error({
            title: 'Export Failed',
            description: error instanceof Error ? error.message : 'Unknown error occurred',
            duration: 5000
         });
      } finally {
         setIsExporting(false);
      }
   };

   const handleClearDatabase = async () => {
      setIsClearing(true);
      try {
         // First export the data
         await handleExport();

         // Wait a bit for downloads to start
         await new Promise(resolve => setTimeout(resolve, 1000));

         // Then clear the database
         await clearDatabaseAndReload();
      } catch (error) {
         toaster.error({
            title: 'Failed to Clear Database',
            description: error instanceof Error ? error.message : 'Unknown error occurred',
            duration: 5000
         });
         setIsClearing(false);
      }
   };

   const handleClose = () => {
      setShowConfirmation(false);
      dialog.setOpen(false);
   };

   return (
      <Dialog.RootProvider value={dialog}>
         <Dialog.Root
            size="lg"
            placement="center"
            closeOnInteractOutside={false}
            motionPreset="slide-in-bottom"
         >
            <Dialog.Trigger asChild>
               {trigger ?? (
                  <Button variant="ghost" _hover={{ color: 'accent' }} borderRadius="lg">
                     <DatabaseIcon />
                     Database
                  </Button>
               )}
            </Dialog.Trigger>
            <Portal>
               <Dialog.Backdrop />
               <Dialog.Positioner>
                  <Dialog.Content>
                     <Dialog.Header>
                        <Dialog.Title>
                           <Box display="flex" alignItems="center" gap={2}>
                              <DatabaseIcon />
                              Database Management
                           </Box>
                        </Dialog.Title>
                     </Dialog.Header>

                     <Dialog.Body>
                        {!showConfirmation ? (
                           <VStack align="stretch" gap={6}>
                              <Box>
                                 <Heading size="sm" mb={2}>
                                    Export Database
                                 </Heading>
                                 <Text fontSize="sm" mb={4}>
                                    Download all your data as CSV files. This includes submissions, courses,
                                    schedules, and all other stored information.
                                 </Text>
                                 <Button
                                    onClick={handleExport}
                                    loading={isExporting}
                                    variant="outline"
                                    colorPalette={'blue'}
                                    width="full"
                                 >
                                    <DownloadIcon />
                                    Export Data as CSV
                                 </Button>
                              </Box>

                              <Box
                                 p={4}
                                 borderRadius="md"
                                 borderWidth={1}
                                 borderColor={'orange'}
                                 colorPalette={'orange'}
                              >
                                 <Box display="flex" alignItems="start" gap={2} mb={3}>
                                    <WarningIcon color='orange' />
                                    <Heading size="sm" color="orange" >
                                       Danger Zone
                                    </Heading>
                                 </Box>
                                 <Text fontSize="sm" mb={4}>
                                    Clear all local data and reset the database. This action will:
                                 </Text>
                                 <VStack align="start" fontSize="sm" gap={1} mb={4}>
                                    <Text>• Export your data as CSV files first</Text>
                                    <Text>• Delete all local database information</Text>
                                    <Text>• Reload the page with a fresh database</Text>
                                    <Text fontWeight="semibold">• This action cannot be undone!</Text>
                                 </VStack>
                                 <Button
                                    onClick={() => setShowConfirmation(true)}
                                    variant="outline"
                                    width="full"
                                 >
                                    Clear Database
                                 </Button>
                              </Box>
                           </VStack>
                        ) : (
                           <VStack align="stretch" gap={4}>
                              <Box
                                 p={6}
                                 borderRadius="md"
                                 borderWidth={2}
                              >
                                 <Box display="flex" alignItems="center" gap={2} mb={3}>
                                    <WarningIcon size={24} color="red" />
                                    <Heading size="md" color="red.700">
                                       Are you absolutely sure?
                                    </Heading>
                                 </Box>
                                 <Text fontSize="sm" mb={4}>
                                    This will export your data and then permanently delete your local database.
                                    You will need to set everything up again from scratch.
                                 </Text>
                                 <Text fontSize="sm" fontWeight="bold">
                                    This action is irreversible!
                                 </Text>
                              </Box>

                              <Stack direction="row" gap={3} width="full">
                                 <Button
                                    onClick={() => setShowConfirmation(false)}
                                    variant="outline"
                                    flex={1}
                                    disabled={isClearing}
                                 >
                                    Cancel
                                 </Button>
                                 <Button
                                    onClick={handleClearDatabase}
                                    loading={isClearing}
                                    colorPalette="red"
                                    flex={1}
                                 >
                                    {isClearing ? 'Clearing...' : 'Yes, Clear Database'}
                                 </Button>
                              </Stack>
                           </VStack>
                        )}
                     </Dialog.Body>

                     {!showConfirmation && (
                        <Dialog.Footer gap={3}>
                           <Dialog.ActionTrigger asChild>
                              <Button variant="outline" onClick={handleClose}>
                                 Close
                              </Button>
                           </Dialog.ActionTrigger>
                        </Dialog.Footer>
                     )}

                     <Dialog.CloseTrigger asChild>
                        <CloseButton size="sm" />
                     </Dialog.CloseTrigger>
                  </Dialog.Content>
               </Dialog.Positioner>
            </Portal>
         </Dialog.Root>
      </Dialog.RootProvider>
   );
}
