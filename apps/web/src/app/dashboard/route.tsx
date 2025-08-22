import { SidebarProvider } from "@kora/ui/components/sidebar";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";

import { ConnectWallet, MobileSidebar, Sidebar } from "@/components";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { pathname } = useLocation();
  return (
    <SidebarProvider>
      <Sidebar />
      <div className="flex h-full w-full flex-col">
        <MobileSidebar />
        <div className="-translate-y-[20px]">
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, y: 20 }}
              className="h-screen p-6"
              initial={{}}
              key={pathname}
              transition={{ type: "spring" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
        <ConnectWallet />
      </div>
    </SidebarProvider>
  );
}
