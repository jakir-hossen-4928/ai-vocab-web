import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

import { useNative } from "@/hooks/useNative";

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, onClick, ...props }, ref) => {
    const { haptic } = useNative();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      haptic('light');
      onClick?.(e);
    };

    return (
      <RouterNavLink
        ref={ref}
        to={to}
        onClick={handleClick}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
