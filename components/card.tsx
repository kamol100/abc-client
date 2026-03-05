import * as React from "react";
import { Card as ShadcnCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <ShadcnCard ref={ref} className={cn("rounded-lg", className)} {...props} />;
  }
);

Card.displayName = "Card";

export default Card;
