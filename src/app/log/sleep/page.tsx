'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBabyProfile } from '@/app/BabyProfileContext';

interface SleepLogEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  quality: string;
  location: string;
  notes: string;
  babyId: string; // Add babyId to associate entries with specific babies
}

const qualityOptions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const locationOptions = [
  { value: 'crib', label: 'Crib' },
  { value: 'bassinet', label: 'Bassinet' },
  { value: 'parents-bed', label: 'Parents\' Bed' },
  { value: 'stroller', label: 'Stroller' },
  { value: 'car-seat', label: 'Car Seat' },
  { value: 'other', label: 'Other' },
];

export default function SleepLogPage() {
  const { activeProfileData } = useBabyProfile();
  const [entries, setEntries] = useState<SleepLogEntry[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const [endTime, setEndTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const [quality, setQuality] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('log');
  const [dateFilter, setDateFilter] = useState('week');
  const [customStartDate, setCustomStartDate] = useState(format(new Date(new Date().setDate(new Date().getDate() - 7)), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Load data from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('sleepLogs');
    if (savedEntries) setEntries(JSON.parse(savedEntries));
  }, []);

  // Save data to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('sleepLogs', JSON.stringify(entries));
  }, [entries]);

  const calculateDuration = (start: string, end: string, dateStr: string) => {
    const startDate = new Date(`${dateStr}T${start}`);
    let endDate = new Date(`${dateStr}T${end}`);
    
    // If end time is earlier than start time, assume it's the next day
    if (endDate < startDate) {
      const nextDay = new Date(dateStr);
      nextDay.setDate(nextDay.getDate() + 1);
      endDate = new Date(`${format(nextDay, 'yyyy-MM-dd')}T${end}`);
    }
    
    return differenceInMinutes(endDate, startDate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime || !quality || !location || !activeProfileData) {
      alert('Please fill in all required fields.');
      return;
    }
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const duration = calculateDuration(startTime, endTime, dateStr);
    
    if (duration <= 0) {
      alert('End time must be after start time.');
      return;
    }
    
    const newEntry: SleepLogEntry = {
      id: editId ? editId : Date.now().toString(),
      date: dateStr,
      startTime,
      endTime,
      duration,
      quality,
      location,
      notes,
      babyId: activeProfileData.id
    };

    if (editId) {
      // Edit existing entry
      const updatedEntries = entries.map((entry) =>
        entry.id === editId ? newEntry : entry
      );
      setEntries(updatedEntries);
    } else {
      // Add new entry
      setEntries([...entries, newEntry]);
    }

    resetForm();
  };

  const resetForm = () => {
    setDate(new Date());
    setStartTime(() => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    });
    setEndTime(() => {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    });
    setQuality('');
    setLocation('');
    setNotes('');
    setEditId(null);
  };

  const handleEdit = (entry: SleepLogEntry) => {
    setEditId(entry.id);
    setDate(new Date(entry.date));
    setStartTime(entry.startTime);
    setEndTime(entry.endTime);
    setQuality(entry.quality);
    setLocation(entry.location);
    setNotes(entry.notes);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  // Filter entries for the active baby
  const getFilteredEntries = () => {
    let filtered = activeProfileData 
      ? entries.filter(entry => entry.babyId === activeProfileData.id)
      : [];
    
    // Sort by date and time (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Apply date filter
    if (dateFilter === 'today') {
      const today = format(new Date(), 'yyyy-MM-dd');
      filtered = filtered.filter(entry => entry.date === today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(entry => new Date(entry.date) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(entry => new Date(entry.date) >= monthAgo);
    } else if (dateFilter === 'custom') {
      filtered = filtered.filter(entry => 
        new Date(entry.date) >= new Date(customStartDate) && 
        new Date(entry.date) <= new Date(customEndDate)
      );
    }
    
    return filtered;
  };

  const filteredEntries = getFilteredEntries();

  // Prepare chart data for daily sleep totals
  const prepareDailySleepData = () => {
    const dailyTotals: Record<string, number> = {};
    
    filteredEntries.forEach(entry => {
      if (!dailyTotals[entry.date]) {
        dailyTotals[entry.date] = 0;
      }
      dailyTotals[entry.date] += entry.duration;
    });
    
    return Object.entries(dailyTotals).map(([date, minutes]) => ({
      date,
      hours: Math.round((minutes / 60) * 10) / 10, // Round to 1 decimal place
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Prepare chart data for sleep quality distribution
  const prepareSleepQualityData = () => {
    const qualityCounts: Record<string, number> = {};
    
    filteredEntries.forEach(entry => {
      if (!qualityCounts[entry.quality]) {
        qualityCounts[entry.quality] = 0;
      }
      qualityCounts[entry.quality]++;
    });
    
    return Object.entries(qualityCounts).map(([quality, count]) => {
      const qualityOption = qualityOptions.find(q => q.value === quality);
      return {
        name: qualityOption ? qualityOption.label : quality,
        value: count,
      };
    });
  };

  // Prepare chart data for sleep location distribution
  const prepareSleepLocationData = () => {
    const locationCounts: Record<string, number> = {};
    
    filteredEntries.forEach(entry => {
      if (!locationCounts[entry.location]) {
        locationCounts[entry.location] = 0;
      }
      locationCounts[entry.location]++;
    });
    
    return Object.entries(locationCounts).map(([location, count]) => {
      const locationOption = locationOptions.find(l => l.value === location);
      return {
        name: locationOption ? locationOption.label : location,
        value: count,
      };
    });
  };

  const dailySleepData = prepareDailySleepData();
  const sleepQualityData = prepareSleepQualityData();
  const sleepLocationData = prepareSleepLocationData();

  // Calculate sleep statistics
  const calculateSleepStats = () => {
    if (filteredEntries.length === 0) return { 
      totalSleep: 0, 
      avgSleep: 0, 
      longestSleep: 0,
      mostCommonQuality: 'N/A',
      mostCommonLocation: 'N/A'
    };
    
    const totalMinutes = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const avgMinutes = totalMinutes / filteredEntries.length;
    const longestSleep = Math.max(...filteredEntries.map(entry => entry.duration));
    
    // Most common quality
    const qualityCounts: Record<string, number> = {};
    filteredEntries.forEach(entry => {
      qualityCounts[entry.quality] = (qualityCounts[entry.quality] || 0) + 1;
    });
    const mostCommonQuality = Object.entries(qualityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    // Most common location
    const locationCounts: Record<string, number> = {};
    filteredEntries.forEach(entry => {
      locationCounts[entry.location] = (locationCounts[entry.location] || 0) + 1;
    });
    const mostCommonLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    return {
      totalSleep: Math.round((totalMinutes / 60) * 10) / 10,
      avgSleep: Math.round((avgMinutes / 60) * 10) / 10,
      longestSleep: Math.round((longestSleep / 60) * 10) / 10,
      mostCommonQuality,
      mostCommonLocation
    };
  };

  const sleepStats = calculateSleepStats();

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getQualityLabel = (qualityValue: string) => {
    const quality = qualityOptions.find(q => q.value === qualityValue);
    return quality ? quality.label : qualityValue;
  };

  const getLocationLabel = (locationValue: string) => {
    const location = locationOptions.find(l => l.value === locationValue);
    return location ? location.label : locationValue;
  };

  // If no active profile, show a message
  if (!activeProfileData) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen pt-20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Sleep Log</CardTitle>
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
          <CardTitle className="text-2xl">Sleep Log for {activeProfileData.name}</CardTitle>
          <CardDescription>
            Track sleep patterns and view sleep statistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="log" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="log">Log Entry</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="log" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !date && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, 'yyyy-MM-dd') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      type="time"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      type="time"
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quality">Sleep Quality</Label>
                    <Select onValueChange={setQuality} value={quality} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sleep quality" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Sleep Location</Label>
                    <Select onValueChange={setLocation} value={location} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sleep location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    type="text"
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about sleep conditions, waking, etc."
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editId ? 'Update Sleep Entry' : 'Log Sleep'}
                </Button>
              </form>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Sleep History</h3>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dateFilter === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customStartDate">Start Date</Label>
                      <Input 
                        id="customStartDate" 
                        type="date" 
                        value={customStartDate} 
                        onChange={(e) => setCustomStartDate(e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="customEndDate">End Date</Label>
                      <Input 
                        id="customEndDate" 
                        type="date" 
                        value={customEndDate} 
                        onChange={(e) => setCustomEndDate(e.target.value)} 
                      />
                    </div>
                  </div>
                )}

                {filteredEntries.length > 0 ? (
                  <Table>
                    <TableCaption>Sleep log history for {activeProfileData.name}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Quality</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>{entry.startTime}</TableCell>
                          <TableCell>{entry.endTime}</TableCell>
                          <TableCell>{formatDuration(entry.duration)}</TableCell>
                          <TableCell>{getQualityLabel(entry.quality)}</TableCell>
                          <TableCell>{getLocationLabel(entry.location)}</TableCell>
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
                                    Are you sure you want to delete this sleep entry? This action cannot be undone.
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
                    No sleep entries found for the selected time period.
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Sleep Insights for {activeProfileData.name}</h3>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dateFilter === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="insightsStartDate">Start Date</Label>
                      <Input 
                        id="insightsStartDate" 
                        type="date" 
                        value={customStartDate} 
                        onChange={(e) => setCustomStartDate(e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="insightsEndDate">End Date</Label>
                      <Input 
                        id="insightsEndDate" 
                        type="date" 
                        value={customEndDate} 
                        onChange={(e) => setCustomEndDate(e.target.value)} 
                      />
                    </div>
                  </div>
                )}

                {filteredEntries.length > 0 ? (
                  <div className="space-y-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Sleep Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <h4 className="font-medium text-gray-500">Total Sleep</h4>
                            <p className="text-2xl font-bold">{sleepStats.totalSleep} hours</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <h4 className="font-medium text-gray-500">Average Sleep</h4>
                            <p className="text-2xl font-bold">{sleepStats.avgSleep} hours/session</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <h4 className="font-medium text-gray-500">Longest Sleep</h4>
                            <p className="text-2xl font-bold">{sleepStats.longestSleep} hours</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <h4 className="font-medium text-gray-500">Most Common Quality</h4>
                            <p className="text-xl font-bold">
                              {getQualityLabel(sleepStats.mostCommonQuality)}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <h4 className="font-medium text-gray-500">Most Common Location</h4>
                            <p className="text-xl font-bold">
                              {getLocationLabel(sleepStats.mostCommonLocation)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Daily Sleep Hours</CardTitle>
                      </CardHeader>
                      <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dailySleepData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="hours" 
                              stroke="#8884d8" 
                              activeDot={{ r: 8 }} 
                              name="Sleep Hours"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Sleep Quality Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sleepQualityData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" fill="#8884d8" name="Count" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Sleep Location Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sleepLocationData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" fill="#82ca9d" name="Count" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-muted-foreground">
                        No sleep data available for the selected time period. Add sleep entries to see insights.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}