import { Button } from "@kora/ui/components/button";
import {
  SidebarContent,
  Sidebar as SidebarCore,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@kora/ui/components/sidebar";
import { PanelRightIcon } from "@kora/ui/icons";

import { SidebarFooter } from "./footer";
import { SidebarHeader } from "./header";
import { InvestmentsGroup } from "./investment-group";
import { MainGroup } from "./main-group";
import { MobileSidebar } from "./mobile";
import { SettingsGroup } from "./settings-group";

export const Sidebar = () => {
  const { open, setOpen, isMobile, setOpenMobile } = useSidebar();
  return (
    <SidebarCore
      className="mx-6 my-auto h-[calc(100%-48px)] overflow-clip px-1 py-0"
      collapsible="icon"
      variant="floating"
    >
      <SidebarHeader />
      <SidebarContent>
        {!open && (
          <SidebarGroup className="border-b py-4">
            <SidebarMenu className="flex items-center justify-center">
              <SidebarMenuItem>
                <Button
                  onClick={() => {
                    if (isMobile) {
                      setOpenMobile(true);
                    } else {
                      setOpen(true);
                    }
                  }}
                  size="icon"
                  variant="outline"
                >
                  <PanelRightIcon strokeWidth={2.5} />
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
        <MainGroup />
        <InvestmentsGroup />
        <SettingsGroup />
      </SidebarContent>
      <SidebarFooter />
    </SidebarCore>
  );
};

export { MobileSidebar };
