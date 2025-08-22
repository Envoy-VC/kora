"use client";

import type React from "react";

import { cn } from "@kora/ui/lib/utils";
import { motion, useAnimate } from "motion/react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

export const Button = ({ className, children, ...props }: ButtonProps) => {
  const [scope, animate] = useAnimate();

  const animateLoading = async () => {
    await animate(
      ".loader",
      {
        display: "block",
        scale: 1,
        width: "20px",
      },
      {
        duration: 0.2,
      },
    );
  };

  const animateSuccess = async () => {
    await animate(
      ".loader",
      {
        display: "none",
        scale: 0,
        width: "0px",
      },
      {
        duration: 0.2,
      },
    );
    await animate(
      ".check",
      {
        display: "block",
        scale: 1,
        width: "20px",
      },
      {
        duration: 0.2,
      },
    );

    await animate(
      ".check",
      {
        display: "none",
        scale: 0,
        width: "0px",
      },
      {
        delay: 2,
        duration: 0.2,
      },
    );
  };

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    await animateLoading();
    await props.onClick?.(event);
    await animateSuccess();
  };

  const {
    onClick: _onClick,
    onDrag: _onDrag,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    onAnimationStart: _onAnimationStart,
    onAnimationEnd: _onAnimationEnd,
    ...buttonProps
  } = props;

  return (
    <motion.button
      className={cn(
        "flex h-9 min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-green-500 px-4 font-medium text-white ring-offset-2 transition duration-200 hover:ring-2 hover:ring-green-500 dark:ring-offset-black",
        className,
      )}
      layout={true}
      layoutId="button"
      ref={scope}
      {...buttonProps}
      onClick={handleClick}
    >
      <motion.div className="flex items-center gap-2" layout={true}>
        <Loader />
        <CheckIcon />
        <motion.span layout={true}>{children}</motion.span>
      </motion.div>
    </motion.button>
  );
};

const Loader = () => {
  return (
    <motion.svg
      animate={{
        rotate: [0, 360],
      }}
      className="loader text-white"
      fill="none"
      height="24"
      initial={{
        display: "none",
        scale: 0,
        width: 0,
      }}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      style={{
        display: "none",
        scale: 0.5,
      }}
      transition={{
        duration: 0.3,
        ease: "linear",
        repeat: Infinity,
      }}
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Loader Icon</title>
      <path d="M0 0h24v24H0z" fill="none" stroke="none" />
      <path d="M12 3a9 9 0 1 0 9 9" />
    </motion.svg>
  );
};

const CheckIcon = () => {
  return (
    <motion.svg
      className="check text-white"
      fill="none"
      height="24"
      initial={{
        display: "none",
        scale: 0,
        width: 0,
      }}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      style={{
        display: "none",
        scale: 0.5,
      }}
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Check Icon</title>
      <path d="M0 0h24v24H0z" fill="none" stroke="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M9 12l2 2l4 -4" />
    </motion.svg>
  );
};
