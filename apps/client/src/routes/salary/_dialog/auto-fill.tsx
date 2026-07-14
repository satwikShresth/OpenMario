import { createFileRoute } from '@tanstack/react-router'
import { Salary } from '@/components/Salary'

export const Route = createFileRoute('/salary/_dialog/auto-fill')({
   beforeLoad: () => ({ getLabel: () => 'AutoFill' }),
   component: () => <Salary.AutoFill.Guide />,
})
