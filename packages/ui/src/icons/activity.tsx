import type { IconProps } from "../types";

export const ActivityIcon = ({
  size = 24,
  stroke = "currentColor",
  strokeWidth = "2",
  ...props
}: IconProps) => {
  return (
    <svg
      fill="none"
      height={size ?? "24"}
      viewBox="0 0 24 24"
      width={size ?? "24"}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Activity Icon</title>
      <path
        d="M6.91711 14.8539L9.91011 10.9649L13.3241 13.6449L16.2531 9.86487"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <path
        clipRule="evenodd"
        d="M19.6671 2.34998C20.7291 2.34998 21.5891 3.20998 21.5891 4.27198C21.5891 5.33298 20.7291 6.19398 19.6671 6.19398C18.6051 6.19398 17.7451 5.33298 17.7451 4.27198C17.7451 3.20998 18.6051 2.34998 19.6671 2.34998Z"
        fillRule="evenodd"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <path
        d="M20.7555 9.26898C20.8885 10.164 20.9495 11.172 20.9495 12.303C20.9495 19.241 18.6375 21.553 11.6995 21.553C4.76246 21.553 2.44946 19.241 2.44946 12.303C2.44946 5.36598 4.76246 3.05298 11.6995 3.05298C12.8095 3.05298 13.8005 3.11198 14.6825 3.23998"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
    </svg>
  );
};
