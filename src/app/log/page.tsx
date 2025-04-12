import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const logModules = [
  { href: "/log/feeding", icon: "feeding", label: "Feeding" },
  { href: "/log/diaper", icon: "diaper", label: "Diaper" },
  { href: "/log/sleep", icon: "sleep", label: "Sleep" },
  { href: "/log/growth", icon: "growth", label: "Growth" },
  { href: "/log/medication", icon: "medication", label: "Medication" },
  { href: "/log/mood", icon: "mood", label: "Mood" },
  { href: "/log/vaccination", icon: "vaccination", label: "Vaccination" },
  { href: "/log/photo", icon: "photo", label: "Photo" },
];

export default function LogPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Log Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {logModules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="flex items-center justify-start px-4 py-2 rounded-md hover:bg-accent transition-colors"
            >
              {/* @ts-expect-error */}
              <Icons[module.icon] className="h-5 w-5 mr-2" />
              <span>{module.label}</span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

