import type { IconProps } from "../types";

export const PlusIcon = ({
  size = 24,
  stroke = "#000000",
  strokeWidth = "1.5",
  ...props
}: IconProps) => {
  return (
    <svg
      fill="none"
      height={size}
      viewBox="0 0 25 25"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Plus Icon</title>
      <path
        d="M12.0369 9.46265V16.6111"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      ></path>
      <path
        d="M15.6147 13.0369H8.45886"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      ></path>
      <path
        clipRule="evenodd"
        d="M2.30005 13.0369C2.30005 5.73479 4.73479 3.30005 12.0369 3.30005C19.339 3.30005 21.7737 5.73479 21.7737 13.0369C21.7737 20.339 19.339 22.7737 12.0369 22.7737C4.73479 22.7737 2.30005 20.339 2.30005 13.0369Z"
        fillRule="evenodd"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      ></path>
    </svg>
  );
};
