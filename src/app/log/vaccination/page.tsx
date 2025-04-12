import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VaccinationLogPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Vaccination Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Securely store vaccination records and provide reminders for upcoming doses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
