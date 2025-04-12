'use client';

import React, {useState} from 'react';
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
} from 'recharts';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

const data = [
  {
    date: '2024-07-15',
    time: '08:00',
    type: 'Breastfeeding',
    amount: 8,
  },
  {
    date: '2024-07-15',
    time: '12:00',
    type: 'Formula',
    amount: 6,
  },
  {
    date: '2024-07-15',
    time: '16:00',
    type: 'Solids',
    amount: 4,
  },
  {
    date: '2024-07-15',
    time: '20:00',
    type: 'Breastfeeding',
    amount: 7,
  },
];

const FeedingLogPage = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [time, setTime] = useState('');
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [feedingLogs, setFeedingLogs] = useState(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog = {
      date: date ? format(date, 'yyyy-MM-dd') : '',
      time,
      type,
      amount: Number(amount),
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
                      disabled={([year, month, day]) => year > 2024 || year < 2020}
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart
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
                <Pie type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{r: 8}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedingLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.date}</TableCell>
                    <TableCell>{log.time}</TableCell>
                    <TableCell>{log.type}</TableCell>
                    <TableCell>{log.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedingLogPage;
