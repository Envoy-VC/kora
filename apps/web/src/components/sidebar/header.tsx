import { Button } from "@kora/ui/components/button";
import {
  SidebarHeader as SidebarHeaderCore,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@kora/ui/components/sidebar";
import { KoraLogo, PanelLeftIcon } from "@kora/ui/icons";
import { cn } from "@kora/ui/lib/utils";
import { Link } from "@tanstack/react-router";

export const SidebarHeader = () => {
  const { open, setOpen, isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarHeaderCore className="!pt-3 border-b">
      <SidebarMenu>
        <SidebarMenuItem
          className={cn(
            "flex items-center gap-4",
            open ? "justify-between" : "justify-center",
          )}
        >
          <Link className="group/header-icon flex flex-row items-center" to="/">
            <SidebarMenuButton className="!p-0 !m-0 !size-16 flex cursor-pointer items-center justify-center transition-all duration-300 ease-in-out hover:bg-transparent group-hover/header-icon:rotate-3 group-hover/header-icon:scale-[107%] group-data-[collapsible=icon]:size-12! [&>svg]:size-7">
              <KoraLogo />
            </SidebarMenuButton>
            <div
              className={cn(
                "font-comic font-medium text-2xl text-accent-foreground tracking-wider transition-all duration-300 ease-in-out",
                open ? "inline-flex" : "hidden",
              )}
            >
              Kora
            </div>
          </Link>
          {open && (
            <Button
              className="justify-self-end"
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                } else {
                  setOpen(false);
                }
              }}
              size="icon"
              variant="outline"
            >
              <PanelLeftIcon strokeWidth={2.5} />
            </Button>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeaderCore>
  );
};
