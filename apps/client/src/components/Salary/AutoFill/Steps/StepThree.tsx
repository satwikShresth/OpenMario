import {
   Badge,
   Box,
   FileUpload,
   Flex,
   HStack,
   Image,
   Progress,
   Separator,
   Text,
   useFileUpload,
} from '@chakra-ui/react';
import { useJobParser, useTesseract } from '@/hooks';
import { useSalaryStore } from '../../Store.ts';
import { useStore } from '@tanstack/react-form';
import { useCallback, useState } from 'react';
import { FaUpload } from 'react-icons/fa';

export default ({ form }: any) => {
   const [progress, setProgress] = useState(0);
   const [processing, setProcessing] = useState(false);
   const [max, setMax] = useState(0);
   const [fileLog, setFileLog] = useState('');
   const { recognizeText } = useTesseract();
   const { processText } = useJobParser();
   const actions = useSalaryStore(({ actions }) => actions);
   const commonData = useStore(
      form.store,
      //@ts-ignore: shutup
      ({ values: { program_level, year, coop_cycle, coop_round, coop_year } }) => ({
         program_level,
         year,
         coop_cycle,
         coop_round,
         coop_year,
      }),
   );

   const processFile = useCallback(
      async (file: File, common: any) => {
         if (!file) return;
         try {
            setFileLog('Extracting text from image...');
            const text = await recognizeText(file);

            const processedJobs = processText(text, common);

            processedJobs.forEach((job) => {
               actions.addDraftSubmission({
                  company: job.company || '',
                  position: job.position || '',
                  location: job.location || '',
                  program_level: job.program_level || 'Undergraduate',
                  work_hours: job.work_hours! || 40,
                  coop_cycle: job.coop_cycle || 'Fall/Winter',
                  coop_year: job.coop_year || '1st',
                  year: job.year || new Date().getFullYear(),
                  compensation: job.compensation
                     ? parseFloat(String(job.compensation).replace('$', ''))
                     : 10,
                  other_compensation: job.other_compensation || '',
                  details: `Employer ID: ${job.employer_id || 'N/A'}, Position ID: ${
                     job.position_id || 'N/A'
                  }, Job Length: ${job.job_length || 'N/A'}, Coop Round: ${
                     job.coop_round || 'N/A'
                  }`,
               });
            });

            if (processedJobs.length > 0) {
               setFileLog(`Successfully added ${processedJobs.length} jobs as drafts`);
               console.log(`${processedJobs.length} jobs added as drafts`);
            } else {
               setFileLog('No jobs detected in the uploaded file');
               console.log('No jobs detected in the uploaded file');
            }
         } catch (error: any) {
            setFileLog(`Error: ${error.message}`);
            console.error(`Error: ${error.message}`);
         }
      },
      [actions, recognizeText, processText, setFileLog, setProgress],
   );

   const fileUpload = useFileUpload({
      maxFiles: 5,
      accept: 'image/*',
      onFileAccept: async ({ files }) => {
         setProcessing(true);
         setProgress(0);
         setMax(files.length); // 3 steps per file: extract text, process data, add to drafts

         await Promise.all(
            files.map(async (file) => {
               await processFile(file, commonData);
               setProgress((prev) => prev + 1);
            }),
         );

         setFileLog('Processing complete!');

         // Clear the completion message after a short delay
         setTimeout(() => {
            setFileLog('');
            setProcessing(false);
         }, 2000);
         form.setFieldValue('canFinish', () => true);
      },
   });

   return (
      <Box>
         {/* Instructions */}
         <Text
            textAlign='center'
            fontWeight='semibold'
            fontSize='lg'
            mt={10}
            mb={6}
         >
            *Make sure your screenshot contains only the rankings between both{' '}
            <Image
               src='/return.jpg'
               display='inline'
               verticalAlign='middle'
            />{' '}
            buttons
         </Text>

         {/* File Upload Component */}
         <FileUpload.RootProvider value={fileUpload}>
            <FileUpload.HiddenInput />

            <FileUpload.Dropzone
               border='2px dashed'
               borderRadius='lg'
               width='full'
               p={8}
               mb={4}
            >
               <Box mb={4}>
                  <FaUpload size={40} />
               </Box>
               <FileUpload.DropzoneContent>
                  <Text
                     fontWeight='medium'
                     fontSize='lg'
                     mb={2}
                     textAlign='center'
                  >
                     Drag and drop an image here or click to browse
                  </Text>
                  <Text fontSize='sm' textAlign='center'>
                     Supported formats: JPG, PNG, GIF (Max 5MB)
                  </Text>
               </FileUpload.DropzoneContent>
            </FileUpload.Dropzone>

            {/* File List */}
            <FileUpload.ItemGroup>
               <FileUpload.Context>
                  {({ acceptedFiles }) =>
                     acceptedFiles.length > 0
                        ? processing
                           ? (
                              <Progress.Root width='full' max={max} value={progress}>
                                 <Progress.Label mb={2}>
                                    <HStack justify='space-between'>
                                       <Text fontSize='sm'>
                                          {fileLog}
                                       </Text>
                                       <Badge colorScheme='blue' variant='outline' size='sm'>
                                          {progress}/{max}
                                       </Badge>
                                    </HStack>
                                 </Progress.Label>
                                 <Progress.Track>
                                    <Progress.Range />
                                 </Progress.Track>
                              </Progress.Root>
                           )
                           : (
                              <Box>
                                 <Text fontWeight='bold' fontSize='lg'>Processed Files</Text>
                                 <Separator mt={2} mb={2} />
                                 {acceptedFiles.map((file) => (
                                    <Flex wrap='wrap' gap={2}>
                                       <FileUpload.Item
                                          key={file.name}
                                          file={file}
                                          borderRadius='lg'
                                          m={1}
                                          display='flex'
                                          alignItems='center'
                                          justifyContent='space-between'
                                       >
                                          <Box display='flex' alignItems='center' flex={1}>
                                             <Box mr={3}>
                                                <FaUpload size={20} />
                                             </Box>
                                             <Box>
                                                <FileUpload.ItemName fontWeight='medium' />
                                                <FileUpload.ItemSizeText fontSize='sm' />
                                             </Box>
                                          </Box>
                                       </FileUpload.Item>
                                    </Flex>
                                 ))}
                              </Box>
                           )
                        : null}
               </FileUpload.Context>
            </FileUpload.ItemGroup>
         </FileUpload.RootProvider>
      </Box>
   );
};
