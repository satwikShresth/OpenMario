export const CHART_COLORS = {
   grid: 'var(--chakra-colors-border)',
   tick: 'var(--chakra-colors-fg-muted)',
   cursor: 'var(--chakra-colors-bg-subtle)',
} as const;

export function chartTick(fontSize = 12) {
   return { fontSize, fill: CHART_COLORS.tick };
}
