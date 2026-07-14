import {
   DatePicker,
   Portal,
   parseDate,
   type DateValue,
} from '@chakra-ui/react'
import { useMemo } from 'react'

type FallYearPickerProps = {
   fallYear: number
   onChange: (year: number) => void
}

const YEAR_MIN = 2000
const YEAR_MAX = 2040

const formatYear = (date: DateValue) => date.year.toString()

const parseYear = (string: string | undefined) => {
   if (string === '' || !string) return
   const year = Number(string)
   if (!Number.isFinite(year)) return
   if (year < 100) {
      const currentYear = new Date().getFullYear()
      const currentCentury = Math.floor(currentYear / 100) * 100
      return parseDate(`${currentCentury + year}-01-01`)
   }
   return parseDate(`${year}-01-01`)
}

/** Compact Fall start year control for an academic year row. */
export function FallYearPicker({ fallYear, onChange }: FallYearPickerProps) {
   const value = useMemo(() => [parseDate(`${fallYear}-01-01`)], [fallYear])

   return (
      <DatePicker.Root
         size='xs'
         width='auto'
         variant='subtle'
         openOnClick
         format={formatYear}
         parse={parseYear}
         defaultView='year'
         minView='year'
         placeholder='yyyy'
         value={value}
         min={parseDate(`${YEAR_MIN}-01-01`)}
         max={parseDate(`${YEAR_MAX}-01-01`)}
         onValueChange={({ value: next }) => {
            const year = next[0]?.year
            if (year != null && year !== fallYear) onChange(year)
         }}
      >
         <DatePicker.Control>
            <DatePicker.Input
               aria-label='Fall start year'
               w='3.5rem'
               flex='none'
               px='2'
               textAlign='center'
               textStyle='xs'
               fontWeight='medium'
            />
         </DatePicker.Control>
         <Portal>
            <DatePicker.Positioner>
               <DatePicker.Content>
                  <DatePicker.View view='year'>
                     <DatePicker.Header />
                     <DatePicker.YearTable />
                  </DatePicker.View>
               </DatePicker.Content>
            </DatePicker.Positioner>
         </Portal>
      </DatePicker.Root>
   )
}
