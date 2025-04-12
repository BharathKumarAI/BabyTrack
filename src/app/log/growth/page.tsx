import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GrowthLogPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Growth Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Enter weight, height, and head circumference measurements here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

