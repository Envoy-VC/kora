import { Button } from "@kora/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";

import { useFhevm } from "@/hooks";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { getEncryptedTokenBalance } = useFhevm();

  const onClick = async () => {
    const eWETHBalance = await getEncryptedTokenBalance("eWETH");
    console.log("eWETHBalance", eWETHBalance);
  };
  return (
    <div className="mx-auto h-full max-w-screen-xl space-y-4 px-2 py-4 md:py-8">
      <Button onClick={onClick}>Click</Button>
    </div>
  );
}
