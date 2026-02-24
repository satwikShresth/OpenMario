import { defineTokens } from "@chakra-ui/react"

export const fonts = defineTokens.fonts({
  heading: {
    value: '"Press Start 2P", system-ui, sans-serif',
  },
  body: {
    value: 'var(--font-bricolage-grotesque)',
  },
  mono: {
    value: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
})
