import { Box, Button, ButtonGroup, Container, Steps } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { CloseButton, Dialog } from '@chakra-ui/react';
import { Salary } from '@/components/Salary';
import { Link, linkOptions } from '@tanstack/react-router';

export const Route = createFileRoute('/salary/_dialog/auto-fill')({
   component: () => {
      const form = Salary.AutoFill.Fields.useAppForm({
         defaultValues: Salary.AutoFill.Fields.defaultValues,
      });

      return (
         <Container>
            <Dialog.Header>
               <Dialog.Title fontWeight='bold' fontSize='2xl'>
                  AutoFill
               </Dialog.Title>
               <Dialog.CloseTrigger m={2} asChild>
                  <CloseButton size='sm' variant='surface' />
               </Dialog.CloseTrigger>
            </Dialog.Header>
            <form.Subscribe selector={(state) => [state.values.canPrev, state.values.canFinish]}>
               {([canPrev, canFinish]) => (
                  <form.Field name='step'>
                     {({ state, handleBlur, handleChange }) => (
                        <Steps.Root
                           step={state.value}
                           onBlur={handleBlur}
                           onStepChange={(e) => handleChange(e.step)}
                           count={Salary.AutoFill.Steps.length}
                        >
                           <Dialog.Body>
                              <Steps.List>
                                 {Salary.AutoFill.Steps.map((step, index) => (
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

                              {Salary.AutoFill.Steps.map((Step, index) => (
                                 <Steps.Content key={index} index={index}>
                                    <Step.Content form={form} />
                                 </Steps.Content>
                              ))}
                           </Dialog.Body>
                           <Dialog.Footer>
                              <ButtonGroup size='sm' variant='outline'>
                                 <Steps.PrevTrigger disabled={!canPrev} asChild>
                                    <Button>Prev</Button>
                                 </Steps.PrevTrigger>
                                 {canFinish
                                    ? (
                                       <Steps.NextTrigger asChild>
                                          <Button
                                             variant='solid'
                                             colorPalette='green'
                                             as={Link}
                                             {...linkOptions({ to: '/salary/drafts' })}
                                          >
                                             Finish
                                          </Button>
                                       </Steps.NextTrigger>
                                    )
                                    : null}
                              </ButtonGroup>
                           </Dialog.Footer>
                        </Steps.Root>
                     )}
                  </form.Field>
               )}
            </form.Subscribe>
         </Container>
      );
   },
});
