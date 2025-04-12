import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DiaperLogPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Diaper Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Log diaper changes here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

