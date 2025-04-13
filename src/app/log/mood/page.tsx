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
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useBabyProfile } from '@/app/BabyProfileContext';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface MoodEntry {
  id: string;
  date: string;
  time: string;
  babyMood: string;
  caregiverMood: string;
  notes: string;
  factors: string[];
  babyId: string; // Add babyId to associate entries with specific babies
}

const moodOptions = [
  { value: 'very-happy', label: 'Very Happy 😄' },
  { value: 'happy', label: 'Happy 🙂' },
  { value: 'neutral', label: 'Neutral 😐' },
  { value: 'sad', label: 'Sad 🙁' },
  { value: 'very-sad', label: 'Very Sad 😢' },
  { value: 'angry', label: 'Angry 😠' },
  { value: 'tired', label: 'Tired 😴' },
  { value: 'sick', label: 'Sick 🤒' },
  { value: 'fussy', label: 'Fussy 😫' },
];

const factorOptions = [
  { value: 'sleep', label: 'Sleep' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'diaper', label: 'Diaper' },
  { value: 'teething', label: 'Teething' },
  { value: 'illness', label: 'Illness' },
  { value: 'growth-spurt', label: 'Growth Spurt' },
  { value: 'separation-anxiety', label: 'Separation Anxiety' },
  { value: 'overstimulation', label: 'Overstimulation' },
  { value: 'weather', label: 'Weather' },
  { value: 'routine-change', label: 'Routine Change' },
  { value: 'caregiver-stress', label: 'Caregiver Stress' },
  { value: 'other', label: 'Other' },
];

