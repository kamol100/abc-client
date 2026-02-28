# EnhancedBadge Component

A global, reusable Badge component extending ShadCN's Badge with theme support, semantic variants, and optional tooltips.

## Features

- **Theme-aware**: Fully supports light/dark mode using CSS variables
- **Semantic variants**: Pre-defined status colors (success, error, warning, info, neutral)
- **ShadCN compatible**: Extends base Badge, inherits all variants (default, secondary, destructive, outline)
- **Optional tooltip**: Add tooltips without wrapping logic
- **Icon support**: Optional icon slot with proper spacing
- **Size variants**: sm, default, lg
- **Accessible**: ARIA-compliant tooltip implementation
- **Extensible**: Easy to add new variants or features

## Import

```typescript
import { EnhancedBadge } from "@/components/ui/enhanced-badge";
```

## API

### Props

Extends all base `Badge` props plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"` | ShadCN badge variant |
| `status` | `"success" \| "error" \| "warning" \| "info" \| "neutral"` | - | Semantic status variant |
| `size` | `"sm" \| "default" \| "lg"` | `"default"` | Badge size |
| `tooltip` | `string` | - | Optional tooltip text |
| `tooltipSide` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | Tooltip position |
| `icon` | `React.ReactNode` | - | Optional icon element |

### Variants

#### Status Variants (Theme-aware)
- **success**: Green - for active/completed states
- **error**: Red (destructive) - for inactive/failed states  
- **warning**: Yellow - for warning/pending states
- **info**: Blue - for informational states
- **neutral**: Muted - for default/neutral states

#### ShadCN Base Variants
- **default**: Primary theme colors
- **secondary**: Secondary theme colors
- **destructive**: Destructive/error colors
- **outline**: Outlined style

## Usage Examples

### Basic Status Badge

```typescript
<EnhancedBadge status="success">
  Active
</EnhancedBadge>
```

### With Tooltip

```typescript
<EnhancedBadge 
  status="error" 
  tooltip="User is currently inactive"
  tooltipSide="right"
>
  Inactive
</EnhancedBadge>
```

### With Icon

```typescript
import { CheckCircle } from "lucide-react";

<EnhancedBadge status="success" icon={<CheckCircle className="h-3 w-3" />}>
  Verified
</EnhancedBadge>
```

### Different Sizes

```typescript
<EnhancedBadge status="info" size="sm">Small</EnhancedBadge>
<EnhancedBadge status="info">Default</EnhancedBadge>
<EnhancedBadge status="info" size="lg">Large</EnhancedBadge>
```

### Using Base ShadCN Variants

```typescript
<EnhancedBadge variant="secondary">
  Secondary Style
</EnhancedBadge>

<EnhancedBadge variant="outline">
  Outlined
</EnhancedBadge>
```

### Complex Example

```typescript
import { AlertTriangle } from "lucide-react";

<EnhancedBadge
  status="warning"
  size="lg"
  icon={<AlertTriangle className="h-4 w-4" />}
  tooltip="Action required within 24 hours"
  tooltipSide="bottom"
  className="font-bold"
>
  Pending Review
</EnhancedBadge>
```

### In Table Columns

```typescript
{
  accessorKey: "status",
  cell: ({ row }) => {
    const status = row.original.status as 0 | 1;
    return (
      <EnhancedBadge
        status={status === 1 ? "success" : "error"}
        tooltip={status === 1 ? "User is active" : "User is inactive"}
        className="capitalize"
      >
        {getStatusLabel(status)}
      </EnhancedBadge>
    );
  },
}
```

## Theme Colors

All status variants use theme-aware colors that adapt to light/dark mode:

```typescript
// Light mode: darker text on light background
// Dark mode: lighter text on dark background

success: bg-green-600/10 text-green-600 (light)
         bg-green-400/10 text-green-400 (dark)

error:   bg-destructive/10 text-destructive (uses theme destructive color)

warning: bg-yellow-600/10 text-yellow-600 (light)
         bg-yellow-400/10 text-yellow-400 (dark)

info:    bg-blue-600/10 text-blue-600 (light)
         bg-blue-400/10 text-blue-400 (dark)

neutral: bg-muted text-muted-foreground (uses theme muted colors)
```

## Accessibility

- Tooltip implementation uses Radix UI Tooltip with full ARIA support
- Proper focus states with `focus-visible:ring-*`
- Semantic color contrast ratios meet WCAG standards
- Screen reader friendly with proper labeling

## Extending

### Adding New Status Variants

Edit `components/ui/enhanced-badge.tsx`:

```typescript
const enhancedBadgeVariants = cva("", {
  variants: {
    status: {
      // ... existing variants
      custom: "bg-purple-600/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400",
    },
  },
});
```

### Adding New Features

The component is designed for extension:

```typescript
export interface EnhancedBadgeProps {
  // Add new props here
  badge?: string; // e.g., notification count
  interactive?: boolean; // e.g., clickable badges
}
```

## Notes

- Does not modify core ShadCN Badge component
- All colors use theme tokens (no hardcoded values)
- Fully compatible with TailwindCSS theme system
- Tooltip only renders when `tooltip` prop is provided (performance optimized)
