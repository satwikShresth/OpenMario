import { createFileRoute } from '@tanstack/react-router'
import { MajorMapPage } from '@/components/MajorMap'

export const Route = createFileRoute('/courses/plan/major')({
   beforeLoad: () => ({ getLabel: () => 'Major Map' }),
   component: MajorMapPage,
})