export default function MoodLogPage() {
  const { activeProfileData } = useBabyProfile();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [babyMood, setBabyMood] = useState('');
  const [caregiverMood, setCaregiverMood] = useState('');
  const [notes, setNotes] = useState('');
  const [factors, setFactors] = useState<string[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('log');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState(format(new Date(new Date().setDate(new Date().getDate() - 7)), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Load data from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('moodLogs');
    if (savedEntries) setEntries(JSON.parse(savedEntries));
  }, []);

  // Save data to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('moodLogs', JSON.stringify(entries));
  }, [entries]);

  const handleFactorChange = (factor: string) => {
    if (factors.includes(factor)) {
      setFactors(factors.filter(f => f !== factor));
    } else {
      setFactors([...factors, factor]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !babyMood || !activeProfileData) return;

    const entry: MoodEntry = {
      id: editId || Date.now().toString(),
      date,
      time,
      babyMood,
      caregiverMood,
      notes,
      factors,
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
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime(format(new Date(), 'HH:mm'));
    setBabyMood('');
    setCaregiverMood('');
    setNotes('');
    setFactors([]);
  };

  const handleEdit = (entry: MoodEntry) => {
    setEditId(entry.id);
    setDate(entry.date);
    setTime(entry.time);
    setBabyMood(entry.babyMood);
    setCaregiverMood(entry.caregiverMood);
    setNotes(entry.notes);
    setFactors(entry.factors);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const getMoodLabel = (moodValue: string) => {
    const mood = moodOptions.find(m => m.value === moodValue);
    return mood ? mood.label : moodValue;
  };

  const getFactorLabels = (factorValues: string[]) => {
    return factorValues.map(value => {
      const factor = factorOptions.find(f => f.value === value);
      return factor ? factor.label : value;
    }).join(', ');
  };

  // Filter entries for the active baby
  const getFilteredEntries = () => {
    let filtered = activeProfileData 
      ? entries.filter(entry => entry.babyId === activeProfileData.id)
      : [];
    
    // Sort by date and time (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
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

  // Prepare chart data
  const prepareBabyMoodData = () => {
    const moodCounts: Record<string, number> = {};
    
    filteredEntries.forEach(entry => {
      if (entry.babyMood) {
        moodCounts[entry.babyMood] = (moodCounts[entry.babyMood] || 0) + 1;
      }
    });
    
    return {
      labels: Object.keys(moodCounts).map(mood => getMoodLabel(mood)),
      datasets: [
        {
          data: Object.values(moodCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
            'rgba(83, 102, 255, 0.6)',
            'rgba(255, 99, 255, 0.6)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareCaregiverMoodData = () => {
    const moodCounts: Record<string, number> = {};
    
    filteredEntries.forEach(entry => {
      if (entry.caregiverMood) {
        moodCounts[entry.caregiverMood] = (moodCounts[entry.caregiverMood] || 0) + 1;
      }
    });
    
    return {
      labels: Object.keys(moodCounts).map(mood => getMoodLabel(mood)),
      datasets: [
        {
          data: Object.values(moodCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
            'rgba(83, 102, 255, 0.6)',
            'rgba(255, 99, 255, 0.6)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareFactorsData = () => {
    const factorCounts: Record<string, number> = {};
    
    filteredEntries.forEach(entry => {
      entry.factors.forEach(factor => {
        factorCounts[factor] = (factorCounts[factor] || 0) + 1;
      });
    });
    
    return {
      labels: Object.keys(factorCounts).map(factor => {
        const factorOption = factorOptions.find(f => f.value === factor);
        return factorOption ? factorOption.label : factor;
      }),
      datasets: [
        {
          data: Object.values(factorCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
            'rgba(83, 102, 255, 0.6)',
            'rgba(255, 99, 255, 0.6)',
            'rgba(159, 159, 64, 0.6)',
            'rgba(255, 159, 159, 0.6)',
            'rgba(159, 255, 159, 0.6)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const babyMoodData = prepareBabyMoodData();
  const caregiverMoodData = prepareCaregiverMoodData();
  const factorsData = prepareFactorsData();

  // If no active profile, show a message
  if (!activeProfileData) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen pt-20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Mood Log</CardTitle>
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
          <CardTitle className="text-2xl">Mood Log for {activeProfileData.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="log" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="log">Log Entry</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="log" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input 
                      id="time" 
                      type="time" 
                      value={time} 
                      onChange={(e) => setTime(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="babyMood">{activeProfileData.name}'s Mood</Label>
                  <Select 
                    value={babyMood} 
                    onValueChange={setBabyMood}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${activeProfileData.name}'s mood`} />
                    </SelectTrigger>
                    <SelectContent>
                      {moodOptions.map(mood => (
                        <SelectItem key={mood.value} value={mood.value}>
                          {mood.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="caregiverMood">Caregiver's Mood (Optional)</Label>
                  <Select 
                    value={caregiverMood} 
                    onValueChange={setCaregiverMood}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select caregiver's mood (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {moodOptions.map(mood => (
                        <SelectItem key={mood.value} value={mood.value}>
                          {mood.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Possible Factors (Optional)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {factorOptions.map(factor => (
                      <div key={factor.value} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`factor-${factor.value}`} 
                          checked={factors.includes(factor.value)}
                          onChange={() => handleFactorChange(factor.value)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor={`factor-${factor.value}`}>{factor.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea 
                    id="notes" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Additional observations or details"
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editId ? 'Update Entry' : 'Add Entry'}
                </Button>
              </form>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Mood History</h3>
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
                    <TableCaption>Mood log history for {activeProfileData.name}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>{activeProfileData.name}'s Mood</TableHead>
                        <TableHead>Caregiver's Mood</TableHead>
                        <TableHead>Factors</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            {entry.date} at {entry.time}
                          </TableCell>
                          <TableCell>{getMoodLabel(entry.babyMood)}</TableCell>
                          <TableCell>
                            {entry.caregiverMood ? getMoodLabel(entry.caregiverMood) : 'Not recorded'}
                          </TableCell>
                          <TableCell>
                            {entry.factors.length > 0 ? getFactorLabels(entry.factors) : 'None recorded'}
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
                                    Are you sure you want to delete this mood entry? This action cannot be undone.
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
                    No mood entries found for the selected time period.
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Mood Insights for {activeProfileData.name}</h3>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">{activeProfileData.name}'s Mood Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                          <Pie data={babyMoodData} />
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Caregiver's Mood Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                          {caregiverMoodData.datasets[0].data.length > 0 ? (
                            <Pie data={caregiverMoodData} />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-muted-foreground">No caregiver mood data recorded</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Common Mood Factors</CardTitle>
                      </CardHeader>
                      <CardContent className="h-64">
                        {factorsData.datasets[0].data.length > 0 ? (
                          <Pie data={factorsData} />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">No mood factors recorded</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Mood Patterns & Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Most Common Baby Mood:</h4>
                            <p>
                              {babyMoodData.labels.length > 0 ? 
                                babyMoodData.labels[
                                  babyMoodData.datasets[0].data.indexOf(
                                    Math.max(...babyMoodData.datasets[0].data)
                                  )
                                ] : 
                                'No data available'}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium">Most Common Caregiver Mood:</h4>
                            <p>
                              {caregiverMoodData.labels.length > 0 ? 
                                caregiverMoodData.labels[
                                  caregiverMoodData.datasets[0].data.indexOf(
                                    Math.max(...caregiverMoodData.datasets[0].data)
                                  )
                                ] : 
                                'No data available'}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium">Top Mood Factors:</h4>
                            <p>
                              {factorsData.labels.length > 0 ? 
                                factorsData.labels.slice(0, 3).join(', ') : 
                                'No factors recorded'}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium">Total Entries:</h4>
                            <p>{filteredEntries.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-muted-foreground">
                        No mood data available for the selected time period. Add mood entries to see insights.
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