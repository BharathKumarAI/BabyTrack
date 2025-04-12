"use client";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from 'next/navigation';

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
}

const navigationItems = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/log", icon: "log", label: "Log" },
  { href: "/calendar", icon: "calendar", label: "Calendar" },
  { href: "/journal", icon: "journal", label: "Journal" },
  { href: "/settingsIcon", icon: "settingsIcon", label: "Settings" },
];

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(({
  className,
  ...props
}, ref) => {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 bg-secondary border-t z-50",
        className
      )}
      ref={ref}
      {...props}
    >
      <div className="container max-w-full flex items-center justify-around p-3">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center px-3 py-2 rounded-md hover:bg-accent transition-colors",
              {
                "text-accent-foreground": pathname === item.href,
              }
            )}
          >
            {/* @ts-expect-error */}
            <Icons[item.icon] className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
});
Navbar.displayName = "Navbar";

export { Navbar };
