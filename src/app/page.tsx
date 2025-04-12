'use client';

import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useRouter} from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-20">
      <Card className="w-full max-w-md shadow-lg border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Welcome to TinyTracker!
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground">
            Your all-in-one baby tracking app. Get started by logging your
            baby's activities!
          </p>
          <Button onClick={() => router.push('/log')} className="w-full">
            Go to Log
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
