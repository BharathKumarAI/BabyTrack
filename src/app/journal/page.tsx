'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useBabyProfile } from "@/app/BabyProfileContext";
import { Icons } from "@/components/icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JournalEntry {
  id: string;
  babyId: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  milestone: boolean;
}

export default function JournalPage() {
  const { activeProfileData } = useBabyProfile();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("happy");
  const [milestone, setMilestone] = useState(false);
  const [filter, setFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load entries from localStorage
  useEffect(() => {
    if (activeProfileData?.id) {
      const storedEntries = localStorage.getItem('journalEntries');
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries);
        // Filter entries for active baby
        const filteredEntries = parsedEntries.filter(
          (entry: JournalEntry) => entry.babyId === activeProfileData.id
        );
        setEntries(filteredEntries);
      }
    }
  }, [activeProfileData?.id]);

  const handleAddEntry = () => {
    if (!title.trim() || !content.trim() || !activeProfileData) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      babyId: activeProfileData.id,
      date: new Date().toISOString(),
      title: title.trim(),
      content: content.trim(),
      mood,
      milestone,
    };

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    saveEntriesToLocalStorage(updatedEntries);
    
    // Clear the form
    setTitle("");
    setContent("");
    setMood("happy");
    setMilestone(false);
  };

  const handleUpdateEntry = () => {
    if (!editEntry || !title.trim() || !content.trim()) return;
    
    const updatedEntries = entries.map(entry => 
      entry.id === editEntry.id 
        ? { ...entry, title, content, mood, milestone }
        : entry
    );
    
    setEntries(updatedEntries);
    saveEntriesToLocalStorage(updatedEntries);
    setEditEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    saveEntriesToLocalStorage(updatedEntries);
    setDeleteId(null);
  };

  const saveEntriesToLocalStorage = (updatedEntries: JournalEntry[]) => {
    const storedEntries = localStorage.getItem('journalEntries');
    let allEntries = storedEntries ? JSON.parse(storedEntries) : [];
    
    // Remove entries for this baby
    if (activeProfileData?.id) {
      allEntries = allEntries.filter(
        (entry: JournalEntry) => entry.babyId !== activeProfileData.id
      );
    }
    
    // Add updated entries
    allEntries = [...allEntries, ...updatedEntries];
    localStorage.setItem('journalEntries', JSON.stringify(allEntries));
  };

  const startEditEntry = (entry: JournalEntry) => {
    setEditEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setMilestone(entry.milestone);
  };

  const cancelEdit = () => {
    setEditEntry(null);
    setTitle("");
    setContent("");
    setMood("happy");
    setMilestone(false);
  };

  const getFilteredEntries = () => {
    let filtered = [...entries];
    
    // Apply filter
    if (filter === "milestones") {
      filtered = filtered.filter(entry => entry.milestone);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        entry => 
          entry.title.toLowerCase().includes(term) || 
          entry.content.toLowerCase().includes(term)
      );
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const getMoodIcon = (moodType: string) => {
    switch (moodType) {
      case "happy":
        return <Icons.happyMood className="h-5 w-5 text-green-500" />;
      case "sad":
        return <Icons.sadMood className="h-5 w-5 text-blue-500" />;
      case "excited":
        return <Icons.excitedMood className="h-5 w-5 text-yellow-500" />;
      case "tired":
        return <Icons.upsetMood className="h-5 w-5 text-purple-500" />;
      default:
        return <Icons.happyMood className="h-5 w-5 text-green-500" />;
    }
  };

  if (!activeProfileData) {
    return (
      <div className="flex flex-col items-center justify-start pt-4">
        <Card className="w-full shadow-lg border">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Icons.alertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">
                Please set up a baby profile in settings to use the journal.
              </p>
              <Button onClick={() => window.location.href = '/settings'} className="w-full mt-4">
                Go to Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start space-y-4 pb-20">
      <Card className="w-full border shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Journal</h1>
              <p className="text-sm text-muted-foreground">
                Recording memories for {activeProfileData.name}
              </p>
            </div>
            <Icons.journal className="h-8 w-8 md:h-10 md:w-10 text-teal-500" />
          </div>
        </CardContent>
      </Card>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 shadow-md border">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              {editEntry ? "Edit Entry" : "New Entry"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label htmlFor="entry-title" className="text-sm font-medium">Title</Label>
                <Input
                  id="entry-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your entry"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="entry-content" className="text-sm font-medium">Content</Label>
                <Textarea
                  id="entry-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your journal entry here..."
                  rows={6}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="entry-mood" className="text-sm font-medium">Mood</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger id="entry-mood" className="mt-1">
                    <SelectValue placeholder="Select Mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="sad">Sad</SelectItem>
                    <SelectItem value="excited">Excited</SelectItem>
                    <SelectItem value="tired">Tired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="milestone"
                  checked={milestone}
                  onChange={(e) => setMilestone(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <Label htmlFor="milestone" className="text-sm font-medium">
                  Mark as milestone
                </Label>
              </div>

              {editEntry ? (
                <div className="flex space-x-2 pt-2">
                  <Button 
                    onClick={handleUpdateEntry} 
                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
                    disabled={!title || !content}
                  >
                    Update Entry
                  </Button>
                  <Button 
                    onClick={cancelEdit} 
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleAddEntry} 
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white mt-2"
                  disabled={!title || !content}
                >
                  Add Entry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-md border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className="text-lg md:text-xl">Journal Entries</CardTitle>
              <div className="flex space-x-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Entries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entries</SelectItem>
                    <SelectItem value="milestones">Milestones</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="relative">
              <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-y-auto -mx-2 px-2">
              {getFilteredEntries().length > 0 ? (
                <div className="space-y-4">
                  {getFilteredEntries().map((entry) => (
                    <Card key={entry.id} className="border shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">{entry.title}</h3>
                            {entry.milestone && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                                Milestone
                              </span>
                            )}
                            <span className="ml-2">{getMoodIcon(entry.mood)}</span>
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => startEditEntry(entry)}
                              className="h-8 w-8 p-0"
                            >
                              <Icons.edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setDeleteId(entry.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Icons.delete className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.date), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-line">{entry.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icons.journal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {entries.length > 0 
                      ? "No entries match your search or filter criteria." 
                      : "No journal entries yet. Start recording your memories!"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Journal Entry</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this journal entry? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteId && handleDeleteEntry(deleteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}