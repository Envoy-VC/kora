import { Button } from "@kora/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="mx-auto h-full max-w-screen-xl space-y-4 px-2 py-4 md:py-8">
      <Button>Click</Button>
    </div>
  );
}
