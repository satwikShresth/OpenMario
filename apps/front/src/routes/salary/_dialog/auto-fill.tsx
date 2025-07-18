import { Box, Button, ButtonGroup, Steps } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { CloseButton, Dialog } from '@chakra-ui/react';
import { useState } from 'react';

export const Route = createFileRoute('/salary/_dialog/auto-fill')({
   component: () => {
      const [step, setStep] = useState(1);
      return (
         <>
            <Dialog.Header>
               <Dialog.Title>Dialog Title</Dialog.Title>
               <Dialog.CloseTrigger asChild p={2} m={3}>
                  <CloseButton size='sm' variant='solid' />
               </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
               <Steps.Root
                  step={step}
                  onStepChange={(e) => setStep(e.step)}
                  count={steps.length}
               >
                  <Steps.List>
                     {steps.map((step, index) => (
                        <Steps.Item key={index} index={index} title={step.title}>
                           <Steps.Indicator />
                           <Box>
                              <Steps.Title>{step.title}</Steps.Title>
                              <Steps.Description>{step.description}</Steps.Description>
                           </Box>
                           <Steps.Separator />
                        </Steps.Item>
                     ))}
                  </Steps.List>

                  {steps.map((step, index) => (
                     <Steps.Content key={index} index={index}>
                        <step.content />
                     </Steps.Content>
                  ))}
                  <Steps.CompletedContent>All steps are complete!</Steps.CompletedContent>

                  <ButtonGroup size='sm' variant='outline'>
                     <Steps.PrevTrigger asChild>
                        <Button>Prev</Button>
                     </Steps.PrevTrigger>
                     <Steps.NextTrigger asChild>
                        <Button>Next</Button>
                     </Steps.NextTrigger>
                  </ButtonGroup>
               </Steps.Root>
            </Dialog.Body>
         </>
      );
   },
});

const stepOne = () => (
   <>
      Step 1 content
   </>
);
const stepTwo = () => (
   <>
      Step 1 content
   </>
);
const stepThree = () => (
   <>
      Step 1 content
   </>
);

const steps = [
   {
      title: 'Step 1',
      content: stepOne,
      description: 'This step',
   },
   {
      title: 'Step 2',
      content: stepTwo,
      description: 'That step',
   },
   {
      title: 'Step 3',
      content: stepThree,
      description: 'Final step',
   },
];
