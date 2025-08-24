import { Toaster } from "@kora/ui/components/sonner";
import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";

import { ProviderTree } from "@/providers";

import "@kora/ui/globals.css";

const RootComponent = () => {
  return (
    <>
      <HeadContent />
      <ProviderTree>
        <Outlet />
        <Toaster
          richColors={true}
          toastOptions={{
            className: "!rounded-2xl",
          }}
        />
      </ProviderTree>
    </>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
  head: () => {
    return {
      links: [{ href: "/icon.png", rel: "icon" }],
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
