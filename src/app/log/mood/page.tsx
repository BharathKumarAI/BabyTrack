import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MoodLogPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Mood Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Log baby and caregiver mood here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

