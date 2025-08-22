import type { IconProps } from "../types";

export const SendIcon = ({
  size = 24,
  fill = "currentColor",
  strokeWidth = "2",
  ...props
}: IconProps) => {
  return (
    <svg
      fill="none"
      height={size ?? "24"}
      viewBox="0 0 25 24"
      width={size ?? "24"}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Send Icon</title>
      <path
        clipRule="evenodd"
        d="M11.7433 12.4382C11.7433 12.4382 -0.233351 9.96062 3.9286 7.55807C7.44075 5.53077 19.5447 2.04522 21.2357 2.94582C22.1363 4.63682 18.6507 16.7408 16.6234 20.2529C14.2209 24.4149 11.7433 12.4382 11.7433 12.4382Z"
        fillRule="evenodd"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      ></path>
      <path
        d="M11.7434 12.4382L21.2358 2.9458"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      ></path>
    </svg>
  );
};
