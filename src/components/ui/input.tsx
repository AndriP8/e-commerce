import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
  prefixIcon?: React.ReactElement;
  suffixIcon?: React.ReactElement;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefixIcon, suffixIcon, ...props }, ref) => {
    return (
      <div className="relative flex w-full items-center">
        {prefixIcon ? (
          <div className="absolute left-0 flex items-center pl-4 pr-2.5">
            {prefixIcon}
          </div>
        ) : null}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className,
            prefixIcon && "pl-12",
            suffixIcon && "pr-10",
          )}
          ref={ref}
          {...props}
        />
        {suffixIcon ? (
          <div className="absolute inset-y-0 right-0 ml-3 flex h-full items-center pl-2.5 pr-2.5">
            {suffixIcon}
          </div>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
