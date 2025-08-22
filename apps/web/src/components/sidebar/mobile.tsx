import { Button } from "@kora/ui/components/button";
import { useSidebar } from "@kora/ui/components/sidebar";
import { KoraLogo } from "@kora/ui/icons";
import { MenuIcon } from "lucide-react";

export const MobileSidebar = () => {
  const { setOpenMobile } = useSidebar();
  return (
    <div className="flex h-[7dvh] w-full flex-row items-center gap-2 px-3 md:hidden">
      <Button
        className="text-secondary-foreground"
        onClick={() => setOpenMobile(true)}
        size="icon"
        variant="link"
      >
        <MenuIcon strokeWidth={2} />
      </Button>
      <div className="flex flex-row items-center gap-2 text-white">
        <KoraLogo className="size-6" fill="currentColor" strokeWidth={2} />
        <div className="font-comic font-medium text-secondary-foreground text-xl">
          Kora
        </div>
      </div>
    </div>
  );
};
