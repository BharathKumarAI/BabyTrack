'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Line, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { useBabyProfile } from './BabyProfileContext';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Home, Baby, DollarSign, Activity } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

interface DiaperLog {
  id: string;
  babyId: string;
  date: string;
  time: string;
  type: string;
  notes?: string;
}

interface FeedingLog {
  id: string;
  babyId: string;
  date: string;
  time: string;
  type: string;
  amount?: string;
  unit?: string;
  notes?: string;
}

interface SleepLog {
  id: string;
  babyId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  quality: string;
  location: string;
  notes?: string;
}

interface Expense {
  id: string;
  babyId: string;
  category: string;
  amount: string;
  date: string;
  description?: string;
}

const formatDateTime = (dateStr, timeStr) => {
  try {
    if (!dateStr) return 'Unknown date';
    
    // For activities that might not have time
    if (!timeStr) {
      return format(new Date(dateStr), 'MMM d');
    }
    
    // Try to parse the combined date and time
    const dateTime = new Date(`${dateStr}T${timeStr || '00:00:00'}`);
    if (isNaN(dateTime.getTime())) {
      // If invalid, try just the date
      return format(new Date(dateStr), 'MMM d');
    }
    
    return format(dateTime, 'MMM d, h:mm a');
  } catch (error) {
    console.error('Error formatting date/time:', dateStr, timeStr, error);
    return 'Invalid date';
  }
};


