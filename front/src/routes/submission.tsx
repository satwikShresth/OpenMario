import { JobSubmissionProvider } from "#/stores";
import { Container } from "@mui/material";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/submission")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <JobSubmissionProvider>
      <Container maxWidth="lg">
        <Outlet />
      </Container>
    </JobSubmissionProvider>
  );
}
