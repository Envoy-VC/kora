import { useEffect, useState } from "react";

import { Button } from "@kora/ui/components/button";
import { Dialog, DialogContent } from "@kora/ui/components/dialog";
import { LockKeyholeIcon } from "lucide-react";
import { useAccount, useConnect } from "wagmi";

export const ConnectWallet = () => {
  const { address } = useAccount();
  const [open, setOpen] = useState<boolean>(true);

  const { connectAsync, connectors } = useConnect();

  useEffect(() => {
    if (address) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [address]);

  const onConnect = async () => {
    const connector = connectors[0];
    if (!connector) return;
    await connectAsync({ connector });
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent
        className="card-gradient !px-2 !py-4 !rounded-3xl flex w-[28rem] flex-col gap-4 border"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border">
          <LockKeyholeIcon className="text-primary" size={32} />
        </div>
        <div className="text-center text-neutral-200 text-xl">
          Connection Required
        </div>
        <div className="text-center text-base text-neutral-400">
          To proceed, please connect your wallet. This step ensures secure
          access and seamless interaction with the application.
        </div>
        <Button
          className="!font-medium !rounded-xl mx-auto my-3 w-full"
          onClick={onConnect}
        >
          Connect Wallet
        </Button>
      </DialogContent>
    </Dialog>
  );
};
