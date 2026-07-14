/**
 * Route-aware page width — search surfaces get a wider cap than detail pages,
 * but nothing runs full-bleed (avoids cards stretching edge-to-edge).
 */
export function normalizePathname(pathname: string): string {
   return pathname.replace(/\/+$/, '') || '/'
}

/**
 * Quarter schedule editor — fills the main panel (no max-width, no footer).
 * Matches `/courses/plan/schedule/term-…` (and nested course detail under it).
 */
export function isImmersiveScheduleRoute(pathname: string): boolean {
   const path = normalizePathname(pathname)
   return /^\/courses\/plan\/schedule\/term-[^/]+/.test(path)
}

/** Faceted search / dense table routes — wider than detail, still capped. */
export function isSearchRoute(pathname: string): boolean {
   const path = normalizePathname(pathname)

   return (
      path === '/professors' ||
      path === '/companies' ||
      path === '/courses/explore' ||
      path === '/courses/plan' ||
      path.startsWith('/courses/plan/') ||
      path === '/salary' ||
      path.startsWith('/salary/')
   )
}

/** Detail, profile, and form pages — reading width. */
export type PageMaxWidth = '5xl' | '7xl' | 'none'

export function getPageMaxWidth(pathname: string): PageMaxWidth {
   if (isImmersiveScheduleRoute(pathname)) return 'none'
   return isSearchRoute(pathname) ? '7xl' : '5xl'
}