export default function Dashboard() {
  const router = useRouter();
  const { activeProfileData } = useBabyProfile();
  const [filter, setFilter] = useState('daily');
  const [diaperData, setDiaperData] = useState<DiaperLog[]>([]);
  const [feedingData, setFeedingData] = useState<FeedingLog[]>([]);
  const [sleepData, setSleepData] = useState<SleepLog[]>([]);
  const [expensesData, setExpensesData] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    // Only fetch data if we have an active profile
    if (activeProfileData?.id) {
      fetchAllData();
    }
  }, [activeProfileData?.id, filter]);

  const fetchAllData = () => {
    fetchDiaperData();
    fetchFeedingData();
    fetchSleepData();
    fetchExpensesData();
    fetchHealthActivities();
  };

  // // In your useEffect where you load activities, add health activities
  // useEffect(() => {
  //     if (activeProfileData?.id) {
  //       // Fetch other activities...
  //       const diaperActivities = fetchDiaperData();
  //       const feedingActivities = fetchFeedingData();
  //       const sleepActivities = fetchSleepData();
        
  //       // Fetch health activities
  //       const healthActivities = fetchHealthActivities();
        
  //       // Combine all activities
  //       const allActivities = [
  //         ...diaperActivities,
  //         ...feedingActivities,
  //         ...sleepActivities,
  //         ...healthActivities,
  //         // ...other activities
  //       ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  //       .slice(0, 10);
        
  //       setRecentActivities(allActivities);
  //     }
  //   }, [activeProfileData?.id, filter]);

  const fetchDiaperData = () => {
    // Get diaper data from localStorage
    const storedDiaperLogs = localStorage.getItem('diaperLogs');
    if (storedDiaperLogs) {
      const parsedLogs = JSON.parse(storedDiaperLogs);
      // Filter logs for active baby
      const filteredLogs = parsedLogs.filter(log => log.babyId === activeProfileData.id);
      setDiaperData(filteredLogs);
    }
  };

  // Add this function to fetch health activities
  const fetchHealthActivities = () => {
    
    const storedEntries = localStorage.getItem('healthEntries');
    if (!storedEntries) return [];
    
    const parsedEntries = JSON.parse(storedEntries);
    return parsedEntries
      .filter(entry => entry.babyId === activeProfileData.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(entry => ({
        type: 'health',
        title: entry.condition,
        date: entry.date,
        status: entry.status,
        id: entry.id
      }));
  };

  const fetchFeedingData = () => {
    // Get feeding data from localStorage
    const storedFeedingLogs = localStorage.getItem('feedingLogs');
    if (storedFeedingLogs) {
      const parsedLogs = JSON.parse(storedFeedingLogs);
      // Filter logs for active baby
      const filteredLogs = parsedLogs.filter(log => log.babyId === activeProfileData.id);
      setFeedingData(filteredLogs);
    }
  };

  const fetchSleepData = () => {
    // Get sleep data from localStorage
    const storedSleepLogs = localStorage.getItem('sleepLogs');
    if (storedSleepLogs) {
      const parsedLogs = JSON.parse(storedSleepLogs);
      // Filter logs for active baby
      const filteredLogs = parsedLogs.filter(log => log.babyId === activeProfileData.id);
      setSleepData(filteredLogs);
    }
  };

  const fetchExpensesData = () => {
    // Get expenses data from localStorage
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
      const parsedExpenses = JSON.parse(storedExpenses);
      // Filter expenses for active baby
      const filteredExpenses = parsedExpenses.filter(expense => expense.babyId === activeProfileData.id);
      setExpensesData(filteredExpenses);
      
      // Calculate total expenses
      const total = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      setTotalExpenses(total);
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  // Filter data based on selected time period
  const getFilteredData = (data, dateField = 'date') => {
    if (!data || data.length === 0) return [];
    
    const today = new Date();
    const yesterday = subDays(today, 1);
    
    if (filter === 'today') {
      return data.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate.toDateString() === today.toDateString();
      });
    } else if (filter === 'daily') {
      // Last 7 days
      const sevenDaysAgo = subDays(today, 6);
      return data.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= sevenDaysAgo && itemDate <= today;
      });
    } else if (filter === 'monthly') {
      // Current month
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      return data.filter(item => {
        const itemDate = new Date(item[dateField]);
        return isWithinInterval(itemDate, { start: monthStart, end: monthEnd });
      });
    }
    
    return data; // Return all data for 'all' filter
  };

  // Prepare chart data based on the selected filter
  const prepareActivityChartData = () => {
    let labels = [];
    let diaperCounts = [];
    let feedingCounts = [];
    let sleepHours = [];

    const filteredDiaperData = getFilteredData(diaperData);
    const filteredFeedingData = getFilteredData(feedingData);
    const filteredSleepData = getFilteredData(sleepData);

    if (filter === 'today') {
      // For today, show hourly data
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      
      // Initialize counts
      diaperCounts = new Array(24).fill(0);
      feedingCounts = new Array(24).fill(0);
      sleepHours = new Array(24).fill(0);
      
      // Count activities by hour
      filteredDiaperData.forEach(log => {
        const hour = new Date(log.date + 'T' + log.time).getHours();
        diaperCounts[hour]++;
      });
      
      filteredFeedingData.forEach(log => {
        const hour = new Date(log.date + 'T' + log.time).getHours();
        feedingCounts[hour]++;
      });
      
      // For sleep, we need to count hours slept
      filteredSleepData.forEach(log => {
        const startHour = new Date(log.date + 'T' + log.startTime).getHours();
        const endHour = new Date(log.date + 'T' + log.endTime).getHours();
        
        // Handle sleep spanning multiple hours
        for (let h = startHour; h <= endHour; h++) {
          sleepHours[h % 24]++;
        }
      });
    } else if (filter === 'daily') {
      // For daily, show last 7 days
      labels = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'EEE');
      });
      
      // Initialize counts
      diaperCounts = new Array(7).fill(0);
      feedingCounts = new Array(7).fill(0);
      sleepHours = new Array(7).fill(0);
      
      // Count activities by day
      filteredDiaperData.forEach(log => {
        const logDate = new Date(log.date);
        const dayIndex = 6 - Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < 7) {
          diaperCounts[dayIndex]++;
        }
      });
      
      filteredFeedingData.forEach(log => {
        const logDate = new Date(log.date);
        const dayIndex = 6 - Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < 7) {
          feedingCounts[dayIndex]++;
        }
      });
      
      filteredSleepData.forEach(log => {
        const logDate = new Date(log.date);
        const dayIndex = 6 - Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < 7) {
          sleepHours[dayIndex] += log.duration / 60; // Convert minutes to hours
        }
      });
    } else if (filter === 'monthly') {
      // For monthly, show days of current month
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
      
      // Initialize counts
      diaperCounts = new Array(daysInMonth).fill(0);
      feedingCounts = new Array(daysInMonth).fill(0);
      sleepHours = new Array(daysInMonth).fill(0);
      
      // Count activities by day of month
      filteredDiaperData.forEach(log => {
        const day = new Date(log.date).getDate();
        diaperCounts[day - 1]++;
      });
      
      filteredFeedingData.forEach(log => {
        const day = new Date(log.date).getDate();
        feedingCounts[day - 1]++;
      });
      
      filteredSleepData.forEach(log => {
        const day = new Date(log.date).getDate();
        sleepHours[day - 1] += log.duration / 60; // Convert minutes to hours
      });
    }

    return {
      labels,
      datasets: [
        {
          label: 'Diaper Changes',
          data: diaperCounts,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.3,
        },
        {
          label: 'Feedings',
          data: feedingCounts,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.3,
        },
        {
          label: 'Sleep Hours',
          data: sleepHours,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
        }
      ]
    };
  };

  // Prepare expenses data for pie chart
  const prepareExpensesChartData = () => {
    // Group expenses by category
    const categories = {};
    const filteredExpenses = getFilteredData(expensesData);
    
    filteredExpenses.forEach(expense => {
      if (categories[expense.category]) {
        categories[expense.category] += parseFloat(expense.amount);
      } else {
        categories[expense.category] = parseFloat(expense.amount);
      }
    });

    return {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Get activity counts
  const getActivityCounts = () => {
    const filteredDiaperData = getFilteredData(diaperData);
    const filteredFeedingData = getFilteredData(feedingData);
    const filteredSleepData = getFilteredData(sleepData);
    
    return {
      diapers: filteredDiaperData.length,
      feedings: filteredFeedingData.length,
      sleep: filteredSleepData.reduce((total, log) => total + log.duration, 0) / 60, // hours
    };
  };

  // Calculate filtered expenses total
  const getFilteredExpensesTotal = () => {
    const filteredExpenses = getFilteredData(expensesData);
    return filteredExpenses.reduce((total, expense) => total + parseFloat(expense.amount), 0).toFixed(2);
  };

  const today = new Date();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-10 px-4">
      {!activeProfileData ? (
        <Card className="w-full max-w-md shadow-lg border-2 border-primary mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Baby className="h-12 w-12 text-primary mb-4" />
              <p className="text-center text-muted-foreground">
                Please set up a baby profile in settings to view the dashboard.
              </p>
              <Button onClick={() => router.push('/settings')} className="w-full mt-4">
                Go to Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="w-full max-w-4xl shadow-lg border-2 border-primary mb-8">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl text-primary">
                  <span className="flex items-center gap-2">
                    <Home className="h-6 w-6" />
                    Dashboard
                  </span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {format(today, 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">
                    Welcome back!
                  </h2>
                  <p className="text-muted-foreground">
                    Tracking {activeProfileData.name}'s activities and development
                  </p>
                </div>
                <Button onClick={() => router.push('/log')} className="whitespace-nowrap">
                  Log Activity
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary Cards */}
          <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Diaper Changes</p>
                    <h3 className="text-2xl font-bold text-blue-800">{getActivityCounts().diapers}</h3>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Feedings</p>
                    <h3 className="text-2xl font-bold text-green-800">{getActivityCounts().feedings}</h3>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Sleep Hours</p>
                    <h3 className="text-2xl font-bold text-purple-800">{getActivityCounts().sleep.toFixed(1)}</h3>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-pink-50 border-pink-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-pink-600 font-medium">Expenses</p>
                    <h3 className="text-2xl font-bold text-pink-800">${getFilteredExpensesTotal()}</h3>
                  </div>
                  <div className="p-2 bg-pink-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-pink-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Section */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="md:col-span-2 shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Activity Trends</CardTitle>
                  <Select value={filter} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="daily">Last 7 Days</SelectItem>
                      <SelectItem value="monthly">This Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {diaperData.length > 0 || feedingData.length > 0 || sleepData.length > 0 ? (
                    <Line data={prepareActivityChartData()} options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No activity data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Expenses</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.push('/log/expenses')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex justify-center items-center">
                  {expensesData.length > 0 ? (
                    <Pie data={prepareExpensesChartData()} options={{ maintainAspectRatio: false }} />
                  ) : (
                    <div className="text-center">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No expenses data available</p>
                      <Button 
                        onClick={() => router.push('/log/expenses')} 
                        className="mt-4"
                        variant="outline"
                      >
                        Add Expenses
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card className="w-full max-w-4xl shadow-md mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {diaperData.length > 0 || feedingData.length > 0 || sleepData.length > 0 ? (
                <div className="space-y-2">
                  {/* Combine and sort all activities by date/time */}
                  {[...diaperData.slice(0, 3).map(log => ({
                    type: 'Diaper',
                    date: log.date,
                    time: log.time,
                    details: `${log.type} diaper change`,
                  })), ...feedingData.slice(0, 3).map(log => ({
                    type: 'Feeding',
                    date: log.date,
                    time: log.time,
                    details: `${log.type} feeding${log.amount ? ` (${log.amount} ${log.unit})` : ''}`,
                  })), ...sleepData.slice(0, 3).map(log => ({
                    type: 'Sleep',
                    date: log.date,
                    time: log.startTime,
                    details: `Slept for ${(log.duration / 60).toFixed(1)} hours`,
                  }))].sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time}`);
                    const dateB = new Date(`${b.date}T${b.time}`);
                    return dateB.getTime() - dateA.getTime();
                  }).slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center p-3 border rounded-md">
                      <div className="mr-4">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'Diaper' ? 'bg-blue-100' : 
                          activity.type === 'Feeding' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          <Activity className={`h-5 w-5 ${
                            activity.type === 'Diaper' ? 'text-blue-600' : 
                            activity.type === 'Feeding' ? 'text-green-600' : 'text-purple-600'
                          }`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.type}</p>
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                        {formatDateTime(activity.date, activity.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No recent activities recorded for {activeProfileData.name}.
                  </p>
                  <Button onClick={() => router.push('/log')} className="mt-4">
                    Log Activity
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}