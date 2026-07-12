import { TOOL_LINKING_FOOTER } from './links';

export function textResult(data: unknown, label?: string) {
   const body = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
   const core = label ? `${label}\n\n${body}` : body;
   return {
      content: [
         {
            type: 'text' as const,
            text: `${core}${TOOL_LINKING_FOOTER}`
         }
      ]
   };
}

export function errorResult(message: string) {
   return {
      isError: true as const,
      content: [{ type: 'text' as const, text: message }]
   };
}
