"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {}

const navigationItems = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/log", icon: "log", label: "Log" },
  { href: "/calendar", icon: "calendar", label: "Calendar" },
  { href: "/journal", icon: "journal", label: "Journal" },
  { href: "/settingsIcon", icon: "settingsIcon", label: "Settings" },
];

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ className, ...props }, ref) => {
    const pathname = usePathname();

    return (
      
        <div className="container max-w-full flex items-center justify-around p-3">
          {navigationItems.map((item) => {
            const Icon = Icons[item.icon as keyof typeof Icons];
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-2 rounded-md hover:bg-accent transition-colors",
                  {
                    "text-accent-foreground": isActive,
                  }
                )}
              >
                {Icon && <Icon className={cn("h-5 w-5", {
                    "text-accent-foreground": isActive,
                  })
                } />}
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      
    );
  }
);

Navbar.displayName = "Navbar";

export { Navbar };
