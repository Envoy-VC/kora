import { Button } from "@kora/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useDisconnect } from "wagmi";

export const Route = createFileRoute("/dashboard/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { address } = useAccount();
  const { disconnectAsync } = useDisconnect();

  return (
    <div className="card-gradient mx-auto my-24 flex max-w-screen-lg flex-cpl flex-col gap-4 rounded-2xl border p-4">
      <div className="flex w-full flex-col rounded-xl border bg-[#101010] p-3">
        <div className="text-2xl">Settings</div>
        <div className="text-neutral-400 text-sm">
          Manage your settings and preferences.
        </div>
      </div>
      <div className="flex flex-row items-center justify-between gap-2 rounded-xl bg-[#0B0B0D] p-4">
        <div className="text-neutral-300">Connected Wallet</div>
        {address && (
          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-row items-center gap-2 rounded-xl bg-[#0f0f0f] px-4 py-2 text-neutral-200">
              {address.slice(0, 6)}...{address.slice(-4)}
              <CopyIcon
                className="cursor-pointer"
                onClick={async () => {
                  await navigator.clipboard.writeText(address);
                  toast.success("Address copied to clipboard");
                }}
                size={16}
              />
            </div>
            <Button
              className="!font-medium !rounded-xl"
              onClick={() => {
                disconnectAsync();
              }}
            >
              Disconnect
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
