"use client";

import type * as react from "react";

import { cn } from "@kora/ui/lib/utils";
import * as labelPrimitive from "@radix-ui/react-label";

function Label({
  className,
  ...props
}: react.ComponentProps<typeof labelPrimitive.Root>) {
  return (
    <labelPrimitive.Root
      className={cn(
        "flex select-none items-center gap-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        className,
      )}
      data-slot="label"
      {...props}
    />
  );
}

export { Label };
