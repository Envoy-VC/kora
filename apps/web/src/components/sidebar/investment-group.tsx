import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@kora/ui/components/sidebar";
import { GiftIcon, PlusIcon } from "@kora/ui/icons";
import { cn } from "@kora/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

const investmentsGroupItems = [
  {
    href: "/dashboard/create-strategy",
    icon: PlusIcon,
    id: "create-strategy",
    title: "Create Strategy",
  },
  {
    href: "/dashboard/wrap",
    icon: GiftIcon,
    id: "wrap",
    title: "Wrap Tokens",
  },
];

export const InvestmentsGroup = () => {
  return (
    <SidebarGroup className="border-b">
      <SidebarGroupLabel>Investments</SidebarGroupLabel>
      <SidebarMenu>
        {investmentsGroupItems.map((item) => (
          <SidebarMenuItem className="mx-auto w-full" key={item.title}>
            <motion.div className="rounded-2xl">
              <SidebarMenuButton asChild={true} size="lg" tooltip={item.title}>
                <Link
                  activeOptions={{
                    // biome-ignore lint/complexity/noUselessTernary: safe
                    exact: item.id === "goals" ? false : true,
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
                  <item.icon strokeWidth={2} />
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
