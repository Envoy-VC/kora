import type React from "react";

import type { MotionProps } from "motion/react";

export type IconProps = React.SVGAttributes<SVGElement> &
  MotionProps & {
    size?: number;
    hovered?: boolean;
  };
