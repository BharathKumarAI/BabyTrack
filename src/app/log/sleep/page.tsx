import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SleepLogPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sleep Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Record sleep duration and patterns here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

