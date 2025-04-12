'use client';

import React, {useState, useEffect} from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {cn} from '@/lib/utils';
import {CalendarIcon} from 'lucide-react';
import {format} from 'date-fns';
import {
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

interface FeedingLogEntry {
  date: string;
  time: string;
  type: string;
  amount: number;
  unit: string;
  notes: string;
}

const FeedingLogPage = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
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

  useEffect(() => {
    // Load data from localStorage on component mount
    const storedLogs = localStorage.getItem('feedingLogs');
    if (storedLogs) {
      setFeedingLogs(JSON.parse(storedLogs));
    }
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever feedingLogs changes
    localStorage.setItem('feedingLogs', JSON.stringify(feedingLogs));
  }, [feedingLogs]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !type || !amount || !unit) {
      alert('Please fill in all fields.');
      return;
    }
    const newLog: FeedingLogEntry = {
      date: date ? format(date, 'yyyy-MM-dd') : '',
      time,
      type,
      amount: Number(amount),
      unit,
      notes
    };
    setFeedingLogs([...feedingLogs, newLog]);
    setTime('');
    setType('');
    setAmount('');
    setNotes('');
  };

  const chartData = feedingLogs.map(log => ({
    time: log.time,
    amount: log.amount,
  }));

  const hasData = feedingLogs.length > 0;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-20">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Feeding Log</CardTitle>
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
                      <CalendarIcon className="mr-2 h-4 w-4"/>
                      {date ? format(date, 'yyyy-MM-dd') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => {
                        const selectedYear = date?.getFullYear() || new Date().getFullYear();
                        return selectedYear > new Date().getFullYear() + 1 || selectedYear < 2020;
                      }}
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
              <Select onValueChange={setType}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select feeding type"/>
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
                <Select onValueChange={setUnit}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select unit"/>
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
          <Button type="submit">Log Feeding</Button>
        </form>
        <div className="py-4">
          {hasData ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="time"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                <Pie dataKey="amount" stroke="#8884d8" fill="#8884d8" activeDot={{r: 8}}/>
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <p>No data to display.</p>
          )}
        </div>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasData ? (
                feedingLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.date}</TableCell>
                    <TableCell>{log.time}</TableCell>
                    <TableCell>{log.type}</TableCell>
                    <TableCell>{`${log.amount} ${log.unit}`}</TableCell>
                    <TableCell>{log.notes}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No data available</TableCell>
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
