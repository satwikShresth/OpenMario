import { defineSemanticTokens } from "@chakra-ui/react"

// Hard offset for the retro character + soft ambient glow underneath for depth.
// Warm maroon-dark tint (not cold black) so shadows complement the Mario red palette.
export const shadows = defineSemanticTokens.shadows({
  xs: {
    value: {
      _light: "2px 2px 0px rgba(28, 8, 8, 0.65), 0 1px 4px rgba(0, 0, 0, 0.06)",
      _dark: "2px 2px 0px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.3)",
    },
  },
  sm: {
    value: {
      _light: "3px 3px 0px rgba(28, 8, 8, 0.65), 0 2px 8px rgba(0, 0, 0, 0.08)",
      _dark: "3px 3px 0px rgba(0, 0, 0, 0.9), 0 2px 8px rgba(0, 0, 0, 0.35)",
    },
  },
  md: {
    value: {
      _light: "5px 5px 0px rgba(28, 8, 8, 0.60), 0 4px 14px rgba(0, 0, 0, 0.10)",
      _dark: "5px 5px 0px rgba(0, 0, 0, 0.9), 0 4px 14px rgba(0, 0, 0, 0.4)",
    },
  },
  lg: {
    value: {
      _light: "6px 6px 0px rgba(28, 8, 8, 0.55), 0 6px 20px rgba(0, 0, 0, 0.12)",
      _dark: "6px 6px 0px rgba(0, 0, 0, 0.85), 0 6px 20px rgba(0, 0, 0, 0.45)",
    },
  },
  xl: {
    value: {
      _light: "8px 8px 0px rgba(28, 8, 8, 0.50), 0 8px 28px rgba(0, 0, 0, 0.12)",
      _dark: "8px 8px 0px rgba(0, 0, 0, 0.8), 0 8px 28px rgba(0, 0, 0, 0.5)",
    },
  },
  "2xl": {
    value: {
      _light: "12px 12px 0px rgba(28, 8, 8, 0.45), 0 12px 40px rgba(0, 0, 0, 0.14)",
      _dark: "12px 12px 0px rgba(0, 0, 0, 0.8), 0 12px 40px rgba(0, 0, 0, 0.55)",
    },
  },
  inner: {
    value: {
      _light: "inset 2px 2px 6px rgba(28, 8, 8, 0.12)",
      _dark: "inset 2px 2px 6px rgba(0, 0, 0, 0.5)",
    },
  },
  inset: {
    value: {
      _light: "inset 0 0 0 2px rgba(28, 8, 8, 0.10)",
      _dark: "inset 0 0 0 2px rgba(255, 255, 255, 0.06)",
    },
  },
})
