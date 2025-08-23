import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useAccount } from "wagmi";

import { StrategiesTable } from "@/components";
import { api } from "@/convex/_generated/api";

export const Route = createFileRoute("/dashboard/strategies")({
  component: RouteComponent,
});

function RouteComponent() {
  const { address } = useAccount();
  const strategies = useQuery(api.functions.strategy.getStrategiesForUser, {
    userAddress: address,
  });
  return (
    <div className="px-4">
      <div className="card-gradient mx-auto my-0 flex max-w-screen-xl flex-cpl flex-col gap-4 rounded-2xl border p-4">
        <div className="flex w-full flex-col rounded-xl border bg-[#101010] p-3">
          <div className="text-2xl">My Strategies</div>
        </div>
        <div>
          <StrategiesTable strategies={strategies ?? []} />
        </div>
      </div>
    </div>
  );
}
