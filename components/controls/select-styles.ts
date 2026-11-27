/**
 * The look of the dropdown (react-select), in theme colors.
 *
 * react-select is styled with style objects, not class names, so the theme tokens
 * are used here as CSS variables.
 */
import type { StylesConfig, ThemeConfig } from "react-select";
import type { SelectOption } from "@/components/form-builder/types";

/** Theme `text-sm`. 0.875rem (14px) at the default `md` font size. */
const dropdownFontSize = "var(--text-sm)";

type SelectStyles = StylesConfig<SelectOption, boolean>;

const buildSelectStyles = (hasError: boolean): SelectStyles => ({
    control: (base, state) => ({
      ...base,
      minHeight: "var(--space-9)",
      borderRadius: "calc(var(--radius) - 2px)",
      borderColor: hasError
        ? `hsl(var(--destructive))`
        : state.isFocused
          ? `hsl(var(--ring))`
          : `hsl(var(--input))`,
      boxShadow: state.isFocused
        ? hasError
          ? `0 0 0 1px hsl(var(--destructive))`
          : `0 0 0 1px hsl(var(--ring))`
        : "none",
      backgroundColor: "transparent",
      color: `hsl(var(--foreground))`,
      fontSize: dropdownFontSize,
      transition: "colors 200ms ease",
      "&:hover": {
        borderColor: hasError
          ? `hsl(var(--destructive))`
          : state.isFocused
            ? `hsl(var(--ring))`
            : `hsl(var(--input))`,
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: `var(--space-0_5) var(--space-2)`,
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
    }),
    placeholder: (base) => ({
      ...base,
      color: `hsl(var(--muted-foreground))`,
      fontSize: dropdownFontSize,
      opacity: 1,
      // Keep one line in a narrow control: cut with "…" instead of wrapping,
      // so the dropdown never grows taller than its single-line height.
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }),
    singleValue: (base) => ({
      ...base,
      color: `hsl(var(--foreground))`,
      fontSize: dropdownFontSize,
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: `hsl(var(--primary) / 0.1)`,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: `hsl(var(--foreground))`,
      fontSize: dropdownFontSize,
      padding: `var(--space-0_5) var(--space-1)`,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: `hsl(var(--foreground))`,
      padding: `0 var(--space-1)`,
      "&:hover": {
        backgroundColor: `hsl(var(--destructive))`,
        color: `hsl(var(--destructive-foreground))`,
      },
    }),
    indicatorsContainer: (base) => ({
      ...base,
      padding: `0 var(--space-1)`,
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: `var(--space-1) var(--space-2)`,
      color: `hsl(var(--muted-foreground))`,
      "&:hover": {
        color: `hsl(var(--foreground))`,
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: `var(--space-1) var(--space-2)`,
      color: `hsl(var(--muted-foreground))`,
      "&:hover": {
        color: `hsl(var(--foreground))`,
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "calc(var(--radius) - 2px)",
      border: `1px solid hsl(var(--border))`,
      fontSize: dropdownFontSize,
      overflow: "hidden",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
      pointerEvents: "auto" as const,
    }),
    menuList: (base) => ({
      ...base,
      padding: `var(--space-1) 0`,
      backgroundColor: `hsl(var(--popover))`,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: dropdownFontSize,
      padding: `var(--space-2) var(--space-3)`,
      backgroundColor: state.isSelected
        ? `hsl(var(--primary))`
        : state.isFocused
          ? `hsl(var(--primary) / 0.1)`
          : `hsl(var(--popover))`,
      color: state.isSelected
        ? `hsl(var(--primary-foreground))`
        : `hsl(var(--foreground))`,
      "&:active": {
        backgroundColor: `hsl(var(--primary))`,
        color: `hsl(var(--primary-foreground))`,
      },
    }),
  });

const normalStyles = buildSelectStyles(false);
const errorStyles = buildSelectStyles(true);

/** The style objects for a dropdown, with a red border when its field has an error. */
export const selectStyles = (hasError: boolean): SelectStyles =>
    hasError ? errorStyles : normalStyles;

/** react-select's own color slots, pointed at the theme tokens. */
export const selectTheme: ThemeConfig = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: `hsl(var(--primary))`,
    primary75: `hsl(var(--primary) / 0.75)`,
    primary50: `hsl(var(--primary) / 0.5)`,
    primary25: `hsl(var(--primary) / 0.1)`,
    neutral0: `hsl(var(--popover))`,
    neutral5: `hsl(var(--popover))`,
    neutral10: `hsl(var(--input))`,
    neutral20: `hsl(var(--input))`,
    neutral30: `hsl(var(--border))`,
    neutral80: `hsl(var(--foreground))`,
  },
});
