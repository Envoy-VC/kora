import type { IconProps } from "../types";

export const UsersIcon = ({
  size = 24,
  width,
  height,
  fill = "currentColor",
  stroke = "currentColor",
  strokeWidth = "2",
  ...props
}: IconProps) => {
  return (
    <svg
      fill="none"
      height={size ?? height ?? 24}
      viewBox="0 0 24 24"
      width={size ?? width ?? 24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Users Icon</title>
      <path
        clipRule="evenodd"
        d="M11.9726 20.3682C8.73355 20.3682 5.96655 19.8782 5.96655 17.9162C5.96655 15.9542 8.71555 14.2462 11.9726 14.2462C15.2116 14.2462 17.9786 15.9382 17.9786 17.8992C17.9786 19.8602 15.2296 20.3682 11.9726 20.3682Z"
        fillRule="evenodd"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path
        clipRule="evenodd"
        d="M11.9726 11.4488C14.0986 11.4488 15.8226 9.72576 15.8226 7.59976C15.8226 5.47376 14.0986 3.74976 11.9726 3.74976C9.84657 3.74976 8.12257 5.47376 8.12257 7.59976C8.11657 9.71776 9.82657 11.4418 11.9456 11.4488H11.9726Z"
        fillRule="evenodd"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path
        d="M18.362 10.3917C19.599 10.0607 20.511 8.93266 20.511 7.58966C20.511 6.18866 19.518 5.01866 18.196 4.74866"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path
        d="M18.9431 13.5444C20.6971 13.5444 22.1951 14.7334 22.1951 15.7954C22.1951 16.4204 21.6781 17.1014 20.8941 17.2854"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path
        d="M5.58384 10.3917C4.34584 10.0607 3.43384 8.93266 3.43384 7.58966C3.43384 6.18866 4.42784 5.01866 5.74884 4.74866"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path
        d="M5.00176 13.5444C3.24776 13.5444 1.74976 14.7334 1.74976 15.7954C1.74976 16.4204 2.26676 17.1014 3.05176 17.2854"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};
