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
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
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
import { useBabyProfile } from '@/app/BabyProfileContext';

interface DiaperLogEntry {
  id: string;
  date: Date;
  time: string;
  type: string;
  notes: string;
  babyId: string; // Add babyId to associate entries with specific babies
}

const typeColors: { [key: string]: string } = {
  Wet: '#8884d8',
  Dirty: '#82ca9d',
  Both: '#ff8042',
};

const customTooltip = (props: any) => {
  const { active, payload, label } = props;

  if (active && payload && payload.length) {
    const wet = payload[0]?.value || 0;
    const dirty = payload[1]?.value || 0;
    const both = payload[2]?.value || 0;

    const totalDiapers = wet + dirty + both;

    return (
      <div className="bg-white border p-2 rounded shadow-lg">
        <p className="font-semibold">{label}</p>
        <p>Wet: {wet}</p>
        <p>Dirty: {dirty}</p>
        <p>Both: {both}</p>
        <p className="font-bold">Total: {totalDiapers}</p>
      </div>
    );
  }

  return null;
};

const DiaperLogPage = () => {
  const { activeProfileData } = useBabyProfile();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const [type, setType] = useState('');
  const [notes, setNotes] = useState('');
  const [diaperLogs, setDiaperLogs] = useState<DiaperLogEntry[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'day' | 'month'>('day');

  useEffect(() => {
    const storedLogs = localStorage.getItem('diaperLogs');
    if (storedLogs) {
      const parsedLogs = JSON.parse(storedLogs);
      const logsWithDates = parsedLogs.map((log: any) => ({
        ...log,
        date: new Date(log.date),
      }));
      setDiaperLogs(logsWithDates);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diaperLogs', JSON.stringify(diaperLogs));
  }, [diaperLogs]);

  const clearForm = () => {
    setDate(new Date());
    setTime(() => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    });
    setType('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !type || !activeProfileData) {
      alert('Please fill in all required fields.');
      return;
    }
    const newLog: DiaperLogEntry = {
      id: editingLogId ? editingLogId : Date.now().toString(),
      date: date,
      time,
      type,
      notes,
      babyId: activeProfileData.id
    };

    if (editingLogId) {
      // Edit existing log
      const updatedLogs = diaperLogs.map((log) =>
        log.id === editingLogId ? newLog : log
      );
      setDiaperLogs(updatedLogs);
    } else {
      // Add new log
      setDiaperLogs([...diaperLogs, newLog]);
    }

    clearForm();
    setEditingLogId(null);
  };

  const handleDeleteConfirmation = (logId: string) => {
    setSelectedLogId(logId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedLogId) {
      const updatedLogs = diaperLogs.filter((log) => log.id !== selectedLogId);
      setDiaperLogs(updatedLogs);
      setIsDeleteDialogOpen(false);
      setSelectedLogId(null);
    }
  };

  // Filter logs for the active baby
  const filteredLogs = activeProfileData 
    ? diaperLogs.filter(log => log.babyId === activeProfileData.id)
    : [];

  const groupedData = () => {
    const groups: { [key: string]: { [key: string]: number } } = {};
    filteredLogs.forEach((log) => {
      const key =
        filter === 'day'
          ? format(new Date(log.date), 'yyyy-MM-dd')
          : format(new Date(log.date), 'yyyy-MM');
      if (!groups[key]) {
        groups[key] = { Wet: 0, Dirty: 0, Both: 0 };
      }
      groups[key][log.type] = (groups[key][log.type] || 0) + 1;
    });
    return Object.entries(groups).map(([date, types]) => ({
      date,
      ...types,
    }));
  };

  const chartData = groupedData();

  const hasData = filteredLogs.length > 0;

  const handleEdit = (log: DiaperLogEntry) => {
    setEditingLogId(log.id);
    setDate(log.date);
    setTime(log.time);
    setType(log.type);
    setNotes(log.notes);
  };

  // If no active profile, show a message
  if (!activeProfileData) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen pt-20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Diaper Log</CardTitle>
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
    <div className="flex flex-col items-center justify-start min-h-screen pt-20">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Diaper Log for {activeProfileData.name}</CardTitle>
          <CardDescription>
            Log diaper changes and view statistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] justify-start text-left font-normal',
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
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select onValueChange={setType} value={type}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select diaper type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wet">Wet</SelectItem>
                  <SelectItem value="Dirty">Dirty</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                type="text"
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes"
              />
            </div>
            <Button type="submit">
              {editingLogId ? 'Update Log' : 'Log Diaper Change'}
            </Button>
          </form>

          {/* Filter section for daily/monthly data */}
          <div className="mt-4">
            <Label htmlFor="filter">View By</Label>
            <Select onValueChange={(value) => setFilter(value as 'day' | 'month')} value={filter}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bar Chart */}
          <div className="py-4">
            {hasData ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.values(chartData)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={customTooltip} />
                  <Legend />

                  <Bar dataKey="Wet" fill={typeColors.Wet} stackId="a" />
                  <Bar dataKey="Dirty" fill={typeColors.Dirty} stackId="a" />
                  <Bar dataKey="Both" fill={typeColors.Both} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No data to display.</p>
            )}
          </div>

          {/* Table displaying the diaper log entries */}
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasData ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(log.date, 'yyyy-MM-dd')}</TableCell>
                      <TableCell>{log.time}</TableCell>
                      <TableCell>{log.type}</TableCell>
                      <TableCell>{log.notes}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(log)}>
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteConfirmation(log.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the diaper log.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiaperLogPage;