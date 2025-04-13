'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription
} from '@/components/ui/alert-dialog';
import { format, addDays, parseISO, subDays } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface VaccinationEntry {
  id: string;
  name: string;
  date: string;
  nextDueDate: string | null;
  location: string;
  notes: string;
  reminderEnabled: boolean;
  reminderDays: number;
}

export default function VaccinationLogPage() {
  const [entries, setEntries] = useState<VaccinationEntry[]>([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [nextDueDate, setNextDueDate] = useState<string>('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDays, setReminderDays] = useState(7);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('completed');

  // Load data from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('vaccinationLogs');
    if (savedEntries) setEntries(JSON.parse(savedEntries));
  }, []);

  // Save data to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('vaccinationLogs', JSON.stringify(entries));
    
    // Update calendar events when vaccinations with reminders change
    const calendarEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    
    // Remove all vaccination reminders
    const filteredEvents = calendarEvents.filter((event: any) => 
      event.type !== 'vaccination' && event.type !== 'vaccination-reminder'
    );
    
    // Add current vaccination events and reminders
    const vaccinationEvents = entries.flatMap(vac => {
      const events = [];
      
      // Add the actual vaccination date to calendar if it's in the future
      if (new Date(vac.date) > new Date()) {
        events.push({
          id: `vac-${vac.id}`,
          title: `Vaccination: ${vac.name}`,
          date: `${vac.date}T09:00:00`,
          type: 'vaccination',
          description: `Vaccination appointment for ${vac.name} at ${vac.location}. ${vac.notes}`
        });
      }
      
      // Add next due date to calendar
      if (vac.nextDueDate) {
        events.push({
          id: `vac-next-${vac.id}`,
          title: `Due: ${vac.name} Vaccination`,
          date: `${vac.nextDueDate}T09:00:00`,
          type: 'vaccination',
          description: `${vac.name} vaccination is due. ${vac.notes}`
        });
        
        // Add reminder if enabled
        if (vac.reminderEnabled && vac.reminderDays > 0) {
          const reminderDate = format(
            subDays(parseISO(vac.nextDueDate), vac.reminderDays),
            'yyyy-MM-dd'
          );
          
          events.push({
            id: `vac-reminder-${vac.id}`,
            title: `Reminder: ${vac.name} Vaccination Due in ${vac.reminderDays} days`,
            date: `${reminderDate}T09:00:00`,
            type: 'vaccination-reminder',
            description: `Reminder: ${vac.name} vaccination will be due in ${vac.reminderDays} days.`
          });
        }
      }
      
      return events;
    });
    
    // Save updated calendar events
    localStorage.setItem('calendarEvents', JSON.stringify([...filteredEvents, ...vaccinationEvents]));
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;

    const entry: VaccinationEntry = {
      id: editId || Date.now().toString(),
      name,
      date,
      nextDueDate: nextDueDate || null,
      location,
      notes,
      reminderEnabled,
      reminderDays
    };

    if (editId) {
      setEntries(prev => prev.map(e => (e.id === editId ? entry : e)));
      setEditId(null);
    } else {
      setEntries(prev => [...prev, entry]);
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setNextDueDate('');
    setLocation('');
    setNotes('');
    setReminderEnabled(false);
    setReminderDays(7);
  };

  const handleEdit = (entry: VaccinationEntry) => {
    setEditId(entry.id);
    setName(entry.name);
    setDate(entry.date);
    setNextDueDate(entry.nextDueDate || '');
    setLocation(entry.location);
    setNotes(entry.notes);
    setReminderEnabled(entry.reminderEnabled);
    setReminderDays(entry.reminderDays);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const isUpcoming = (entry: VaccinationEntry) => {
    return new Date(entry.date) > new Date();
  };

  const isDue = (entry: VaccinationEntry) => {
    return entry.nextDueDate && new Date(entry.nextDueDate) <= new Date();
  };

  const filteredEntries = entries.filter(entry => {
    if (activeTab === 'completed') {
      return !isUpcoming(entry) && !isDue(entry);
    } else if (activeTab === 'upcoming') {
      return isUpcoming(entry);
    } else if (activeTab === 'due') {
      return isDue(entry);
    }
    return true;
  });

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-20 px-4">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle className="text-2xl">Vaccination Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Vaccination Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="e.g., DTaP, MMR, Flu Shot"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="e.g., Pediatrician's Office, Health Clinic"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Vaccination Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="nextDueDate">Next Due Date (Optional)</Label>
                <Input 
                  id="nextDueDate" 
                  type="date" 
                  value={nextDueDate} 
                  onChange={(e) => setNextDueDate(e.target.value)} 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Additional information, reactions, or notes"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                checked={reminderEnabled} 
                onCheckedChange={setReminderEnabled} 
                id="reminder"
              />
              <Label htmlFor="reminder">Enable Reminder for Next Due Date</Label>
            </div>

            {reminderEnabled && (
              <div>
                <Label htmlFor="reminderDays">Remind me days before due date</Label>
                <Input 
                  id="reminderDays" 
                  type="number" 
                  min="1" 
                  max="90" 
                  value={reminderDays} 
                  onChange={(e) => setReminderDays(parseInt(e.target.value))} 
                />
              </div>
            )}

            <Button type="submit" className="w-full">
              {editId ? 'Update Vaccination' : 'Add Vaccination'}
            </Button>
          </form>

          <Tabs defaultValue="completed" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="due">Due Now</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              {filteredEntries.length > 0 ? (
                <Table>
                  <TableCaption>
                    {activeTab === 'completed' ? 'Completed vaccinations' : 
                     activeTab === 'upcoming' ? 'Upcoming vaccinations' : 'Due vaccinations'}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vaccination</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Next Due Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Reminder</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell>
                          {entry.date}
                          {isUpcoming(entry) && (
                            <Badge className="ml-2" variant="outline">Upcoming</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.nextDueDate || 'N/A'}
                          {isDue(entry) && (
                            <Badge className="ml-2" variant="destructive">Due</Badge>
                          )}
                        </TableCell>
                        <TableCell>{entry.location}</TableCell>
                        <TableCell>
                          {entry.nextDueDate && entry.reminderEnabled 
                            ? `${entry.reminderDays} days before` 
                            : 'Disabled'}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this vaccination record? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No {activeTab === 'completed' ? 'completed' : 
                      activeTab === 'upcoming' ? 'upcoming' : 'due'} vaccinations found.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}