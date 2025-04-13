'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
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
  AvatarImage
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Updated log modules to match your folder structure
const logModules = [
  { href: "/log/diaper", icon: "diaper", label: "Diaper", color: "bg-blue-50 border-blue-200 hover:bg-blue-100", iconColor: "text-blue-600" },
  { href: "/log/feeding", icon: "feeding", label: "Feeding", color: "bg-green-50 border-green-200 hover:bg-green-100", iconColor: "text-green-600" },
  { href: "/log/sleep", icon: "sleep", label: "Sleep", color: "bg-purple-50 border-purple-200 hover:bg-purple-100", iconColor: "text-purple-600" },
  { href: "/log/growth", icon: "growth", label: "Growth", color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100", iconColor: "text-yellow-600" },
  { href: "/log/medication", icon: "medication", label: "Medication", color: "bg-red-50 border-red-200 hover:bg-red-100", iconColor: "text-red-600" },
  { href: "/log/mood", icon: "mood", label: "Mood", color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100", iconColor: "text-indigo-600" },
  { href: "/log/vaccination", icon: "vaccination", label: "Vaccination", color: "bg-teal-50 border-teal-200 hover:bg-teal-100", iconColor: "text-teal-600" },
  { href: "/log/photo", icon: "photo", label: "Photo", color: "bg-orange-50 border-orange-200 hover:bg-orange-100", iconColor: "text-orange-600" },
];

export default function LogPage() {
  const router = useRouter();
  const { 
    profiles, 
    activeProfileId, 
    activeProfileData, 
    setActiveProfileId,
    calculateAge
  } = useBabyProfile();

  const getInitials = (name: string) => {
    if (!name) return "B";
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
    <div className="flex flex-col items-center justify-start min-h-screen pt-4 px-4 pb-20">
      {/* Profile selector */}
      <div className="w-full max-w-4xl mb-6">
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {activeProfileData ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 p-2 hover:bg-accent">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                          {activeProfileData.photoUrl ? (
                            <AvatarImage src={activeProfileData.photoUrl} alt={activeProfileData.name} />
                          ) : (
                            <AvatarFallback className={getAvatarColor(activeProfileData.gender)}>
                              {getInitials(activeProfileData.name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="text-left">
                          <div className="font-medium">{activeProfileData.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {calculateAge(activeProfileData.birthDate)}
                          </div>
                        </div>
                        <Icons.chevronDown className="h-4 w-4 text-muted-foreground ml-1" />
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
                            profile.id === activeProfileId && "bg-primary/10"
                          )}
                        >
                          <Avatar className="h-8 w-8">
                            {profile.photoUrl ? (
                              <AvatarImage src={profile.photoUrl} alt={profile.name} />
                            ) : (
                              <AvatarFallback className={getAvatarColor(profile.gender)}>
                                {getInitials(profile.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            {profile.name}
                            <div className="text-xs text-muted-foreground">
                              {calculateAge(profile.birthDate)}
                            </div>
                          </div>
                          {profile.id === activeProfileId && (
                            <Badge variant="outline" className="ml-2 bg-primary/10">Active</Badge>
                          )}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <Link href="/settings">
                        <DropdownMenuItem className="cursor-pointer">
                          <Icons.settings className="mr-2 h-4 w-4" />
                          <span>Manage Profiles</span>
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/settings">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Icons.add className="h-4 w-4" />
                      <span>Add Baby Profile</span>
                    </Button>
                  </Link>
                )}
                
                <div className="ml-2">
                  <h1 className="text-xl font-bold">Activity Log</h1>
                  {activeProfileData && (
                    <p className="text-sm text-muted-foreground">
                      Track and monitor {activeProfileData.name}'s activities
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="w-full max-w-4xl">
        {!activeProfileData ? (
          <Card className="mb-8 border shadow-md">
            <CardContent className="pt-6 pb-6">
              <div className="text-center">
                <Icons.baby className="h-12 w-12 text-primary mx-auto mb-2" />
                <h2 className="text-xl font-semibold mb-2">Welcome to BabyTracker!</h2>
                <p className="text-muted-foreground mb-4">
                  Please set up a baby profile to start tracking activities.
                </p>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => router.push('/settings')}
                >
                  Create Baby Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {logModules.map((module) => {
                const Icon = Icons[module.icon];
                return (
                  <Card 
                    key={module.href} 
                    className={cn(
                      "cursor-pointer transition-all border shadow-sm hover:shadow-md",
                      module.color
                    )}
                    onClick={() => router.push(module.href)}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      {Icon && <Icon className={cn("h-8 w-8 mb-2", module.iconColor)} />}
                      <span className="text-gray-800 font-medium text-center">{module.label}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Icons.activity className="h-5 w-5 mr-2 text-primary" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <Icons.clock className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No recent activities recorded for {activeProfileData.name}.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Activities will appear here once you start logging them.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Icons.calendar className="h-5 w-5 mr-2 text-primary" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <Icons.calendar className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No upcoming events scheduled for {activeProfileData.name}.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => router.push('/calendar')}
                    >
                      <Icons.calendar className="h-4 w-4 mr-2" />
                      View Calendar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}