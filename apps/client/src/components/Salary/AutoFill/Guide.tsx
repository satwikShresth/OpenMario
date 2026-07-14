import {
   Box,
   Button,
   Code,
   Flex,
   Heading,
   Icon,
   Link as CLink,
   List,
   Separator,
   Stack,
   Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { CheckIcon, ClipboardIcon } from '@/components/icons'

const MCP_URL = 'https://mcp.openmario.com'
const REPORT_LINK_API = 'https://mcp.openmario.com/api/salary/report-link'

const MCP_AI_PROMPT = `I have co-op offer(s) to report on OpenMario.

Paste / describe each offer below (company, position, location as "City, ST", hourly pay, hours, year, coop year 1st|2nd|3rd, cycle Fall/Winter|Winter/Spring|Spring/Summer|Summer/Fall, Undergraduate|Graduate):

[PASTE YOUR OFFERS HERE]

Use the OpenMario MCP tools:
1. get_salary_form_guide
2. autocomplete_company / autocomplete_position / autocomplete_location for exact names (do not invent)
3. generate_salary_report_link with a full offers JSON array
4. Reply with openmario_salary_url as a clickable markdown link

Rules:
- Prefer one batch link for all offers
- Multiple offers import as drafts on OpenMario; one offer prefills the report form
- Never claim you submitted salaries — I must open the link and confirm`

const API_AI_PROMPT = `I have co-op offer(s) to report on OpenMario (no MCP required).

Paste / describe each offer below:

[PASTE YOUR OFFERS HERE]

Workflow:
1. Normalize each offer into this JSON shape:
{
  "company": "string 3–100",
  "position": "string 3–100",
  "location": "City, ST",
  "compensation": 0,
  "work_hours": 40,
  "year": 2026,
  "coop_year": "1st" | "2nd" | "3rd",
  "coop_cycle": "Fall/Winter" | "Winter/Spring" | "Spring/Summer" | "Summer/Fall",
  "program_level": "Undergraduate" | "Graduate",
  "other_compensation": "",
  "details": ""
}

2. POST the payload to ${REPORT_LINK_API}
   Body: { "offers": [ … ] }
   Optional: "common" for shared year / coop_year / coop_cycle / program_level / work_hours
   Headers: Content-Type: application/json

3. From the JSON response, present openmario_salary_url as a clickable markdown link.

Rules:
- Prefer exact real company / position / "City, ST" names
- One offer → prefills the form; multiple → import as drafts
- Never claim you submitted salaries — I must open the link and confirm`

function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
   const [copied, setCopied] = useState(false)

   return (
      <Button
         size='sm'
         variant='outline'
         onClick={async () => {
            try {
               await navigator.clipboard.writeText(value)
               setCopied(true)
               window.setTimeout(() => setCopied(false), 1500)
            } catch {
               /* ignore */
            }
         }}
      >
         <Icon as={copied ? CheckIcon : ClipboardIcon} boxSize={3.5} />
         {copied ? 'Copied' : label}
      </Button>
   )
}

function Snippet({ value }: { value: string }) {
   return (
      <Box
         borderWidth='1px'
         borderColor='border'
         borderRadius='md'
         bg='bg.subtle'
         overflow='hidden'
      >
         <Flex
            align='center'
            justify='flex-end'
            px={3}
            py={2}
            borderBottomWidth='1px'
            borderColor='border'
         >
            <CopyButton value={value} />
         </Flex>
         <Box as='pre' m={0} px={4} py={3} overflowX='auto' fontSize='sm' lineHeight='1.6'>
            <Code bg='transparent' whiteSpace='pre' display='block'>
               {value}
            </Code>
         </Box>
      </Box>
   )
}

export default function AutoFillGuide() {
   return (
      <Stack gap={8} maxW='3xl'>
         <Stack gap={2}>
            <Heading size='lg'>AI AutoFill</Heading>
            <Text color='fg.muted'>
               Copy either AI prompt, paste your offers, and open the link it returns. One offer
               prefills the form; multiple offers become drafts.
            </Text>
         </Stack>

         <Stack gap={3}>
            <Heading size='md'>Option 1 — AI with OpenMario MCP</Heading>
            <Text textStyle='sm' color='fg.muted'>
               Best in Cursor, Claude, or any client with the OpenMario MCP server. Install steps
               on the{' '}
               <CLink asChild colorPalette='blue'>
                  <Link to='/mcp'>MCP page</Link>
               </CLink>
               .
            </Text>
            <Text textStyle='sm' fontWeight='medium'>
               MCP config
            </Text>
            <Snippet
               value={`{\n  "mcpServers": {\n    "openmario": {\n      "url": "${MCP_URL}"\n    }\n  }\n}`}
            />
            <Text textStyle='sm' fontWeight='medium'>
               AI prompt
            </Text>
            <Snippet value={MCP_AI_PROMPT} />
            <List.Root gap={1} ps={4} textStyle='sm' color='fg.muted'>
               <List.Item>AI resolves names with autocomplete_* tools</List.Item>
               <List.Item>
                  AI calls <Code>generate_salary_report_link</Code> → share URL
               </List.Item>
               <List.Item>You open the link to autofill or import drafts</List.Item>
            </List.Root>
         </Stack>

         <Separator />

         <Stack gap={3}>
            <Heading size='md'>Option 2 — AI with the encode API (no MCP)</Heading>
            <Text textStyle='sm' color='fg.muted'>
               For ChatGPT, Gemini, or any model that can call HTTP. Paste this prompt; the AI
               builds offer JSON and <Code>POST</Code>s it to{' '}
               <Code>{REPORT_LINK_API}</Code>.
            </Text>
            <Text textStyle='sm' fontWeight='medium'>
               AI prompt
            </Text>
            <Snippet value={API_AI_PROMPT} />
            <List.Root gap={1} ps={4} textStyle='sm' color='fg.muted'>
               <List.Item>AI normalizes your offers into OpenMario JSON</List.Item>
               <List.Item>
                  AI calls the encode API → <Code>openmario_salary_url</Code>
               </List.Item>
               <List.Item>You open the link the same way as Option 1</List.Item>
            </List.Root>
         </Stack>

         <Separator />

         <Stack gap={3}>
            <Heading size='md'>After you get the link</Heading>
            <List.Root gap={2} ps={4} textStyle='sm'>
               <List.Item>
                  <Text as='span' fontWeight='medium'>
                     One offer
                  </Text>
                  {' — '}
                  opens Report Salary with the form prefilled. Submit when ready.
               </List.Item>
               <List.Item>
                  <Text as='span' fontWeight='medium'>
                     Multiple offers
                  </Text>
                  {' — '}
                  all are saved as drafts and you are taken to{' '}
                  <CLink asChild colorPalette='blue'>
                     <Link to='/salary/drafts'>Drafts</Link>
                  </CLink>{' '}
                  to review and submit each one.
               </List.Item>
            </List.Root>
            <Flex gap={2} flexWrap='wrap' pt={1}>
               <Button asChild colorPalette='blue'>
                  <Link to='/salary/report'>Open report form</Link>
               </Button>
               <Button asChild variant='outline'>
                  <Link to='/salary/drafts'>View drafts</Link>
               </Button>
               <Button asChild variant='ghost'>
                  <Link to='/mcp'>MCP setup</Link>
               </Button>
            </Flex>
         </Stack>
      </Stack>
   )
}
