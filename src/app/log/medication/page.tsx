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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';
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
import { format, addDays, addHours, parseISO } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBabyProfile } from '@/app/BabyProfileContext';

interface MedicationEntry {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  notes: string;
  timeOfDay: string[];
  active: boolean;
  reminderEnabled: boolean;
  babyId: string; // Add babyId to associate entries with specific babies
}

export default function MedicationLogPage() {
  const { activeProfileData } = useBabyProfile();
  const [entries, setEntries] = useState<MedicationEntry[]>([]);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<string[]>(['morning']);
  const [active, setActive] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  // Load data from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('medicationLogs');
    if (savedEntries) setEntries(JSON.parse(savedEntries));
  }, []);

  // Save data to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('medicationLogs', JSON.stringify(entries));
    
    // Update calendar events when medications with reminders change
    const calendarEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    
    // Remove all medication reminders
    const filteredEvents = calendarEvents.filter((event: any) => 
      event.type !== 'medication'
    );
    
    // Add current medication reminders
    const medicationEvents = entries
      .filter(med => med.active && med.reminderEnabled && 
               (!activeProfileData || med.babyId === activeProfileData.id))
      .flatMap(med => {
        const events = [];
        const start = parseISO(med.startDate);
        const end = med.endDate ? parseISO(med.endDate) : addDays(new Date(), 365);
        
        // Create events based on frequency
        let currentDate = start;
        while (currentDate <= end) {
          med.timeOfDay.forEach(time => {
            let hour = 8; // Default morning
            if (time === 'afternoon') hour = 12;
            if (time === 'evening') hour = 18;
            if (time === 'night') hour = 21;
            
            events.push({
              id: `med-${med.id}-${format(currentDate, 'yyyy-MM-dd')}-${time}`,
              title: `${med.name} (${med.dosage})`,
              date: format(addHours(currentDate, hour), "yyyy-MM-dd'T'HH:mm:ss"),
              type: 'medication',
              description: `Take ${med.dosage} of ${med.name}. ${med.notes}`,
              babyId: med.babyId
            });
          });
          
          // Advance date based on frequency
          if (med.frequency === 'daily') {
            currentDate = addDays(currentDate, 1);
          } else if (med.frequency === 'every-other-day') {
            currentDate = addDays(currentDate, 2);
          } else if (med.frequency === 'weekly') {
            currentDate = addDays(currentDate, 7);
          } else if (med.frequency === 'twice-daily') {
            currentDate = addDays(currentDate, 1);
          } else if (med.frequency === 'as-needed') {
            break; // No recurring events for as-needed
          }
        }
        
        return events;
      });
    
    // Save updated calendar events
    localStorage.setItem('calendarEvents', JSON.stringify([...filteredEvents, ...medicationEvents]));
  }, [entries, activeProfileData]);

  const handleTimeOfDayChange = (time: string) => {
    if (timeOfDay.includes(time)) {
      setTimeOfDay(timeOfDay.filter(t => t !== time));
    } else {
      setTimeOfDay([...timeOfDay, time]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage || !frequency || !startDate || timeOfDay.length === 0 || !activeProfileData) return;

    const entry: MedicationEntry = {
      id: editId || Date.now().toString(),
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      notes,
      timeOfDay,
      active,
      reminderEnabled,
      babyId: activeProfileData.id
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
    setDosage('');
    setFrequency('daily');
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate('');
    setNotes('');
    setTimeOfDay(['morning']);
    setActive(true);
    setReminderEnabled(false);
  };

  const handleEdit = (entry: MedicationEntry) => {
    setEditId(entry.id);
    setName(entry.name);
    setDosage(entry.dosage);
    setFrequency(entry.frequency);
    setStartDate(entry.startDate);
    setEndDate(entry.endDate);
    setNotes(entry.notes);
    setTimeOfDay(entry.timeOfDay);
    setActive(entry.active);
    setReminderEnabled(entry.reminderEnabled);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const toggleActive = (id: string) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, active: !entry.active } : entry
    ));
  };

  const getFrequencyText = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Daily';
      case 'twice-daily': return 'Twice Daily';
      case 'every-other-day': return 'Every Other Day';
      case 'weekly': return 'Weekly';
      case 'as-needed': return 'As Needed';
      default: return freq;
    }
  };

  const getTimeOfDayText = (times: string[]) => {
    return times.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
  };

  // Filter entries for the active baby and by active status
  const filteredEntries = activeProfileData 
    ? entries.filter(entry => 
        entry.babyId === activeProfileData.id && 
        (activeTab === 'active' ? entry.active : !entry.active)
      )
    : [];

  // If no active profile, show a message
  if (!activeProfileData) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen pt-20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Medication Log</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center py-4">
              Please set up a baby profile in the settings page first.
            </p>
            <Button 
              className="w-full mt-4"
              onClick={() => window.location.href = '/settings'}
            >
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-20 px-4">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle className="text-2xl">Medication Log for {activeProfileData.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Medication Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input 
                  id="dosage" 
                  value={dosage} 
                  onChange={(e) => setDosage(e.target.value)} 
                  required 
                  placeholder="e.g., 10mg, 1 tablet"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={frequency} 
                  onValueChange={setFrequency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice-daily">Twice Daily</SelectItem>
                    <SelectItem value="every-other-day">Every Other Day</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="as-needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </div>
            </div>

            <div>
              <Label>Time of Day</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={timeOfDay.includes('morning')} 
                    onCheckedChange={() => handleTimeOfDayChange('morning')} 
                  />
                  <Label>Morning</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={timeOfDay.includes('afternoon')} 
                    onCheckedChange={() => handleTimeOfDayChange('afternoon')} 
                  />
                  <Label>Afternoon</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={timeOfDay.includes('evening')} 
                    onCheckedChange={() => handleTimeOfDayChange('evening')} 
                  />
                  <Label>Evening</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={timeOfDay.includes('night')} 
                    onCheckedChange={() => handleTimeOfDayChange('night')} 
                  />
                  <Label>Night</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Additional instructions or notes"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                checked={active} 
                onCheckedChange={setActive} 
                id="active"
              />
              <Label htmlFor="active">Active Medication</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                checked={reminderEnabled} 
                onCheckedChange={setReminderEnabled} 
                id="reminder"
              />
              <Label htmlFor="reminder">Enable Reminders</Label>
            </div>

            <Button type="submit" className="w-full">
              {editId ? 'Update Medication' : 'Add Medication'}
            </Button>
          </form>

          <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Medications</TabsTrigger>
              <TabsTrigger value="inactive">Inactive Medications</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-4">
              {filteredEntries.length > 0 ? (
                <Table>
                  <TableCaption>Active medications for {activeProfileData.name}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Time of Day</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Reminders</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell>{entry.dosage}</TableCell>
                        <TableCell>{getFrequencyText(entry.frequency)}</TableCell>
                        <TableCell>{getTimeOfDayText(entry.timeOfDay)}</TableCell>
                        <TableCell>{entry.startDate}</TableCell>
                        <TableCell>{entry.endDate || 'Ongoing'}</TableCell>
                        <TableCell>{entry.reminderEnabled ? 'Enabled' : 'Disabled'}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleActive(entry.id)}>
                            Deactivate
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this medication? This action cannot be undone.
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
                <p className="text-center py-4 text-muted-foreground">No active medications found.</p>
              )}
            </TabsContent>
            <TabsContent value="inactive" className="mt-4">
              {filteredEntries.length > 0 ? (
                <Table>
                  <TableCaption>Inactive medications for {activeProfileData.name}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Time of Day</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell>{entry.dosage}</TableCell>
                        <TableCell>{getFrequencyText(entry.frequency)}</TableCell>
                        <TableCell>{getTimeOfDayText(entry.timeOfDay)}</TableCell>
                        <TableCell>{entry.startDate}</TableCell>
                        <TableCell>{entry.endDate || 'Ongoing'}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleActive(entry.id)}>
                            Activate
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this medication? This action cannot be undone.
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
                <p className="text-center py-4 text-muted-foreground">No inactive medications found.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}