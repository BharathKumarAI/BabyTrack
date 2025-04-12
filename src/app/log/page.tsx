'use client';

import React from "react"; // 👈 This is the important missing line!
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
    <div className="flex flex-col items-center justify-start min-h-screen pt-20 bg-pink-50">
      <Card className="w-full max-w-md shadow-lg border-pink-200">
        <CardHeader>
          <CardTitle className="text-2xl text-pink-800">Log Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {logModules.map((module) => {
            const Icon = Icons[module.icon as keyof typeof Icons];
            return (
              <Link
                key={module.href}
                href={module.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-pink-100 border border-pink-200 transition-all"
              >
                {Icon && <Icon className="h-5 w-5 text-pink-600" />}
                <span className="text-pink-900 font-medium">{module.label}</span>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
