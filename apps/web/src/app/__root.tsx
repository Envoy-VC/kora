import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";

import { ProviderTree } from "@/providers";

import "@kora/ui/globals.css";

const RootComponent = () => {
  return (
    <>
      <HeadContent />
      <ProviderTree>
        <Outlet />
      </ProviderTree>
    </>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
  head: () => {
    return {
      links: [],
      meta: [
        {
          content: "My App is a web application",
          name: "description",
        },
        {
          title: "Kora",
        },
      ],
    };
  },
});
