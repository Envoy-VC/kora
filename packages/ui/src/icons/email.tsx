import type { IconProps } from "../types";

export const EmailIcon = ({
  size,
  width,
  height,
  stroke = "currentColor",
  strokeWidth = "2",
  ...props
}: IconProps) => {
  return (
    <svg
      height={size ?? height ?? 24}
      id="Message"
      version="1.1"
      viewBox="0 0 24 24"
      width={size ?? width ?? 24}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <title>Email Icon</title>
      <g
        fill="none"
        fill-rule="evenodd"
        id="Iconly/Light/Message"
        stroke="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width={strokeWidth}
      >
        <g
          id="Message"
          stroke={stroke}
          stroke-width={strokeWidth}
          transform="translate(2.000000, 3.000000)"
        >
          <path
            d="M15.9026143,5.8511436 L11.4593272,9.46418164 C10.6198313,10.1301843 9.4387043,10.1301843 8.59920842,9.46418164 L4.11842516,5.8511436"
            id="Stroke-1"
          />
          <path
            d="M14.9088637,17.9999789 C17.9502135,18.0083748 20,15.5095497 20,12.4383622 L20,5.57001263 C20,2.49882508 17.9502135,5.32907052e-15 14.9088637,5.32907052e-15 L5.09113634,5.32907052e-15 C2.04978648,5.32907052e-15 1.77635684e-15,2.49882508 1.77635684e-15,5.57001263 L1.77635684e-15,12.4383622 C1.77635684e-15,15.5095497 2.04978648,18.0083748 5.09113634,17.9999789 L14.9088637,17.9999789 Z"
            id="Stroke-3"
          />
        </g>
      </g>
    </svg>
  );
};
