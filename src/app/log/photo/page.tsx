import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PhotoLogPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Photo Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Secure photo storage with tagging, chronological display, and album creation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

