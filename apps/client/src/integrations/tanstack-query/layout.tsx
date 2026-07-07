import { useEffect, useState } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

/**
 * Avoid mounting devtools during SSR: `useQueryClient()` requires a provider,
 * and the SSR shell may render routes outside `QueryClientProvider`.
 */
export default function LayoutAddition() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <ReactQueryDevtools buttonPosition="bottom-right" />
}
