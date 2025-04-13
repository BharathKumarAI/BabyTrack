'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO, isSameDay, addDays, isToday, isFuture, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useBabyProfile } from '@/app/BabyProfileContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  description?: string;
  type: 'custom' | 'medication' | 'vaccination' | 'vaccination-reminder' | 'growth' | 'health';
  babyId?: string;
  color?: string;
  recurring?: 'daily' | 'weekly' | 'monthly' | 'none';
  endRecurrence?: string;
}

export default function CalendarPage() {
  const { activeProfileData } = useBabyProfile();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState<string>(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [eventType, setEventType] = useState<string>('custom');
  const [eventColor, setEventColor] = useState<string>('default');
  const [recurring, setRecurring] = useState<string>('none');
  const [endRecurrence, setEndRecurrence] = useState<string>('');
  const [editId, setEditId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<string>('month');
  const [filterType, setFilterType] = useState<string>('all');

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
      let filteredEvents = events.filter(event => 
        isSameDay(parseISO(event.date), selectedDate) && 
        (!event.babyId || event.babyId === activeProfileData?.id)
      );

      // Apply type filter if not "all"
      if (filterType !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.type === filterType);
      }

      setSelectedEvents(filteredEvents);
    } else {
      setSelectedEvents([]);
    }
  }, [selectedDate, events, activeProfileData, filterType]);

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
      type: eventType as any,
      babyId: activeProfileData?.id,
      color: eventColor,
      recurring: recurring as any,
      endRecurrence: recurring !== 'none' ? endRecurrence : undefined
    };

    let updatedEvents: CalendarEvent[] = [];

    if (editId) {
      updatedEvents = events.map(e => (e.id === editId ? newEvent : e));
    } else {
      updatedEvents = [...events, newEvent];

      // Add recurring events
      if (recurring !== 'none' && endRecurrence) {
        const startDate = parseISO(eventDate);
        const endDate = parseISO(endRecurrence);
        let currentDate = startDate;

        while (isFuture(currentDate) && currentDate <= endDate) {
          if (recurring === 'daily') {
            currentDate = addDays(currentDate, 1);
          } else if (recurring === 'weekly') {
            currentDate = addDays(currentDate, 7);
          } else if (recurring === 'monthly') {
            const nextMonth = new Date(currentDate);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            currentDate = nextMonth;
          }

          if (currentDate <= endDate) {
            const recurringEvent: CalendarEvent = {
              ...newEvent,
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              date: format(currentDate, "yyyy-MM-dd'T'HH:mm")
            };
            updatedEvents.push(recurringEvent);
          }
        }
      }
    }

    setEvents(updatedEvents);
    resetForm();
    setShowAddDialog(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEventDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    setEventType('custom');
    setEventColor('default');
    setRecurring('none');
    setEndRecurrence('');
    setEditId(null);
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
    setEventType(event.type);
    setEventColor(event.color || 'default');
    setRecurring(event.recurring || 'none');
    setEndRecurrence(event.endRecurrence || '');
    setShowAddDialog(true);
  };

  const confirmDeleteEvent = (id: string) => {
    const eventToDelete = events.find(e => e.id === id);
    
    if (eventToDelete && eventToDelete.type !== 'custom') {
      alert('System events cannot be deleted directly. Please modify them from their source page (Medication or Vaccination).');
      return;
    }
    
    setEventToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteEvent = () => {
    if (eventToDelete) {
      setEvents(events.filter(e => e.id !== eventToDelete));
      setShowDeleteDialog(false);
      setEventToDelete(null);
    }
  };

  const getDaysWithEvents = () => {
    return events
      .filter(event => (!event.babyId || event.babyId === activeProfileData?.id) && 
                      (filterType === 'all' || event.type === filterType))
      .reduce((acc: Record<string, number>, event) => {
        const dateStr = event.date.split('T')[0];
        acc[dateStr] = (acc[dateStr] || 0) + 1;
        return acc;
      }, {});
  };

  const daysWithEvents = getDaysWithEvents();

  const getEventTypeColor = (type: string, customColor?: string) => {
    if (type === 'custom' && customColor && customColor !== 'default') {
      switch (customColor) {
        case 'red': return 'bg-red-100 text-red-800 border-red-300';
        case 'blue': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'green': return 'bg-green-100 text-green-800 border-green-300';
        case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'purple': return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'pink': return 'bg-pink-100 text-pink-800 border-pink-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    }

    switch (type) {
      case 'medication':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'vaccination':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'vaccination-reminder':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'growth':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'health':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Icons.medication className="h-4 w-4 mr-1" />;
      case 'vaccination':
        return <Icons.vaccination className="h-4 w-4 mr-1" />;
      case 'vaccination-reminder':
        return <Icons.calendar className="h-4 w-4 mr-1" />;
      case 'growth':
        return <Icons.growth className="h-4 w-4 mr-1" />;
      case 'health':
        return <Icons.health className="h-4 w-4 mr-1" />;
      default:
        return <Icons.calendar className="h-4 w-4 mr-1" />;
    }
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter(event => 
        (!event.babyId || event.babyId === activeProfileData?.id) &&
        (filterType === 'all' || event.type === filterType) &&
        parseISO(event.date) >= today
      )
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 5);
  };

  // If no active profile, show a message
  if (!activeProfileData) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen pt-10 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <Icons.calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">
                Please set up a baby profile in the settings page first.
              </p>
              <Button 
                className="w-full mt-4"
                onClick={() => window.location.href = '/settings'}
              >
                Go to Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-10 px-4">
      <Card className="w-full max-w-5xl shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Icons.calendar className="h-6 w-6 mr-2" />
                Calendar
              </CardTitle>
              <CardDescription>
                Manage events and reminders for {activeProfileData.name}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                  <SelectItem value="vaccination-reminder">Reminders</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowAddDialog(true)}>
                <Icons.add className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <Card>
                    <CardContent className="pt-6">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        className="rounded-md border"
                        modifiers={{
                          hasEvents: (date) => {
                            const dateStr = format(date, 'yyyy-MM-dd');
                            return !!daysWithEvents[dateStr];
                          },
                          today: (date) => isToday(date)
                        }}
                        modifiersStyles={{
                          hasEvents: {
                            fontWeight: 'bold',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)'
                          },
                          today: {
                            fontWeight: 'bold',
                            border: '2px solid currentColor'
                          }
                        }}
                      />
                      <div className="mt-6 space-y-3">
                        <div className="text-sm font-medium">Event Types:</div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-gray-100 flex items-center">
                            <Icons.calendar className="h-3 w-3 mr-1" />
                            Custom
                          </Badge>
                          <Badge variant="outline" className="bg-blue-100 flex items-center">
                            <Icons.medication className="h-3 w-3 mr-1" />
                            Medication
                          </Badge>
                          <Badge variant="outline" className="bg-green-100 flex items-center">
                            <Icons.vaccination className="h-3 w-3 mr-1" />
                            Vaccination
                          </Badge>
                          <Badge variant="outline" className="bg-yellow-100 flex items-center">
                            <Icons.calendar className="h-3 w-3 mr-1" />
                            Reminder
                          </Badge>
                          <Badge variant="outline" className="bg-purple-100 flex items-center">
                            <Icons.growth className="h-3 w-3 mr-1" />
                            Growth
                          </Badge>
                          <Badge variant="outline" className="bg-red-100 flex items-center">
                            <Icons.health className="h-3 w-3 mr-1" />
                            Health
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        Events for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}
                      </CardTitle>
                      {isToday(selectedDate!) && (
                        <Badge className="bg-primary text-primary-foreground">Today</Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      {selectedEvents.length > 0 ? (
                        <div className="space-y-4">
                          {selectedEvents
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map(event => (
                              <div 
                                key={event.id} 
                                className={`p-4 rounded-md border ${getEventTypeColor(event.type, event.color)}`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium flex items-center">
                                      {getEventTypeIcon(event.type)}
                                      {event.title}
                                    </h4>
                                    <p className="text-sm flex items-center mt-1">
                                      <Icons.clock className="h-3 w-3 mr-1" />
                                      {format(parseISO(event.date), 'h:mm a')}
                                    </p>
                                    {event.description && (
                                      <p className="mt-2 text-sm">{event.description}</p>
                                    )}
                                    {event.recurring && event.recurring !== 'none' && (
                                      <Badge variant="outline" className="mt-2 text-xs">
                                        Recurring: {event.recurring}
                                      </Badge>
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
                                          <Icons.edit className="h-3 w-3 mr-1" />
                                          Edit
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                          onClick={() => confirmDeleteEvent(event.id)}
                                        >
                                          <Icons.delete className="h-3 w-3 mr-1" />
                                          Delete
                                        </Button>
                                      </>
                                    )}
                                    {event.type !== 'custom' && (
                                      <Badge className="flex items-center">
                                        {event.type === 'medication' ? 'Medication' : 
                                         event.type === 'vaccination' ? 'Vaccination' : 
                                         event.type === 'growth' ? 'Growth' :
                                         event.type === 'health' ? 'Health' : 'Reminder'}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Icons.calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>No events scheduled for this date.</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => {
                              setEventDate(format(selectedDate!, "yyyy-MM-dd'T'HH:mm"));
                              setShowAddDialog(true);
                            }}
                          >
                            <Icons.add className="h-4 w-4 mr-2" />
                            Add Event for This Day
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="upcoming" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Events</CardTitle>
                  <CardDescription>
                    The next events scheduled for {activeProfileData.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getUpcomingEvents().length > 0 ? (
                    <div className="space-y-4">
                      {getUpcomingEvents().map(event => (
                        <div 
                          key={event.id} 
                          className={`p-4 rounded-md border ${getEventTypeColor(event.type, event.color)}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium flex items-center">
                                {getEventTypeIcon(event.type)}
                                {event.title}
                              </h4>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                                <p className="text-sm flex items-center">
                                  <Icons.calendarIcon className="h-3 w-3 mr-1" />
                                  {format(parseISO(event.date), 'MMM d, yyyy')}
                                </p>
                                <p className="text-sm flex items-center">
                                  <Icons.clock className="h-3 w-3 mr-1" />
                                  {format(parseISO(event.date), 'h:mm a')}
                                </p>
                              </div>
                              {event.description && (
                                <p className="mt-2 text-sm">{event.description}</p>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setSelectedDate(parseISO(event.date));
                                document.querySelector('[data-value="calendar"]')?.click();
                              }}
                            >
                              View Day
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icons.calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No upcoming events scheduled.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setShowAddDialog(true)}
                      >
                        <Icons.add className="h-4 w-4 mr-2" />
                        Add New Event
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Edit Event Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-type">Event Type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-color">Color</Label>
                <Select value={eventColor} onValueChange={setEventColor}>
                  <SelectTrigger id="event-color">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <div className="space-y-2">
              <Label htmlFor="recurring">Recurring</Label>
              <Select value={recurring} onValueChange={setRecurring}>
                <SelectTrigger id="recurring">
                  <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not recurring</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {recurring !== 'none' && (
              <div className="space-y-2">
                <Label htmlFor="end-recurrence">End Recurrence</Label>
                <Input 
                  id="end-recurrence" 
                  type="date" 
                  value={endRecurrence} 
                  onChange={(e) => setEndRecurrence(e.target.value)} 
                  min={eventDate.split('T')[0]}
                  required={recurring !== 'none'}
                />
              </div>
            )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this event from your calendar.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}