import { createFileRoute } from "@tanstack/react-router";

import { WrapTokens } from "@/components";

const WrapTokenPage = () => {
  return (
    <div className="relative h-full">
      <div className="absolute top-1/5 right-1/2 w-full translate-x-1/2">
        <WrapTokens />
      </div>
    </div>
  );
};

export const Route = createFileRoute("/dashboard/wrap")({
  component: WrapTokenPage,
});
