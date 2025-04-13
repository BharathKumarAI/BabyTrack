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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
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

interface FeedingLogEntry {
  id: string;
  date: Date;
  time: string;
  type: string;
  amount: number;
  unit: string;
  notes: string;
  babyId: string; // Add babyId to associate entries with specific babies
}

const typeColors: { [key: string]: string } = {
  Breastfeeding: '#8884d8',
  Formula: '#82ca9d',
  Solids: '#ffc658',
  Pumping: '#ff8042',
};

const FeedingLogPage = () => {
  const { activeProfileData } = useBabyProfile();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('ml');
  const [notes, setNotes] = useState('');
  const [feedingLogs, setFeedingLogs] = useState<FeedingLogEntry[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  useEffect(() => {
    const storedLogs = localStorage.getItem('feedingLogs');
    if (storedLogs) {
      const parsedLogs = JSON.parse(storedLogs);
      const logsWithDates = parsedLogs.map((log: any) => ({
        ...log,
        date: new Date(log.date),
      }));
      setFeedingLogs(logsWithDates);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('feedingLogs', JSON.stringify(feedingLogs));
  }, [feedingLogs]);

  const clearForm = () => {
    setDate(new Date());
    setTime(() => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    });
    setType('');
    setAmount('');
    setUnit('ml');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !type || !amount || !unit || !activeProfileData) {
      alert('Please fill in all fields.');
      return;
    }
    const newLog: FeedingLogEntry = {
      id: editingLogId ? editingLogId : Date.now().toString(),
      date: date,
      time,
      type,
      amount: Number(amount),
      unit,
      notes,
      babyId: activeProfileData.id
    };

    if (editingLogId) {
      // Edit existing log
      const updatedLogs = feedingLogs.map((log) =>
        log.id === editingLogId ? newLog : log
      );
      setFeedingLogs(updatedLogs);
    } else {
      // Add new log
      setFeedingLogs([...feedingLogs, newLog]);
    }

    clearForm();
    setEditingLogId(null);
  };

  const handleEdit = (log: FeedingLogEntry) => {
    setEditingLogId(log.id);
    setDate(log.date);
    setTime(log.time);
    setType(log.type);
    setAmount(log.amount.toString());
    setUnit(log.unit);
    setNotes(log.notes);
  };

  // Filter logs for the active baby
  const filteredLogs = activeProfileData 
    ? feedingLogs.filter(log => log.babyId === activeProfileData.id)
    : [];

  const chartData = Object.entries(
    filteredLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + log.amount;
      return acc;
    }, {} as { [key: string]: number })
  ).map(([type, amount]) => ({
    name: type,
    value: amount,
  }));

  const hasData = filteredLogs.length > 0;

  const handleDeleteConfirmation = (logId: string) => {
    setSelectedLogId(logId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedLogId) {
      const updatedLogs = feedingLogs.filter((log) => log.id !== selectedLogId);
      setFeedingLogs(updatedLogs);
      setIsDeleteDialogOpen(false);
      setSelectedLogId(null);
    }
  };

  // If no active profile, show a message
  if (!activeProfileData) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen pt-20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Feeding Log</CardTitle>
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
          <CardTitle className="text-2xl">Feeding Log for {activeProfileData.name}</CardTitle>
          <CardDescription>
            Log feeding times, amounts, and types here.
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
                  <SelectValue placeholder="Select feeding type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breastfeeding">Breastfeeding</SelectItem>
                  <SelectItem value="Formula">Formula</SelectItem>
                  <SelectItem value="Solids">Solids</SelectItem>
                  <SelectItem value="Pumping">Pumping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Select onValueChange={setUnit} value={unit}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                    <SelectItem value="grams">grams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              {editingLogId ? 'Update Log' : 'Log Feeding'}
            </Button>
          </form>

          {/* Pie Chart */}
          <div className="py-6">
            {hasData ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={typeColors[entry.name] || '#ccc'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground">No data to display.</p>
            )}
          </div>

          {/* Table */}
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasData ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.date), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>{log.time}</TableCell>
                      <TableCell>{log.type}</TableCell>
                      <TableCell>{log.amount}</TableCell>
                      <TableCell>{log.unit}</TableCell>
                      <TableCell>{log.notes}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(log)}
                        >
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
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the feeding log.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => setIsDeleteDialogOpen(false)}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No feeding logs yet.
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

export default FeedingLogPage;