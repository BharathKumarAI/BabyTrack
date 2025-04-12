import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to TinyTracker!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your all-in-one baby tracking app. Get started by logging your baby's activities!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

