import type { IconProps } from "../types";

export const ScanIcon = ({
  size = 24,
  width,
  height,
  fill = "currentColor",
  stroke = "currentColor",
  strokeWidth = "2",
  hovered,
  ...props
}: IconProps) => {
  return (
    <svg
      height={size ?? "24"}
      version="1.1"
      viewBox="0 0 24 24"
      width={size ?? "24"}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <title>Scan Icon</title>
      <g
        fill="none"
        fillRule="evenodd"
        stroke="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <g
          id="Scan"
          stroke={stroke}
          strokeWidth={strokeWidth}
          transform="translate(1.500000, 3.350100)"
        >
          <line id="Stroke-1" x1="21" x2="0" y1="9.4555" y2="9.4555"></line>
          <path
            d="M19.1299,5.245 L19.1299,3.732 C19.1299,1.671 17.4589,1.77635684e-15 15.3969,1.77635684e-15 L14.1919,1.77635684e-15"
            id="Stroke-3"
          ></path>
          <path
            d="M1.8701,5.245 L1.8701,3.732 C1.8701,1.671 3.5411,1.77635684e-15 5.6031,1.77635684e-15 L6.8391,1.77635684e-15"
            id="Stroke-5"
          ></path>
          <path
            d="M19.1299,9.4545 L19.1299,13.5285 C19.1299,15.5905 17.4589,17.2615 15.3969,17.2615 L14.1919,17.2615"
            id="Stroke-7"
          ></path>
          <path
            d="M1.8701,9.4545 L1.8701,13.5285 C1.8701,15.5905 3.5411,17.2615 5.6031,17.2615 L6.8391,17.2615"
            id="Stroke-9"
          ></path>
        </g>
      </g>
    </svg>
  );
};
