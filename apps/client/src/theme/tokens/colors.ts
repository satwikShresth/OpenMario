import { defineTokens } from "@chakra-ui/react"

export const colors = defineTokens.colors({
  transparent: {
    value: "transparent",
  },
  current: {
    value: "currentColor",
  },
  black: {
    value: "#09090B",
  },
  white: {
    value: "#FFFFFF",
  },
  whiteAlpha: {
    "50": {
      value: "rgba(255, 255, 255, 0.04)",
    },
    "100": {
      value: "rgba(255, 255, 255, 0.06)",
    },
    "200": {
      value: "rgba(255, 255, 255, 0.08)",
    },
    "300": {
      value: "rgba(255, 255, 255, 0.16)",
    },
    "400": {
      value: "rgba(255, 255, 255, 0.24)",
    },
    "500": {
      value: "rgba(255, 255, 255, 0.36)",
    },
    "600": {
      value: "rgba(255, 255, 255, 0.48)",
    },
    "700": {
      value: "rgba(255, 255, 255, 0.64)",
    },
    "800": {
      value: "rgba(255, 255, 255, 0.80)",
    },
    "900": {
      value: "rgba(255, 255, 255, 0.92)",
    },
    "950": {
      value: "rgba(255, 255, 255, 0.95)",
    },
  },
  blackAlpha: {
    "50": {
      value: "rgba(0, 0, 0, 0.04)",
    },
    "100": {
      value: "rgba(0, 0, 0, 0.06)",
    },
    "200": {
      value: "rgba(0, 0, 0, 0.08)",
    },
    "300": {
      value: "rgba(0, 0, 0, 0.16)",
    },
    "400": {
      value: "rgba(0, 0, 0, 0.24)",
    },
    "500": {
      value: "rgba(0, 0, 0, 0.36)",
    },
    "600": {
      value: "rgba(0, 0, 0, 0.48)",
    },
    "700": {
      value: "rgba(0, 0, 0, 0.64)",
    },
    "800": {
      value: "rgba(0, 0, 0, 0.80)",
    },
    "900": {
      value: "rgba(0, 0, 0, 0.92)",
    },
    "950": {
      value: "rgba(0, 0, 0, 0.95)",
    },
  },
  gray: {
    "50": {
      value: "#fafafa",
    },
    "100": {
      value: "#f4f4f5",
    },
    "200": {
      value: "#e4e4e7",
    },
    "300": {
      value: "#d4d4d8",
    },
    "400": {
      value: "#a1a1aa",
    },
    "500": {
      value: "#71717a",
    },
    "600": {
      value: "#52525b",
    },
    "700": {
      value: "#3f3f46",
    },
    "800": {
      value: "#27272a",
    },
    "900": {
      value: "#18181b",
    },
    "950": {
      value: "#111111",
    },
  },
  // Mario Red — the iconic overalls & cap color
  red: {
    "50": {
      value: "#fff1f0",
    },
    "100": {
      value: "#ffe0de",
    },
    "200": {
      value: "#ffb9b5",
    },
    "300": {
      value: "#ff807a",
    },
    "400": {
      value: "#f74f44",
    },
    "500": {
      value: "#e52521",
    },
    "600": {
      value: "#c4180b",
    },
    "700": {
      value: "#9c1509",
    },
    "800": {
      value: "#7a130f",
    },
    "900": {
      value: "#4f0b09",
    },
    "950": {
      value: "#300706",
    },
  },
  orange: {
    "50": {
      value: "#fff7ed",
    },
    "100": {
      value: "#ffedd5",
    },
    "200": {
      value: "#fed7aa",
    },
    "300": {
      value: "#fdba74",
    },
    "400": {
      value: "#fb923c",
    },
    "500": {
      value: "#f97316",
    },
    "600": {
      value: "#ea580c",
    },
    "700": {
      value: "#92310a",
    },
    "800": {
      value: "#6c2710",
    },
    "900": {
      value: "#3b1106",
    },
    "950": {
      value: "#220a04",
    },
  },
  // Coin Gold — every Mario game's most precious collectible
  yellow: {
    "50": {
      value: "#fffbea",
    },
    "100": {
      value: "#fff3c4",
    },
    "200": {
      value: "#ffe47c",
    },
    "300": {
      value: "#ffd43b",
    },
    "400": {
      value: "#ffc107",
    },
    "500": {
      value: "#e6a800",
    },
    "600": {
      value: "#b88800",
    },
    "700": {
      value: "#8a6500",
    },
    "800": {
      value: "#5c4400",
    },
    "900": {
      value: "#3b2c00",
    },
    "950": {
      value: "#231a00",
    },
  },
  // Pipe Green — Warp Zone vibes
  green: {
    "50": {
      value: "#eefff4",
    },
    "100": {
      value: "#d6ffe5",
    },
    "200": {
      value: "#a8fcc7",
    },
    "300": {
      value: "#60f49a",
    },
    "400": {
      value: "#1de366",
    },
    "500": {
      value: "#00c44f",
    },
    "600": {
      value: "#009c3f",
    },
    "700": {
      value: "#007a32",
    },
    "800": {
      value: "#005e27",
    },
    "900": {
      value: "#003c19",
    },
    "950": {
      value: "#00250f",
    },
  },
  teal: {
    "50": {
      value: "#f0fdfa",
    },
    "100": {
      value: "#ccfbf1",
    },
    "200": {
      value: "#99f6e4",
    },
    "300": {
      value: "#5eead4",
    },
    "400": {
      value: "#2dd4bf",
    },
    "500": {
      value: "#14b8a6",
    },
    "600": {
      value: "#0d9488",
    },
    "700": {
      value: "#0c5d56",
    },
    "800": {
      value: "#114240",
    },
    "900": {
      value: "#032726",
    },
    "950": {
      value: "#021716",
    },
  },
  // Mario Sky Blue — World 1-1 sky forever
  blue: {
    "50": {
      value: "#eff8ff",
    },
    "100": {
      value: "#d8eeff",
    },
    "200": {
      value: "#b2deff",
    },
    "300": {
      value: "#7dbeff",
    },
    "400": {
      value: "#5c94fc",
    },
    "500": {
      value: "#3b75f6",
    },
    "600": {
      value: "#2458e6",
    },
    "700": {
      value: "#1d46c2",
    },
    "800": {
      value: "#1a3899",
    },
    "900": {
      value: "#142670",
    },
    "950": {
      value: "#0d1845",
    },
  },
  cyan: {
    "50": {
      value: "#ecfeff",
    },
    "100": {
      value: "#cffafe",
    },
    "200": {
      value: "#a5f3fc",
    },
    "300": {
      value: "#67e8f9",
    },
    "400": {
      value: "#22d3ee",
    },
    "500": {
      value: "#06b6d4",
    },
    "600": {
      value: "#0891b2",
    },
    "700": {
      value: "#0c5c72",
    },
    "800": {
      value: "#134152",
    },
    "900": {
      value: "#072a38",
    },
    "950": {
      value: "#051b24",
    },
  },
  purple: {
    "50": {
      value: "#faf5ff",
    },
    "100": {
      value: "#f3e8ff",
    },
    "200": {
      value: "#e9d5ff",
    },
    "300": {
      value: "#d8b4fe",
    },
    "400": {
      value: "#c084fc",
    },
    "500": {
      value: "#a855f7",
    },
    "600": {
      value: "#9333ea",
    },
    "700": {
      value: "#641ba3",
    },
    "800": {
      value: "#4a1772",
    },
    "900": {
      value: "#2f0553",
    },
    "950": {
      value: "#1a032e",
    },
  },
  pink: {
    "50": {
      value: "#fdf2f8",
    },
    "100": {
      value: "#fce7f3",
    },
    "200": {
      value: "#fbcfe8",
    },
    "300": {
      value: "#f9a8d4",
    },
    "400": {
      value: "#f472b6",
    },
    "500": {
      value: "#ec4899",
    },
    "600": {
      value: "#db2777",
    },
    "700": {
      value: "#a41752",
    },
    "800": {
      value: "#6d0e34",
    },
    "900": {
      value: "#45061f",
    },
    "950": {
      value: "#2c0514",
    },
  },
})
