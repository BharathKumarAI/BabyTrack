import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function JournalPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Journal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is the journal page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
