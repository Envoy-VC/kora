import { createFileRoute } from "@tanstack/react-router";

import { Mint } from "@/components";

const MintPage = () => {
  return (
    <div className="relative h-full">
      <div className="absolute top-1/5 right-1/2 translate-x-1/2">
        <Mint />
      </div>
    </div>
  );
};

export const Route = createFileRoute("/dashboard/mint")({
  component: MintPage,
});
