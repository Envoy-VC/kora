import { createRootRoute, Outlet } from "@tanstack/react-router";

import { ProviderTree } from "@/providers";

import "@kora/ui/globals.css";

const RootComponent = () => {
  return (
    <ProviderTree>
      <Outlet />
    </ProviderTree>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
