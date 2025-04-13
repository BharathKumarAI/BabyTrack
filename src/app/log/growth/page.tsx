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
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { format, differenceInMonths } from 'date-fns';
import { Line } from 'react-chartjs-2'; // Import charting component
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { useBabyProfile } from '@/app/BabyProfileContext';

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

interface GrowthEntry {
  id: string;
  date: string;
  weight: number;
  height: number;
  headCircumference: number;
  babyId: string; // Add babyId to associate entries with specific babies
}

export default function GrowthLogPage() {
  const { activeProfileData, calculateAge } = useBabyProfile();
  const [entries, setEntries] = useState<GrowthEntry[]>([]);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [head, setHead] = useState('');
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [editId, setEditId] = useState<string | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('growthLogs');
    if (savedEntries) setEntries(JSON.parse(savedEntries));
  }, []);

  // Save data to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('growthLogs', JSON.stringify(entries));
  }, [entries]);

  const convertWeight = (w: number) =>
    unitSystem === 'imperial' ? (w * 2.20462).toFixed(1) : w.toString();
  const convertHeight = (h: number) =>
    unitSystem === 'imperial' ? (h / 2.54).toFixed(1) : h.toString();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !height || !head || !entryDate || !activeProfileData) return;

    const entry: GrowthEntry = {
      id: editId || Date.now().toString(),
      date: entryDate,
      weight: parseFloat(unitSystem === 'imperial' ? (parseFloat(weight) / 2.20462).toFixed(2) : weight),
      height: parseFloat(unitSystem === 'imperial' ? (parseFloat(height) * 2.54).toFixed(2) : height),
      headCircumference: parseFloat(unitSystem === 'imperial' ? (parseFloat(head) * 2.54).toFixed(2) : head),
      babyId: activeProfileData.id
    };

    if (editId) {
      setEntries((prev) => prev.map((e) => (e.id === editId ? entry : e)));
      setEditId(null);
    } else {
      setEntries((prev) => [...prev, entry]);
    }

    setWeight('');
    setHeight('');
    setHead('');
    setEntryDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const handleEdit = (entry: GrowthEntry) => {
    setEditId(entry.id);
    setWeight(unitSystem === 'imperial' ? (entry.weight * 2.20462).toFixed(1) : entry.weight.toString());
    setHeight(unitSystem === 'imperial' ? (entry.height / 2.54).toFixed(1) : entry.height.toString());
    setHead(unitSystem === 'imperial' ? (entry.headCircumference / 2.54).toFixed(1) : entry.headCircumference.toString());
    setEntryDate(entry.date);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  // Filter entries for the active baby
  const filteredEntries = activeProfileData 
    ? entries.filter(entry => entry.babyId === activeProfileData.id)
    : [];

  const calculateAgeInMonths = (entryDate: string): number | null => {
    if (!activeProfileData?.birthDate) return null;
    return differenceInMonths(new Date(entryDate), new Date(activeProfileData.birthDate));
  };

  const calculatePercentile = (entry: GrowthEntry) => {
    // Example logic — replace with real LMS z-score calc based on age & sex
    const age = calculateAgeInMonths(entry.date) || 0;
    const gender = activeProfileData?.gender || 'unknown';
    
    // Different percentile calculations based on gender
    if (gender === 'male') {
      const weightPercentile = entry.weight < 6 + age * 0.5 ? '<10%' : entry.weight < 8 + age * 0.5 ? '25%' : entry.weight < 10 + age * 0.5 ? '50%' : '75%+';
      const heightPercentile = entry.height < 60 + age * 1.5 ? '<10%' : entry.height < 70 + age * 1.2 ? '25%' : entry.height < 75 + age * 1.2 ? '50%' : '75%+';
      const headPercentile = entry.headCircumference < 38 + age * 0.4 ? '<10%' : entry.headCircumference < 42 + age * 0.4 ? '25%' : entry.headCircumference < 45 + age * 0.4 ? '50%' : '75%+';
      return { weightPercentile, heightPercentile, headPercentile };
    } else {
      const weightPercentile = entry.weight < 5.5 + age * 0.45 ? '<10%' : entry.weight < 7.5 + age * 0.45 ? '25%' : entry.weight < 9.5 + age * 0.45 ? '50%' : '75%+';
      const heightPercentile = entry.height < 58 + age * 1.4 ? '<10%' : entry.height < 68 + age * 1.1 ? '25%' : entry.height < 73 + age * 1.1 ? '50%' : '75%+';
      const headPercentile = entry.headCircumference < 37 + age * 0.38 ? '<10%' : entry.headCircumference < 41 + age * 0.38 ? '25%' : entry.headCircumference < 44 + age * 0.38 ? '50%' : '75%+';
      return { weightPercentile, heightPercentile, headPercentile };
    }
  };

  // Create the data for the chart
  const chartData = {
    labels: filteredEntries.map(entry => entry.date),
    datasets: [
      {
        label: 'Weight (kg)',
        data: filteredEntries.map(entry => entry.weight),
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
        yAxisID: 'y',
      },
      {
        label: 'Height (cm)',
        data: filteredEntries.map(entry => entry.height),
        borderColor: 'rgba(153, 102, 255, 1)',
        fill: false,
        yAxisID: 'y1',
      },
      {
        label: 'Head Circumference (cm)',
        data: filteredEntries.map(entry => entry.headCircumference),
        borderColor: 'rgba(255, 159, 64, 1)',
        fill: false,
        yAxisID: 'y1',
      }
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Weight (kg)',
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Length (cm)',
        }
      },
    }
  };

  // Function to get recommended growth values based on age
  const getRecommendedValues = (age: number) => {
    const gender = activeProfileData?.gender || 'unknown';
    
    if (gender === 'male') {
      if (age <= 12) {
        return {
          weight: 8 + age * 0.5,
          height: 70 + age * 1.2,
          head: 40 + age * 0.4,
        };
      } else if (age <= 24) {
        return {
          weight: 10 + age * 0.3,
          height: 80 + age * 1.1,
          head: 42 + age * 0.3,
        };
      } else {
        return {
          weight: 12 + age * 0.2,
          height: 90 + age * 1.0,
          head: 44 + age * 0.2,
        };
      }
    } else {
      if (age <= 12) {
        return {
          weight: 7.5 + age * 0.45,
          height: 68 + age * 1.1,
          head: 39 + age * 0.38,
        };
      } else if (age <= 24) {
        return {
          weight: 9.5 + age * 0.25,
          height: 78 + age * 1.0,
          head: 41 + age * 0.25,
        };
      } else {
        return {
          weight: 11.5 + age * 0.18,
          height: 88 + age * 0.9,
          head: 43 + age * 0.15,
        };
      }
    }
  };

  // If no active profile, show a message
  if (!activeProfileData) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen pt-20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Growth Log</CardTitle>
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
          <CardTitle className="text-2xl">
            Growth Log for {activeProfileData.name} ({calculateAge(activeProfileData.birthDate)})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Unit System Selector */}
          <div className="flex gap-4 items-center">
            <Label>Units:</Label>
            <Select value={unitSystem} onValueChange={(v) => setUnitSystem(v as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                <SelectItem value="imperial">Imperial (lbs, in)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <Label>Entry Date</Label>
              <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required />
            </div>
            <div>
              <Label>Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})</Label>
              <Input value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
            <div>
              <Label>Height ({unitSystem === 'metric' ? 'cm' : 'in'})</Label>
              <Input value={height} onChange={(e) => setHeight(e.target.value)} required />
            </div>
            <div>
              <Label>Head Circumference ({unitSystem === 'metric' ? 'cm' : 'in'})</Label>
              <Input value={head} onChange={(e) => setHead(e.target.value)} required />
            </div>
            <div className="sm:col-span-4">
              <Button type="submit">{editId ? 'Update Entry' : 'Add Entry'}</Button>
            </div>
          </form>

          <Table>
            <TableCaption>Growth log for {activeProfileData.name}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Age (mo)</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Height</TableHead>
                <TableHead>Head</TableHead>
                <TableHead>Percentiles</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => {
                  const age = calculateAgeInMonths(entry.date);
                  const percentiles = calculatePercentile(entry);
                  const recommendedValues = age !== null ? getRecommendedValues(age) : { weight: 0, height: 0, head: 0 };
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{age}</TableCell>
                      <TableCell>{convertWeight(entry.weight)} {unitSystem === 'metric' ? 'kg' : 'lbs'}</TableCell>
                      <TableCell>{convertHeight(entry.height)} {unitSystem === 'metric' ? 'cm' : 'in'}</TableCell>
                      <TableCell>{convertHeight(entry.headCircumference)} {unitSystem === 'metric' ? 'cm' : 'in'}</TableCell>
                      <TableCell>
                        W: {percentiles.weightPercentile}, H: {percentiles.heightPercentile}, HC: {percentiles.headPercentile}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>Edit</Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(entry.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No growth entries yet. Add your first entry above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Chart */}
          {filteredEntries.length > 0 && (
            <div className="mt-6">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}