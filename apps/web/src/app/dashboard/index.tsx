import { Button } from "@kora/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";
import { useConnect } from "wagmi";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { connectAsync, connectors } = useConnect();

  const onConnect = async () => {
    const connector = connectors[0];
    if (!connector) return;
    await connectAsync({ connector });
  };

  return (
    <div className="mx-auto h-full max-w-screen-xl space-y-4 px-2 py-4 md:py-8">
      <Button onClick={onConnect}>Connect</Button>
    </div>
  );
}
