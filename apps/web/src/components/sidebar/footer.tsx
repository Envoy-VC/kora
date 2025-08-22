import { Button } from "@kora/ui/components/button";
import {
  SidebarFooter as SidebarFooterCore,
  useSidebar,
} from "@kora/ui/components/sidebar";
import { EmailIcon, GitHubIcon, TwitterIcon } from "@kora/ui/icons";
import { cn } from "@kora/ui/lib/utils";

const socials = [
  {
    href: "https://x.com/Envoy_1084",
    icon: TwitterIcon,
    id: "twitter",
    title: "Twitter",
  },
  {
    href: "mailto:vedantchainani1084@gmail.com",
    icon: EmailIcon,
    id: "email",
    title: "Email",
  },
  {
    href: "https://github.com/Envoy-VC/kora",
    icon: GitHubIcon,
    id: "github",
    title: "Github",
  },
];

export const SidebarFooter = () => {
  const { open } = useSidebar();
  return (
    <SidebarFooterCore
      className={cn(
        "flex items-center justify-evenly gap-2 pb-4",
        open ? "flex-row" : "flex-col",
      )}
    >
      {socials.map((item) => {
        return (
          <Button asChild={true} key={item.id} size="icon" variant="outline">
            <a href={item.href} rel="noreferrer" target="_blank">
              <span className="sr-only">{item.title}</span>
              <item.icon strokeWidth={2.5} />
            </a>
          </Button>
        );
      })}
    </SidebarFooterCore>
  );
};
