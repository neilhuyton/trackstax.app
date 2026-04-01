import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/home")({
  component: HomePage,
});

function HomePage() {
  return (
    <h1>
      <Link
        to="/stacks"
      >
        Link to Stacks
      </Link>
    </h1>
  );
}
