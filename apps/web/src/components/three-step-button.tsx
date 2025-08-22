import { type ReactNode, useMemo, useState } from "react";

import { Button, type ButtonProps } from "@kora/ui/components/button";
import { PlusIcon } from "@kora/ui/icons";
import { CircleCheckIcon, Loader2Icon, XCircleIcon } from "lucide-react";

type State = "idle" | "in-progress" | "success" | "error";

export type ThreeStepButtonCallback = (props: {
  state: State;
  setState: (state: State) => void;
}) => Promise<void> | void;

export type ThreeStepButtonProps = {
  icons?: {
    idle?: ReactNode;
    inProgress?: ReactNode;
    success?: ReactNode;
    error?: ReactNode;
  };
  variants?: {
    idle?: ButtonProps["variant"];
    inProgress?: ButtonProps["variant"];
    success?: ButtonProps["variant"];
    error?: ButtonProps["variant"];
  };
  text?: {
    idle?: string;
    inProgress?: string;
    success?: string;
    error?: string;
  };
  onClick?: ThreeStepButtonCallback;
  buttonProps?: ButtonProps;
};

export const ThreeStepButton = ({
  icons,
  text,
  variants,
  onClick,
  buttonProps,
}: ThreeStepButtonProps) => {
  const [state, setState] = useState<State>("idle");

  const handleOnClick = async () => {
    if (onClick) {
      await onClick({ setState, state });
    }
  };

  const buttonIcon = useMemo(() => {
    if (state === "idle")
      return (
        icons?.idle ?? (
          <PlusIcon size={20} stroke="currentColor" strokeWidth={2} />
        )
      );
    else if (state === "in-progress")
      return (
        icons?.inProgress ?? (
          <Loader2Icon
            className="animate-spin will-change-transform"
            size={20}
            stroke="currentColor"
            strokeWidth={2}
          />
        )
      );
    else if (state === "success") {
      return (
        icons?.success ?? (
          <CircleCheckIcon size={20} stroke="currentColor" strokeWidth={2} />
        )
      );
    } else
      return (
        icons?.error ?? (
          <XCircleIcon size={20} stroke="currentColor" strokeWidth={2} />
        )
      );
  }, [state, icons]);

  const variant = useMemo(() => {
    if (state === "idle") return variants?.idle ?? "default";
    else if (state === "in-progress") return variants?.inProgress ?? "default";
    else if (state === "success") return variants?.success ?? "default";
    else return variants?.error ?? "default";
  }, [state, variants]);

  const buttonText = useMemo(() => {
    if (state === "idle") return text?.idle ?? "Create";
    else if (state === "in-progress") return text?.inProgress ?? "Creating...";
    else if (state === "success") return text?.success ?? "Success";
    else return text?.error ?? "Error";
  }, [state, text]);

  return (
    <Button
      animateKey={state}
      icon={buttonIcon}
      iconKey={state}
      onClick={handleOnClick}
      variant={variant}
      {...buttonProps}
    >
      {buttonText}
    </Button>
  );
};
