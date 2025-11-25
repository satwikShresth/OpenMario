import { HStack, SegmentGroup } from '@chakra-ui/react'
import { createFileRoute, Link, Outlet, useMatches } from '@tanstack/react-router'
import { LuGrid2X2, LuTable, LuUser } from 'react-icons/lu'
import { Index } from 'react-instantsearch'

export const Route = createFileRoute('/_search/courses')({
  component: RouteComponent,
})

function RouteComponent() {
  const match = useMatches({ select: (s) => s!.at(-1)!.fullPath.split('/').at(2) })
  return (
    <Index indexName='sections' >
      <SegmentGroup.Root
        defaultValue={match}
        value={match}
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items
          items={[
            {
              value: "explore",
              label: (
                <Link to='/courses/explore'>
                  <HStack>
                    <LuTable /> Explore </HStack>

                </Link>
              ),
            },
            {
              value: "plan",
              label: (
                <Link to='/courses/plan'>
                  <HStack>
                    <LuGrid2X2 /> Plan

                  </HStack>
                </Link>
              ),
            },
            {
              value: "profile",
              label: (
                <Link to='/courses/profile'>
                  <HStack>
                    <LuUser /> Profile

                  </HStack>
                </Link>
              ),
            },
          ]}
        />
      </SegmentGroup.Root>
      <Outlet />
    </Index>
  )
}
