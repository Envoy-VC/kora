import { useState } from "react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@kora/ui/components/sidebar";
import { SettingsIcon, WalletIcon } from "@kora/ui/icons";
import { cn } from "@kora/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

const settingsGroupItems = [
  {
    href: "/dashboard/wc",
    icon: WalletIcon,
    id: "wc",
    title: "Wallet Connect",
  },
  {
    href: "/dashboard/settings",
    icon: SettingsIcon,
    id: "settings",
    title: "Settings",
  },
];

export const SettingsGroup = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Settings</SidebarGroupLabel>
      <SidebarMenu>
        {settingsGroupItems.map((item) => (
          <SidebarMenuItem className="mx-auto w-full" key={item.title}>
            <motion.div
              className="rounded-2xl"
              onHoverEnd={() => setHovered(null)}
              onHoverStart={() => setHovered(item.id)}
            >
              <SidebarMenuButton asChild={true} size="lg" tooltip={item.title}>
                <Link
                  activeOptions={{
                    exact: true,
                    includeHash: true,
                    includeSearch: true,
                  }}
                  activeProps={{
                    className: cn(
                      "!text-primary hover:!bg-primary/[0.15] bg-primary/[0.125] shadow-xs focus-visible:ring-primary/20",
                    ),
                  }}
                  className="[&>svg]:!size-5 h-10 w-full rounded-xl text-base hover:bg-sidebar-accent"
                  to={item.href}
                >
                  <item.icon hovered={hovered === item.id} strokeWidth={2} />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </motion.div>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
