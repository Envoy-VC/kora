import { createFileRoute } from "@tanstack/react-router";

import { CreateStrategy } from "@/components";

export const Route = createFileRoute("/dashboard/create-strategy")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute top-1/5 right-1/2 translate-x-1/2">
        <CreateStrategy />
      </div>
    </div>
  );
}
