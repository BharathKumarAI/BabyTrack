'use client';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface JournalEntry {
  id: string;
  date: string;
  content: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState("");

  const handleAddEntry = () => {
    if (content.trim() === "") return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      content,
    };

    setEntries([...entries, newEntry]);
    setContent(""); // Clear the input after adding
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Journal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label htmlFor="journal-entry">New Entry</Label>
            <Textarea
              id="journal-entry"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your journal entry here..."
              rows={4}
            />
            <Button onClick={handleAddEntry} className="w-full">
              Add Entry
            </Button>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Past Entries</h3>
            {entries.length === 0 ? (
              <p className="text-muted-foreground">No entries yet.</p>
            ) : (
              <ul className="space-y-2">
                {entries.map((entry) => (
                  <li key={entry.id} className="border-b pb-2">
                    <p className="font-medium">{entry.date}</p>
                    <p>{entry.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}