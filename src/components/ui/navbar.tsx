"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {}

const navigationItems = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/health", icon: "health", label: "Health" },
  { href: "/log", icon: "log", label: "Log" },
  { href: "/expenses", icon: "expenses", label: "Expenses" },
  { href: "/calendar", icon: "calendar", label: "Calendar" },
  { href: "/journal", icon: "journal", label: "Journal" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ className, ...props }, ref) => {
    const pathname = usePathname();

    return (
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-background border-t border-border shadow-md",
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="container max-w-full flex items-center justify-around p-3">
          {navigationItems.map((item) => {
            const Icon = Icons[item.icon];
            const isActive = 
              item.href === "/" 
                ? pathname === "/" 
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center px-4 py-2 rounded-md transition-all duration-200",
                  isActive
                    ? "text-accent-foreground font-semibold"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {Icon && (
                  <Icon
                    className={cn("h-6 w-6 mb-1", {
                      "text-primary": isActive,
                      "text-muted-foreground": !isActive,
                    })}
                  />
                )}
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }
);

Navbar.displayName = "Navbar";

export { Navbar };
