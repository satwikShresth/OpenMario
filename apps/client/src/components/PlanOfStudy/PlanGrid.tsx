import {
   Button,
   createListCollection,
   Field,
   Flex,
   Grid,
   HStack,
   IconButton,
   Input,
   Popover,
   Portal,
   Select,
   Stack,
   Text,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { LuClipboard, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu'
import { toaster, Toaster } from '@/components/ui/toaster'
import { QuarterCell } from './QuarterCell'
import { FallYearPicker } from './FallYearPicker'
import { PlanCourseDndProvider } from './PlanCourseDnd'
import {
   academicYearCode,
   addYear,
   buildShareUrl,
   canRemoveYear,
   createPlan,
   deletePlan,
   quarterDisplayYear,
   removeYearAt,
   renamePlan,
   setActivePlanAsDefault,
   setYearFallYear,
   suggestPlanName,
   useActivePlan,
   usePlanLibrary,
   yearCourseCredits,
   yearLoadCredits,
} from '@/lib/plan-of-study'

export function PlanGrid() {
   const library = usePlanLibrary()
   const active = useActivePlan()
   const plan = active.plan
   const [copied, setCopied] = useState(false)
   const [renameOpen, setRenameOpen] = useState(false)
   const [renameValue, setRenameValue] = useState(active.name)
   const [newOpen, setNewOpen] = useState(false)
   const [newName, setNewName] = useState('')

   useEffect(() => {
      setRenameValue(active.name)
   }, [active.id, active.name])

   const planCollection = useMemo(
      () =>
         createListCollection({
            items: library.plans.map(p => ({
               label: p.name,
               value: p.id,
            })),
         }),
      [library.plans],
   )

   const handleCopyPlan = async () => {
      try {
         const url = buildShareUrl(plan, {
            action: 'create',
            name: active.name,
         })
         await navigator.clipboard.writeText(url)
         setCopied(true)
         toaster.create({ title: 'Plan link copied', type: 'success' })
         window.setTimeout(() => setCopied(false), 2000)
      } catch {
         toaster.create({ title: 'Could not copy plan', type: 'error' })
      }
   }

   const commitRename = () => {
      const trimmed = renameValue.trim()
      if (trimmed && trimmed !== active.name) {
         renamePlan(active.id, trimmed)
      } else {
         setRenameValue(active.name)
      }
      setRenameOpen(false)
   }

   const openNewPopover = (open: boolean) => {
      if (open) setNewName(suggestPlanName(library.plans.length))
      setNewOpen(open)
   }

   const createNamedPlan = () => {
      const name = newName.trim() || suggestPlanName(library.plans.length)
      createPlan({ name, makeDefault: true })
      setNewOpen(false)
   }

   return (
      <Stack gap="6" w="full" minW={0}>
         <Flex gap="3" wrap="wrap" align="center" justify="space-between">
               <HStack gap="2" flexWrap="wrap" flex="1" minW="0">
                  <Select.Root
                     size="sm"
                     width="12rem"
                     collection={planCollection}
                     value={[active.id]}
                     onValueChange={({ value }) => {
                        const id = value[0]
                        if (id) setActivePlanAsDefault(id)
                     }}
                     positioning={{ sameWidth: true }}
                  >
                     <Select.HiddenSelect />
                     <Select.Control>
                        <Select.Trigger>
                           <Select.ValueText placeholder="Plan" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                           <Select.Indicator />
                        </Select.IndicatorGroup>
                     </Select.Control>
                     <Portal>
                        <Select.Positioner>
                           <Select.Content>
                              {planCollection.items.map(item => (
                                 <Select.Item item={item} key={item.value}>
                                    {item.label}
                                    <Select.ItemIndicator />
                                 </Select.Item>
                              ))}
                           </Select.Content>
                        </Select.Positioner>
                     </Portal>
                  </Select.Root>

                  <Popover.Root
                     open={renameOpen}
                     onOpenChange={e => {
                        if (e.open) setRenameValue(active.name)
                        setRenameOpen(e.open)
                     }}
                     positioning={{ placement: 'bottom-start' }}
                  >
                     <Popover.Trigger asChild>
                        <IconButton size="sm" variant="ghost" aria-label="Rename plan">
                           <LuPencil />
                        </IconButton>
                     </Popover.Trigger>
                     <Portal>
                        <Popover.Positioner>
                           <Popover.Content w="16rem">
                              <Popover.Arrow />
                              <Popover.Body>
                                 <Stack gap="3">
                                    <Field.Root>
                                       <Field.Label>Rename plan</Field.Label>
                                       <Input
                                          size="sm"
                                          value={renameValue}
                                          onChange={e => setRenameValue(e.target.value)}
                                          autoFocus
                                          onKeyDown={e => {
                                             if (e.key === 'Enter') commitRename()
                                          }}
                                       />
                                    </Field.Root>
                                    <HStack justify="flex-end" gap="2">
                                       <Button
                                          size="xs"
                                          variant="ghost"
                                          onClick={() => setRenameOpen(false)}
                                       >
                                          Cancel
                                       </Button>
                                       <Button size="xs" colorPalette="blue" onClick={commitRename}>
                                          Save
                                       </Button>
                                    </HStack>
                                 </Stack>
                              </Popover.Body>
                           </Popover.Content>
                        </Popover.Positioner>
                     </Portal>
                  </Popover.Root>

                  <Popover.Root
                     open={newOpen}
                     onOpenChange={e => openNewPopover(e.open)}
                     positioning={{ placement: 'bottom-start' }}
                  >
                     <Popover.Trigger asChild>
                        <Button size="sm" variant="ghost">
                           <LuPlus />
                           New
                        </Button>
                     </Popover.Trigger>
                     <Portal>
                        <Popover.Positioner>
                           <Popover.Content w="16rem">
                              <Popover.Arrow />
                              <Popover.Body>
                                 <Stack gap="3">
                                    <Field.Root>
                                       <Field.Label>New plan</Field.Label>
                                       <Input
                                          size="sm"
                                          value={newName}
                                          onChange={e => setNewName(e.target.value)}
                                          autoFocus
                                          onKeyDown={e => {
                                             if (e.key === 'Enter') createNamedPlan()
                                          }}
                                       />
                                    </Field.Root>
                                    <HStack justify="flex-end" gap="2">
                                       <Button
                                          size="xs"
                                          variant="ghost"
                                          onClick={() => setNewOpen(false)}
                                       >
                                          Cancel
                                       </Button>
                                       <Button
                                          size="xs"
                                          colorPalette="blue"
                                          onClick={createNamedPlan}
                                       >
                                          Create
                                       </Button>
                                    </HStack>
                                 </Stack>
                              </Popover.Body>
                           </Popover.Content>
                        </Popover.Positioner>
                     </Portal>
                  </Popover.Root>

                  <IconButton
                     size="sm"
                     variant="ghost"
                     aria-label="Delete plan"
                     disabled={library.plans.length <= 1}
                     colorPalette="red"
                     onClick={() => deletePlan(active.id)}
                  >
                     <LuTrash2 />
                  </IconButton>
               </HStack>

               <HStack gap="2" flexWrap="wrap">
                  <Button size="sm" variant="outline" onClick={() => addYear()}>
                     <LuPlus />
                     Add year
                  </Button>
                  <Button
                     size="sm"
                     colorPalette="blue"
                     variant="subtle"
                     onClick={handleCopyPlan}
                  >
                     <LuClipboard />
                     {copied ? 'Copied' : 'Copy plan'}
                  </Button>
               </HStack>
            </Flex>

         <PlanCourseDndProvider>
            <Stack gap="6">
               {plan.years.map((year, yearIndex) => {
                  const academicYear = academicYearCode(year.fallYear)
                  const courseCr = yearCourseCredits(year)
                  const loadCr = yearLoadCredits(year)
                  const removable = plan.years.length > 1 && canRemoveYear(year)

                  return (
                     <Stack key={`${year.fallYear}-${yearIndex}`} gap="3">
                        <Flex justify="space-between" align="center" gap="3" wrap="wrap">
                           <HStack gap="2" flexWrap="wrap" align="center">
                              <HStack gap="1.5" align="center">
                                 <Text textStyle="sm" fontWeight="semibold" lineHeight="1">
                                    Year {yearIndex + 1}
                                 </Text>
                                 <FallYearPicker
                                    fallYear={year.fallYear}
                                    onChange={y => setYearFallYear(yearIndex, y)}
                                 />
                              </HStack>
                              <IconButton
                                 size="xs"
                                 variant="ghost"
                                 colorPalette="red"
                                 aria-label="Remove year"
                                 disabled={!removable}
                                 title={
                                    removable
                                       ? 'Remove this empty year'
                                       : 'Clear courses / reset modes before removing'
                                 }
                                 onClick={() => removeYearAt(yearIndex)}
                              >
                                 <LuTrash2 />
                              </IconButton>
                           </HStack>
                           <Text textStyle="xs" color="fg.muted">
                              {courseCr} cr
                              {loadCr !== courseCr ? ` · ${loadCr} with co-op` : ''}
                           </Text>
                        </Flex>

                        <Grid
                           templateColumns={{
                              base: '1fr',
                              md: '1fr 1fr',
                              xl: 'repeat(4, minmax(0, 1fr))',
                           }}
                           gap="1px"
                           borderWidth="1px"
                           borderColor="border.subtle"
                           borderRadius="l3"
                           overflow="hidden"
                           bg="border.subtle"
                           transition="border-color 120ms ease"
                           _hover={{ borderColor: 'border.emphasized' }}
                        >
                           {year.quarters.map(quarter => (
                              <QuarterCell
                                 key={quarter.term}
                                 quarter={quarter}
                                 yearIndex={yearIndex}
                                 displayYear={quarterDisplayYear(year.fallYear, quarter.term)}
                                 academicYear={academicYear}
                              />
                           ))}
                        </Grid>
                     </Stack>
                  )
               })}
            </Stack>
         </PlanCourseDndProvider>

         <Toaster />
      </Stack>
   )
}
