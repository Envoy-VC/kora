import type { IconProps } from "../types";

export const ErrorIcon = ({
  size = 24,
  stroke = "#000000",
  strokeWidth = "1.5",
  ...props
}: IconProps) => {
  return (
    <svg
      height={size}
      version="1.1"
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <title>Iconly/Light/Danger Circle</title>
      <g
        fill="none"
        fillRule="evenodd"
        id="Iconly/Light/Danger-Circle"
        stroke="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <g
          id="Danger-Circle"
          stroke={stroke}
          transform="translate(2.000000, 2.000000)"
        >
          <path
            d="M10.0001,0.7501 C15.1081,0.7501 19.2501,4.8911 19.2501,10.0001 C19.2501,15.1081 15.1081,19.2501 10.0001,19.2501 C4.8911,19.2501 0.7501,15.1081 0.7501,10.0001 C0.7501,4.8911 4.8911,0.7501 10.0001,0.7501 Z"
            id="Stroke-1"
            strokeWidth={strokeWidth}
          ></path>
          <line
            id="Stroke-3"
            strokeWidth={strokeWidth}
            x1="9.9952"
            x2="9.9952"
            y1="6.2042"
            y2="10.6232"
          ></line>
          <line
            id="Stroke-5"
            strokeWidth={strokeWidth}
            x1="9.995"
            x2="10.005"
            y1="13.7961"
            y2="13.7961"
          ></line>
        </g>
      </g>
    </svg>
  );
};
