"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {}

const navigationItems = [
  { href: "/", icon: "dashboard", label: "Home" },
  { href: "/log", icon: "log", label: "Log" },
  { href: "/calendar", icon: "calendar", label: "Calendar" },
  { href: "/journal", icon: "journal", label: "Journal" },
  { href: "/settings", icon: "settingsIcon", label: "Settings" },
];

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ className, ...props }, ref) => {
    const pathname = usePathname();

    return (
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-pink-100 border-t border-pink-300 shadow-md",
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="container max-w-full flex items-center justify-around py-3">
          {navigationItems.map((item) => {
            const Icon = Icons[item.icon as keyof typeof Icons];
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-pink-200 text-pink-800 scale-105 shadow-inner"
                    : "hover:bg-pink-50 text-pink-500"
                )}
              >
                {Icon && (
                  <Icon
                    className={cn("h-6 w-6 mb-1", {
                      "text-pink-700": isActive,
                      "text-pink-400": !isActive,
                    })}
                  />
                )}
                <span className="text-xs font-medium">{item.label}</span>
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