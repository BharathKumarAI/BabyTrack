'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useBabyProfile } from '@/app/BabyProfileContext';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  description?: string;
  type: 'custom' | 'medication' | 'vaccination' | 'vaccination-reminder';
  babyId?: string; // Add babyId to associate events with specific babies
}

export default function CalendarPage() {
  const { activeProfileData } = useBabyProfile();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState<string>(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [editId, setEditId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) setEvents(JSON.parse(savedEvents));
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  // Update selected events when date changes or active profile changes
  useEffect(() => {
    if (selectedDate) {
      const eventsOnDate = events.filter(event => 
        isSameDay(parseISO(event.date), selectedDate) && 
        (!event.babyId || event.babyId === activeProfileData?.id)
      );
      setSelectedEvents(eventsOnDate);
    } else {
      setSelectedEvents([]);
    }
  }, [selectedDate, events, activeProfileData]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleAddEvent = () => {
    if (!title || !eventDate) return;

    const newEvent: CalendarEvent = {
      id: editId || Date.now().toString(),
      title,
      date: eventDate,
      description,
      type: 'custom',
      babyId: activeProfileData?.id // Associate event with current baby
    };

    if (editId) {
      setEvents(prev => prev.map(e => (e.id === editId ? newEvent : e)));
      setEditId(null);
    } else {
      setEvents(prev => [...prev, newEvent]);
    }

    setTitle('');
    setDescription('');
    setEventDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    setShowAddDialog(false);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    if (event.type !== 'custom') {
      alert('System events cannot be edited directly. Please modify them from their source page (Medication or Vaccination).');
      return;
    }
    
    setEditId(event.id);
    setTitle(event.title);
    setDescription(event.description || '');
    setEventDate(event.date);
    setShowAddDialog(true);
  };

  const handleDeleteEvent = (id: string) => {
    const eventToDelete = events.find(e => e.id === id);
    
    if (eventToDelete && eventToDelete.type !== 'custom') {
      alert('System events cannot be deleted directly. Please modify them from their source page (Medication or Vaccination).');
      return;
    }
    
    setEvents(events.filter(e => e.id !== id));
  };

  const getDaysWithEvents = () => {
    return events
      .filter(event => !event.babyId || event.babyId === activeProfileData?.id)
      .reduce((acc: Record<string, number>, event) => {
        const dateStr = event.date.split('T')[0];
        acc[dateStr] = (acc[dateStr] || 0) + 1;
        return acc;
      }, {});
  };

  const daysWithEvents = getDaysWithEvents();

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'medication':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'vaccination':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'vaccination-reminder':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // If no active profile, show a message
  if (!activeProfileData) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen pt-20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Calendar</CardTitle>
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
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">
              Calendar for {activeProfileData.name}
            </CardTitle>
            <Button onClick={() => setShowAddDialog(true)}>Add Event</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border"
                modifiers={{
                  hasEvents: (date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return !!daysWithEvents[dateStr];
                  }
                }}
                modifiersStyles={{
                  hasEvents: {
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)'
                  }
                }}
              />
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium">Event Types:</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-gray-100">Custom</Badge>
                  <Badge variant="outline" className="bg-blue-100">Medication</Badge>
                  <Badge variant="outline" className="bg-green-100">Vaccination</Badge>
                  <Badge variant="outline" className="bg-yellow-100">Reminder</Badge>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-4">
                Events for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}
              </h3>
              {selectedEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedEvents
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(event => (
                      <div 
                        key={event.id} 
                        className={`p-4 rounded-md border ${getEventTypeColor(event.type)}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm">
                              {format(parseISO(event.date), 'h:mm a')}
                            </p>
                            {event.description && (
                              <p className="mt-2 text-sm">{event.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {event.type === 'custom' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleEditEvent(event)}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                            {event.type !== 'custom' && (
                              <Badge>
                                {event.type === 'medication' ? 'Medication' : 
                                 event.type === 'vaccination' ? 'Vaccination' : 'Reminder'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No events scheduled for this date.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogDescription>
              Enter the details for your calendar event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter event title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input 
                id="date" 
                type="datetime-local" 
                value={eventDate} 
                onChange={(e) => setEventDate(e.target.value)} 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Enter event details"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddEvent}>
              {editId ? 'Update Event' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}