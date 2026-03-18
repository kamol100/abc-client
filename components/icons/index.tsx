export {
  Icon,
  ICON_COLOR_CLASSES,
  ICON_SIZES,
  iconClassName,
  type BaseIconProps,
  type IconColor,
  type IconProps,
  type IconSize,
} from "./icon";

import { iconClassName, type BaseIconProps } from "./icon";
import { forwardRef } from "react";

/**
 * Bangladesh Taka symbol. Theme-aware via `currentColor` + Tailwind `text-*`.
 *
 * @example
 * <TakaIcon size="lg" className="text-primary" />
 * <TakaIcon size="sm" className="text-muted-foreground" />
 * <TakaIcon color="inherit" className="mr-0.5" /> // matches parent text color
 */
export const TakaIcon = forwardRef<SVGSVGElement, BaseIconProps>(
  function TakaIcon(
    {
      size = "md",
      className,
      color = "foreground",
      strokeWidth,
      ...props
    },
    ref
  ) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 384 512"
        fill="currentColor"
        className={iconClassName({ size, color, className })}
        {...(strokeWidth !== undefined ? { strokeWidth } : {})}
        aria-hidden
        focusable="false"
        {...props}
      >
        <path
          fill="currentColor"
          d="M36 32.3C18.4 30.1 2.4 42.5.2 60S10.5 93.6 28 95.8l7.9 1c16 2 28 15.6 28 31.8L64 160H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h32v160c0 53 43 96 96 96h32c106 0 192-86 192-192v-32c0-53-43-96-96-96h-16c-17.7 0-32 14.3-32 32s14.3 32 32 32h16c17.7 0 32 14.3 32 32v32c0 70.7-57.3 128-128 128h-32c-17.7 0-32-14.3-32-32V224h32c17.7 0 32-14.3 32-32s-14.3-32-32-32h-32v-31.5c0-48.4-36.1-89.3-84.1-95.3l-7.9-1z"
        />
      </svg>
    );
  }
);
