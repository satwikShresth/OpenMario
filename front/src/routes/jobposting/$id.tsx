import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/jobposting/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/search/jobposting"!</div>;
}
