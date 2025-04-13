// app/expenses/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useBabyProfile } from '@/app/BabyProfileContext';
import { Pie, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Icons } from '@/components/icons';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface Expense {
  id: string;
  babyId: string;
  category: string;
  amount: string;
  date: string;
  description: string;
}

export default function ExpensesPage() {
  const { activeProfileData } = useBabyProfile();
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [chartView, setChartView] = useState('category'); // 'category' or 'timeline'
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (activeProfileData?.id) {
      loadExpenses();
    }
  }, [activeProfileData?.id, dateFilter]);

  const loadExpenses = () => {
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
      const parsedExpenses = JSON.parse(storedExpenses);
      // Filter expenses for active baby
      let filteredExpenses = parsedExpenses.filter(expense => expense.babyId === activeProfileData.id);
      
      // Apply date filter
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        filteredExpenses = filteredExpenses.filter(expense => 
          expense.date.startsWith(today)
        );
      } else if (dateFilter === 'thisWeek') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredExpenses = filteredExpenses.filter(expense => 
          new Date(expense.date) >= oneWeekAgo
        );
      } else if (dateFilter === 'thisMonth') {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        filteredExpenses = filteredExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === currentMonth && 
                 expenseDate.getFullYear() === currentYear;
        });
      }
      
      setExpenses(filteredExpenses);
    }
  };

  const handleAddExpense = () => {
    if (!category || !amount || !activeProfileData || !expenseDate) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      babyId: activeProfileData.id,
      category,
      amount,
      date: new Date(`${expenseDate}T12:00:00`).toISOString(), // Use noon to avoid timezone issues
      description
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);

    // Save to localStorage
    const storedExpenses = localStorage.getItem('expenses');
    let allExpenses = storedExpenses ? JSON.parse(storedExpenses) : [];
    allExpenses = [...allExpenses, newExpense];
    localStorage.setItem('expenses', JSON.stringify(allExpenses));

    // Reset form
    setCategory('');
    setAmount('');
    setDescription('');
    setExpenseDate(format(new Date(), 'yyyy-MM-dd'));
    setDialogOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);

    // Update localStorage
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
      let allExpenses = JSON.parse(storedExpenses);
      allExpenses = allExpenses.filter(expense => expense.id !== id);
      localStorage.setItem('expenses', JSON.stringify(allExpenses));
    }
  };

  const getFilteredExpenses = () => {
    if (filterCategory === 'all') {
      return expenses;
    }
    return expenses.filter(expense => expense.category === filterCategory);
  };

  const calculateTotalExpenses = () => {
    return getFilteredExpenses().reduce((total, expense) => total + parseFloat(expense.amount), 0).toFixed(2);
  };

  // Prepare expenses data for pie chart by category
  const prepareCategoryChartData = () => {
    // Group expenses by category
    const categories = {};
    expenses.forEach(expense => {
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
            'rgba(201, 203, 207, 0.6)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare expenses data for bar chart by timeline
  const prepareTimelineChartData = () => {
    // For monthly view
    if (dateFilter === 'thisMonth' || dateFilter === 'all') {
      const today = new Date();
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      
      // Create array of all days in month
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      // Initialize data for each day
      const dailyTotals = {};
      daysInMonth.forEach(day => {
        dailyTotals[format(day, 'dd')] = 0;
      });
      
      // Sum expenses by day
      expenses.forEach(expense => {
        try {
          const expenseDate = parseISO(expense.date);
          if (expenseDate >= monthStart && expenseDate <= monthEnd) {
            const day = format(expenseDate, 'dd');
            dailyTotals[day] += parseFloat(expense.amount);
          }
        } catch (error) {
          console.error('Error parsing date:', expense.date);
        }
      });
      
      return {
        labels: Object.keys(dailyTotals),
        datasets: [
          {
            label: 'Daily Expenses',
            data: Object.values(dailyTotals),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }
        ]
      };
    }
    
    // For weekly view
    if (dateFilter === 'thisWeek') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyTotals = {
        'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0
      };
      
      expenses.forEach(expense => {
        try {
          const expenseDate = parseISO(expense.date);
          const day = days[expenseDate.getDay()];
          dailyTotals[day] += parseFloat(expense.amount);
        } catch (error) {
          console.error('Error parsing date:', expense.date);
        }
      });
      
      return {
        labels: days,
        datasets: [
          {
            label: 'Daily Expenses',
            data: Object.values(dailyTotals),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }
        ]
      };
    }
    
    // For today's view
    if (dateFilter === 'today') {
      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      const hourlyTotals = {};
      hours.forEach(hour => {
        hourlyTotals[hour] = 0;
      });
      
      expenses.forEach(expense => {
        try {
          const expenseDate = parseISO(expense.date);
          const hour = `${expenseDate.getHours()}:00`;
          hourlyTotals[hour] += parseFloat(expense.amount);
        } catch (error) {
          console.error('Error parsing date:', expense.date);
        }
      });
      
      return {
        labels: hours,
        datasets: [
          {
            label: 'Hourly Expenses',
            data: Object.values(hourlyTotals),
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
          }
        ]
      };
    }
    
    // Default empty data
    return {
      labels: [],
      datasets: [
        {
          label: 'Expenses',
          data: [],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }
      ]
    };
  };

  if (!activeProfileData) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen pt-10 px-4">
        <Card className="w-full max-w-md shadow-lg border">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Icons.alertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">
                Please set up a baby profile in settings to track expenses.
              </p>
              <Button onClick={() => window.location.href = '/settings'} className="w-full mt-4">
                Go to Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-10 px-4 pb-20">
      <div className="w-full max-w-4xl mb-6">
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Expenses Tracker</h1>
                <p className="text-muted-foreground">
                  Tracking expenses for {activeProfileData.name}
                </p>
              </div>
              <Icons.expenses className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full max-w-4xl mb-6 flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600">
              <Icons.plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Toys">Toys</SelectItem>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Diapers">Diapers</SelectItem>
                    <SelectItem value="Childcare">Childcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter Amount"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expenseDate">Date</Label>
                <div className="flex items-center gap-2">
                  <Icons.calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expenseDate"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    max={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter Description"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleAddExpense} 
                className="bg-green-500 hover:bg-green-600"
                disabled={!category || !amount || !expenseDate}
              >
                Add Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {expenses.length > 0 && (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-md border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Expense Summary</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant={chartView === 'category' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setChartView('category')}
                  >
                    By Category
                  </Button>
                  <Button 
                    variant={chartView === 'timeline' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setChartView('timeline')}
                  >
                    Timeline
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="dateFilter">Time Period</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger id="dateFilter">
                    <SelectValue placeholder="Select Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-[250px]">
                {chartView === 'category' ? (
                  <Pie data={prepareCategoryChartData()} options={{ maintainAspectRatio: false }} />
                ) : (
                  <Bar data={prepareTimelineChartData()} options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} />
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-green-600">${calculateTotalExpenses()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border">
            <CardHeader>
              <CardTitle className="text-xl">Expenses List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Toys">Toys</SelectItem>
                      <SelectItem value="Clothing">Clothing</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Diapers">Diapers</SelectItem>
                      <SelectItem value="Childcare">Childcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Filtered Total</p>
                    <p className="text-lg font-bold">${calculateTotalExpenses()}</p>
                  </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                  {getFilteredExpenses().length > 0 ? (
                    <div className="space-y-2">
                      {getFilteredExpenses().map((expense) => (
                        <div key={expense.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-accent/50">
                          <div>
                            <p className="font-medium">{expense.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(expense.date), 'MMM d, yyyy')}
                            </p>
                            {expense.description && (
                              <p className="text-sm">{expense.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold">${parseFloat(expense.amount).toFixed(2)}</p>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {expenses.length > 0 
                          ? "No expenses match your filter criteria." 
                          : "No expenses found. Add some expenses to get started!"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!expenses.length && (
        <Card className="w-full max-w-4xl shadow-md border">
          <CardHeader>
            <CardTitle className="text-xl">Expenses List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Toys">Toys</SelectItem>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Diapers">Diapers</SelectItem>
                    <SelectItem value="Childcare">Childcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Filtered Total</p>
                  <p className="text-lg font-bold">${calculateTotalExpenses()}</p>
                </div>
              </div>

              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No expenses found. Add some expenses to get started!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}