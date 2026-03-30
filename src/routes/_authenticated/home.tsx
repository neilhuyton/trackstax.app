import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/home")({
  component: HomePage,
});

function HomePage() {
  return (
    <h1>
      <Link
        to="/stacks/$stackId"
        params={{ stackId: "7b1ee88b-0202-4eb4-a321-df3c5a58ff18" }}
      >
        Link to Stack
      </Link>
    </h1>
  );
}
