import {
   createListCollection,
   HStack,
   Portal,
   Select,
   Slider,
   Switch,
   VStack,
} from "@chakra-ui/react";
import { AsyncSelect, type GroupBase } from "chakra-react-select";
import { useQueryClient } from "@tanstack/react-query";
import { useSalaryTableStore } from "./Store.ts";
import { useForm } from "@tanstack/react-form";
import { HiCheck, HiX } from "react-icons/hi";
import { asyncComponents } from "@/components/common";
import {
   getV1AutocompleteCompanyOptions,
   getV1AutocompleteLocationOptions,
   getV1AutocompletePositionOptions,
   type GetV1SubmissionsData,
} from "@/client";
import { coopCycle, coopYear, programLevel } from "@/helpers";

type AutocompleteOptions = {
   value: string;
   label: string;
   variant: string;
};

const ConvertMapFunc = (
   value: string | { name: string } | undefined,
): AutocompleteOptions => ({
   value: typeof value === "string" ? value : value?.name || "",
   label: typeof value === "string" ? value : value?.name || "",
   variant: "subtle",
});

export default () => {
   const Route = useSalaryTableStore(({ Route }) => Route);
   const query = Route.useSearch();
   const queryClient = useQueryClient();
   const navigate = Route.useNavigate();
   const min = 2016;
   const max = new Date().getFullYear();
   const marks = Array.from(
      { length: max - min + 1 },
      (_, i) => ({ value: i + min, label: i % 4 === 0 ? i + min : "" }),
   );

   const defaultValues: GetV1SubmissionsData["query"] = {
      company: [...((query?.company!) ? query?.company : [])],
      position: [...((query?.position!) ? query?.position : [])],
      location: [...((query?.location!) ? query?.location : [])],
      year: [...((query?.year!) ? query?.year : [])],
      coop_cycle: [...((query?.coop_cycle!) ? query?.coop_cycle : [])],
      coop_year: [...((query?.coop_year!) ? query?.coop_year : [])],
      program_level: query?.program_level!,
      distinct: true,
   };

   const form = useForm({ defaultValues });

   return (
      <form>
         <VStack width="full">
            <HStack mb={2} w="full" gap={5}>
               <form.Field
                  name="company"
                  listeners={{
                     onChange: ({ value: company }) =>
                        navigate({
                           search: (prev) => ({
                              ...prev,
                              pageIndex: 1,
                              company,
                           }),
                           reloadDocument: false,
                           replace: true,
                           startTransition: true,
                        }),
                  }}
               >
                  {({ state, handleChange, handleBlur }) => (
                     <AsyncSelect<
                        AutocompleteOptions,
                        true,
                        GroupBase<AutocompleteOptions>
                     >
                        isMulti
                        name="company"
                        placeholder="Select a company"
                        value={state.value?.map(ConvertMapFunc)}
                        components={asyncComponents}
                        onBlur={handleBlur}
                        onChange={(values) =>
                           handleChange(values.map(({ value }) => value))}
                        noOptionsMessage={() =>
                           "Keeping typing for autocomplete"}
                        loadOptions={(inputValue, callback) => {
                           const query = { comp: inputValue };
                           if (inputValue?.length >= 3) {
                              queryClient
                                 .ensureQueryData(
                                    getV1AutocompleteCompanyOptions({ query }),
                                 )
                                 .then((data) =>
                                    callback(data?.map(ConvertMapFunc) || [])
                                 )
                                 .catch(() => callback([]));
                           }
                        }}
                     />
                  )}
               </form.Field>
               <form.Field
                  name="position"
                  listeners={{
                     onChange: ({ value: position }) => navigate({
                        search: (prev) => ({ ...prev, pageIndex: 1, position }),
                        reloadDocument: false,
                        replace: true,
                        startTransition: true,
                     }),
                  }}
               >
                  {({ state, handleChange, handleBlur }) => (
                     <AsyncSelect<
                        AutocompleteOptions,
                        true,
                        GroupBase<AutocompleteOptions>
                     >
                        isMulti
                        name="position"
                        placeholder="Select a position"
                        value={state.value?.map(ConvertMapFunc)}
                        components={asyncComponents}
                        onBlur={handleBlur}
                        onChange={(values) =>
                           handleChange(values.map(({ value }) => value))}
                        noOptionsMessage={() =>
                           "Keeping typing for autocomplete"}
                        loadOptions={(inputValue, callback) => {
                           const query = { comp: "*", pos: inputValue };
                           if (inputValue?.length >= 3) {
                              queryClient
                                 .ensureQueryData(
                                    getV1AutocompletePositionOptions({ query }),
                                 )
                                 .then((data) =>
                                    callback(data?.map(ConvertMapFunc) || [])
                                 )
                                 .catch(() => callback([]));
                           }
                        }}
                     />
                  )}
               </form.Field>

               <form.Field
                  name="location"
                  listeners={{
                     onChange: ({ value: location }) => navigate({
                        search: (prev) => ({ ...prev, pageIndex: 1, location }),
                        reloadDocument: false,
                        replace: true,
                        startTransition: true,
                     }),
                  }}
               >
                  {({ state, handleChange, handleBlur }) => (
                     <AsyncSelect<
                        AutocompleteOptions,
                        true,
                        GroupBase<AutocompleteOptions>
                     >
                        isMulti
                        name="location"
                        placeholder="Select a location"
                        value={state.value?.map(ConvertMapFunc)}
                        components={asyncComponents}
                        onBlur={handleBlur}
                        onChange={(values) =>
                           handleChange(values.map(({ value }) => value))}
                        noOptionsMessage={() =>
                           "Keeping typing for autocomplete"}
                        loadOptions={(inputValue, callback) => {
                           const query = { loc: inputValue };
                           if (inputValue?.length >= 3) {
                              queryClient
                                 .ensureQueryData(
                                    getV1AutocompleteLocationOptions({ query }),
                                 )
                                 .then((data) =>
                                    callback(data?.map(ConvertMapFunc) || [])
                                 )
                                 .catch(() => callback([]));
                           }
                        }}
                     />
                  )}
               </form.Field>
               <form.Field
                  name="distinct"
                  listeners={{
                     onChange: ({ value: distinct }) => {
                        navigate({
                           search: (prev) => ({
                              ...prev,
                              pageIndex: 1,
                              distinct,
                           }),
                           reloadDocument: false,
                           replace: true,
                           startTransition: true,
                        });
                     },
                  }}
               >
                  {({ state, handleChange }) => (
                     <Switch.Root
                        size="lg"
                        checked={state.value}
                        onCheckedChange={({ checked }) => handleChange(checked)}
                     >
                        <Switch.HiddenInput />
                        <Switch.Control>
                           <Switch.Thumb>
                              <Switch.ThumbIndicator
                                 fallback={<HiX color="black" />}
                              >
                                 <HiCheck />
                              </Switch.ThumbIndicator>
                           </Switch.Thumb>
                        </Switch.Control>
                        <Switch.Label>Distinct</Switch.Label>
                     </Switch.Root>
                  )}
               </form.Field>
            </HStack>
            <HStack mb={4} w="full" gap={5}>
               <form.Field
                  name="year"
                  listeners={{
                     onChange: ({ value: year }) => {
                        navigate({
                           search: (prev) => ({ ...prev, pageIndex: 1, year }),
                           reloadDocument: false,
                           replace: true,
                           startTransition: true,
                        });
                     },
                  }}
               >
                  {({ state, handleChange }) => (
                     <Slider.Root
                        width="full"
                        value={state.value}
                        onValueChange={({ value }) => handleChange(value)}
                        min={min}
                        max={max}
                        minStepsBetweenThumbs={2}
                        step={1}
                        colorPalette="cyan"
                     >
                        <Slider.Label>Year</Slider.Label>
                        <Slider.Control>
                           <Slider.Track>
                              <Slider.Range />
                           </Slider.Track>
                           <Slider.Thumb index={0}>
                              <Slider.DraggingIndicator
                                 layerStyle="fill.solid"
                                 top="6"
                                 rounded="sm"
                                 px="1.5"
                              >
                                 {}
                              </Slider.DraggingIndicator>
                           </Slider.Thumb>
                           <Slider.Thumb index={1}>
                              <Slider.DraggingIndicator
                                 layerStyle="fill.solid"
                                 top="6"
                                 rounded="sm"
                                 px="1.5"
                              >
                                 {state!.value![1]}
                              </Slider.DraggingIndicator>
                           </Slider.Thumb>
                           <Slider.Marks marks={marks} />
                        </Slider.Control>
                     </Slider.Root>
                  )}
               </form.Field>
               <form.Field
                  name="coop_year"
                  listeners={{
                     onChange: ({ value: coopYear }) => {
                        navigate({
                           search: (prev) => ({
                              ...prev,
                              pageIndex: 1,
                              coopYear,
                           }),
                           reloadDocument: false,
                           replace: true,
                           startTransition: true,
                        });
                     },
                  }}
               >
                  {({ state, handleChange }) => (
                     <Select.Root
                        value={state?.value}
                        multiple
                        //@ts-ignore: shut up
                        onValueChange={({ value }) => handleChange(value)}
                        collection={coopYearCollection}
                     >
                        <Select.HiddenSelect />
                        <Select.Label>Coop Year</Select.Label>
                        <Select.Control>
                           <Select.Trigger>
                              <Select.ValueText placeholder="Select coop year" />
                           </Select.Trigger>
                           <Select.IndicatorGroup>
                              <Select.ClearTrigger />
                              <Select.Indicator />
                           </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                           <Select.Positioner>
                              <Select.Content>
                                 {coopYearCollection
                                    .items
                                    .map((level) => (
                                       <Select.Item
                                          item={level}
                                          key={level.value}
                                       >
                                          {level.label}
                                          <Select.ItemIndicator />
                                       </Select.Item>
                                    ))}
                              </Select.Content>
                           </Select.Positioner>
                        </Portal>
                     </Select.Root>
                  )}
               </form.Field>
               <form.Field
                  name="coop_cycle"
                  listeners={{
                     onChange: ({ value: coopCycle }) => {
                        navigate({
                           search: (prev) => ({
                              ...prev,
                              pageIndex: 1,
                              coopCycle,
                           }),
                           reloadDocument: false,
                           replace: true,
                           startTransition: true,
                        });
                     },
                  }}
               >
                  {({ state, handleChange }) => (
                     <Select.Root
                        value={state?.value}
                        //@ts-ignore: shut up
                        onValueChange={({ value }) => handleChange(value)}
                        collection={coopCycleCollection}
                        multiple
                     >
                        <Select.HiddenSelect />
                        <Select.Label>Coop Cycle</Select.Label>
                        <Select.Control>
                           <Select.Trigger>
                              <Select.ValueText placeholder="Select coop cycle" />
                           </Select.Trigger>
                           <Select.IndicatorGroup>
                              <Select.ClearTrigger />
                              <Select.Indicator />
                           </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                           <Select.Positioner>
                              <Select.Content>
                                 {coopCycleCollection
                                    .items
                                    .map((level) => (
                                       <Select.Item
                                          item={level}
                                          key={level.value}
                                       >
                                          {level.label}
                                          <Select.ItemIndicator />
                                       </Select.Item>
                                    ))}
                              </Select.Content>
                           </Select.Positioner>
                        </Portal>
                     </Select.Root>
                  )}
               </form.Field>

               <form.Field
                  name="program_level"
                  listeners={{
                     onChange: ({ value: program_level }) => {
                        navigate({
                           search: (prev) => ({
                              ...prev,
                              pageIndex: 1,
                              program_level,
                           }),
                           reloadDocument: false,
                           replace: true,
                           startTransition: true,
                        });
                     },
                  }}
               >
                  {({ state, handleChange }) => (
                     <Select.Root
                        value={[state?.value!]}
                        //@ts-ignore: shut up
                        onValueChange={({ value: [change] }) =>
                           handleChange(change!)}
                        collection={programLevelCollection}
                     >
                        <Select.HiddenSelect />
                        <Select.Label>Program Level</Select.Label>
                        <Select.Control>
                           <Select.Trigger>
                              <Select.ValueText />
                           </Select.Trigger>
                           <Select.IndicatorGroup>
                              <Select.Indicator />
                           </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                           <Select.Positioner>
                              <Select.Content>
                                 {programLevelCollection
                                    .items
                                    .map((level) => (
                                       <Select.Item
                                          item={level}
                                          key={level.value}
                                       >
                                          {level.label}
                                          <Select.ItemIndicator />
                                       </Select.Item>
                                    ))}
                              </Select.Content>
                           </Select.Positioner>
                        </Portal>
                     </Select.Root>
                  )}
               </form.Field>
            </HStack>
         </VStack>
      </form>
   );
};

const coopCycleCollection = createListCollection({
   items: coopCycle.map((value) => ({ label: value, value })),
});

const coopYearCollection = createListCollection({
   items: coopYear.map((value) => ({ label: value, value })),
});

const programLevelCollection = createListCollection({
   items: programLevel.map((value) => ({ label: value, value })),
});
