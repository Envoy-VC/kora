import type { IconProps } from "../types";

export const PanelRightIcon = ({
  size,
  width,
  height,
  stroke = "currentColor",
  strokeWidth = "2",
  ...props
}: IconProps) => {
  return (
    <svg
      fill="none"
      height={height ?? size ?? 24}
      viewBox="0 0 24 24"
      width={width ?? size ?? 24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Panel Right Icon</title>
      <path
        d="M21.97 15V9C21.97 4 19.97 2 14.97 2H8.96997C3.96997 2 1.96997 4 1.96997 9V15C1.96997 20 3.96997 22 8.96997 22H14.97C19.97 22 21.97 20 21.97 15Z"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path
        d="M14.97 2V22"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path
        d="M7.96997 9.43994L10.53 11.9999L7.96997 14.5599"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};
