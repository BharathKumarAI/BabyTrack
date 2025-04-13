'use client';

import React from "react";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useBabyProfile } from "@/app/BabyProfileContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { 
  ChevronDown, 
  Baby, 
  Settings, 
  UserPlus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Updated paths to include "/log/" prefix and add "Expenses" module
const logModules = [
  { href: "/log/diaper", icon: "diaper", label: "Diaper", color: "bg-blue-50 border-blue-200 hover:bg-blue-100", iconColor: "text-blue-600" },
  { href: "/log/feeding", icon: "feeding", label: "Feeding", color: "bg-green-50 border-green-200 hover:bg-green-100", iconColor: "text-green-600" },
  { href: "/log/sleep", icon: "sleep", label: "Sleep", color: "bg-purple-50 border-purple-200 hover:bg-purple-100", iconColor: "text-purple-600" },
  { href: "/log/growth", icon: "growth", label: "Growth", color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100", iconColor: "text-yellow-600" },
  { href: "/log/medication", icon: "medication", label: "Medication", color: "bg-red-50 border-red-200 hover:bg-red-100", iconColor: "text-red-600" },
  { href: "/log/mood", icon: "mood", label: "Mood", color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100", iconColor: "text-indigo-600" },
  { href: "/log/vaccination", icon: "vaccination", label: "Vaccination", color: "bg-teal-50 border-teal-200 hover:bg-teal-100", iconColor: "text-teal-600" },
  { href: "/log/photo", icon: "photo", label: "Photo", color: "bg-orange-50 border-orange-200 hover:bg-orange-100", iconColor: "text-orange-600" },
  {
    name: "Health",
    description: "Track health conditions, symptoms, and treatments",
    icon: "medication", // Make sure this icon exists in your icons.ts
    href: "/log/health",
  },
];

export default function LogPage() {
  const { 
    profiles, 
    activeProfileId, 
    activeProfileData, 
    setActiveProfileId,
    calculateAge
  } = useBabyProfile();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (gender: string) => {
    return gender === 'male' ? 'bg-blue-200' : 'bg-pink-200';
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Banner with active baby profile */}
      <div className="w-full bg-white shadow-md mb-8">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-pink-800 hidden md:block">Baby Tracker</h1>
            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
            
            {activeProfileData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-pink-50">
                    <Avatar className="h-10 w-10 border-2 border-pink-200">
                      <AvatarFallback className={getAvatarColor(activeProfileData.gender)}>
                        {getInitials(activeProfileData.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="font-medium">{activeProfileData.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {calculateAge(activeProfileData.birthDate)}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Switch Baby Profile</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {profiles.filter(p => p.active).map(profile => (
                    <DropdownMenuItem 
                      key={profile.id}
                      onClick={() => setActiveProfileId(profile.id)}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        profile.id === activeProfileId && "bg-pink-50"
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={getAvatarColor(profile.gender)}>
                          {getInitials(profile.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        {profile.name}
                        <div className="text-xs text-muted-foreground">
                          {calculateAge(profile.birthDate)}
                        </div>
                      </div>
                      {profile.id === activeProfileId && (
                        <Badge variant="outline" className="ml-2 bg-pink-100">Active</Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <Link href="/settings">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Manage Profiles</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/settings">
                <Button variant="outline" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Add Baby Profile</span>
                </Button>
              </Link>
            )}
          </div>
          
          <Link href="/calendar">
            <Button variant="outline" className="bg-white hover:bg-pink-50">
              Calendar
            </Button>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-4xl px-4 pb-12">
        {!activeProfileData ? (
          <Card className="mb-8 border-pink-200 shadow-md">
            <CardContent className="pt-6 pb-6">
              <div className="text-center">
                <Baby className="h-12 w-12 text-pink-400 mx-auto mb-2" />
                <h2 className="text-xl font-semibold mb-2">Welcome to Baby Tracker!</h2>
                <p className="text-muted-foreground mb-4">
                  Please set up a baby profile to start tracking activities.
                </p>
                <Link href="/settings">
                  <Button className="bg-pink-600 hover:bg-pink-700">
                    Create Baby Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-pink-800 mb-6">
              Track {activeProfileData.name}'s Activities
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {logModules.map((module) => {
                const Icon = Icons[module.icon as keyof typeof Icons];
                return (
                  <Link
                    key={module.href}
                    href={module.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 px-4 py-6 rounded-xl border transition-all shadow-sm hover:shadow-md",
                      module.color
                    )}
                  >
                    {Icon && <Icon className={cn("h-8 w-8", module.iconColor)} />}
                    <span className="text-gray-800 font-medium text-center">{module.label}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-blue-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-blue-800">Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No recent activities recorded for {activeProfileData.name}.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-green-800">Upcoming</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No upcoming events scheduled for {activeProfileData.name}.
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}