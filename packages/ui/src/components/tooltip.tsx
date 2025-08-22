"use client";

import type * as react from "react";

import { cn } from "@kora/ui/lib/utils";
import * as tooltipPrimitive from "@radix-ui/react-tooltip";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: react.ComponentProps<typeof tooltipPrimitive.Provider>) {
  return (
    <tooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: react.ComponentProps<typeof tooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <tooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: react.ComponentProps<typeof tooltipPrimitive.Trigger>) {
  return <tooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: react.ComponentProps<typeof tooltipPrimitive.Content>) {
  return (
    <tooltipPrimitive.Portal>
      <tooltipPrimitive.Content
        className={cn(
          "fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in text-balance rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-xs data-[state=closed]:animate-out",
          className,
        )}
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        {...props}
      >
        {children}
        <tooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-primary fill-primary" />
      </tooltipPrimitive.Content>
    </tooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
