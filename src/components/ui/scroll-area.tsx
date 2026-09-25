import * as React from "react";
import { cn } from "@/lib/utils";

// Lightweight scroll area (native overflow + styled thin scrollbar) instead of the
// Radix ScrollArea primitive, to keep the dependency surface small.
const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("relative overflow-y-auto scrollbar-thin", className)} {...props}>
      {children}
    </div>
  )
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
