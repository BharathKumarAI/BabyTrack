// app/log/health/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBabyProfile } from '@/app/BabyProfileContext';
import { format, parseISO, subDays } from 'date-fns';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface HealthEntry {
  id: string;
  babyId: string;
  date: string;
  condition: string;
  symptoms: string[];
  temperature: string;
  actionTaken: string;
  medications: string;
  doctorVisit: boolean;
  doctorNotes: string;
  status: 'active' | 'monitoring' | 'resolved';
  followUpDate?: string;
  notes: string;
}

export default function HealthPage() {
  const { activeProfileData } = useBabyProfile();
  const [healthEntries, setHealthEntries] = useState<HealthEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<HealthEntry | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTimeframe, setFilterTimeframe] = useState<string>('all');

  // Form states
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [condition, setCondition] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [temperature, setTemperature] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [medications, setMedications] = useState('');
  const [doctorVisit, setDoctorVisit] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'monitoring' | 'resolved'>('active');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');
  const [symptomInput, setSymptomInput] = useState('');

  // Common symptoms list
  const commonSymptoms = [
    'Fever', 'Cough', 'Runny Nose', 'Congestion', 'Rash', 
    'Vomiting', 'Diarrhea', 'Constipation', 'Ear Pain', 
    'Fussiness', 'Poor Appetite', 'Difficulty Sleeping'
  ];

  // Common conditions list
  const commonConditions = [
    'Cold', 'Flu', 'Ear Infection', 'Diaper Rash', 
    'Eczema', 'Colic', 'Teething', 'Allergic Reaction',
    'RSV', 'Hand Foot Mouth Disease', 'Pink Eye', 'Thrush'
  ];

  useEffect(() => {
    if (activeProfileData?.id) {
      loadHealthEntries();
    }
  }, [activeProfileData?.id, filterStatus, filterTimeframe]);

  const loadHealthEntries = () => {
    const storedEntries = localStorage.getItem('healthEntries');
    if (storedEntries) {
      let parsedEntries = JSON.parse(storedEntries);
      
      // Filter by baby ID
      parsedEntries = parsedEntries.filter(entry => entry.babyId === activeProfileData.id);
      
      // Filter by status
      if (filterStatus !== 'all') {
        parsedEntries = parsedEntries.filter(entry => entry.status === filterStatus);
      }
      
      // Filter by timeframe
      if (filterTimeframe !== 'all') {
        const today = new Date();
        let cutoffDate;
        
        switch (filterTimeframe) {
          case 'week':
            cutoffDate = subDays(today, 7);
            break;
          case 'month':
            cutoffDate = subDays(today, 30);
            break;
          case 'threeMonths':
            cutoffDate = subDays(today, 90);
            break;
          default:
            cutoffDate = new Date(0); // Beginning of time
        }
        
        parsedEntries = parsedEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= cutoffDate;
        });
      }
      
      // Sort by date (newest first)
      parsedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setHealthEntries(parsedEntries);
    }
  };

  const resetForm = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setCondition('');
    setSymptoms([]);
    setTemperature('');
    setActionTaken('');
    setMedications('');
    setDoctorVisit(false);
    setDoctorNotes('');
    setStatus('active');
    setFollowUpDate('');
    setNotes('');
    setSymptomInput('');
  };

  const handleAddSymptom = () => {
    if (symptomInput && !symptoms.includes(symptomInput)) {
      setSymptoms([...symptoms, symptomInput]);
      setSymptomInput('');
    }
  };

  const handleRemoveSymptom = (symptomToRemove: string) => {
    setSymptoms(symptoms.filter(s => s !== symptomToRemove));
  };

  const handleAddCommonSymptom = (symptom: string) => {
    if (!symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const handleSubmit = () => {
    if (!condition || !date || !activeProfileData) return;

    const newEntry: HealthEntry = {
      id: Date.now().toString(),
      babyId: activeProfileData.id,
      date,
      condition,
      symptoms,
      temperature,
      actionTaken,
      medications,
      doctorVisit,
      doctorNotes,
      status,
      followUpDate: followUpDate || undefined,
      notes
    };

    // Save to localStorage
    const storedEntries = localStorage.getItem('healthEntries');
    const allEntries = storedEntries ? [...JSON.parse(storedEntries), newEntry] : [newEntry];
    localStorage.setItem('healthEntries', JSON.stringify(allEntries));

    // Update state
    setHealthEntries([newEntry, ...healthEntries]);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = () => {
    if (!selectedEntry || !condition || !date) return;

    const updatedEntry: HealthEntry = {
      ...selectedEntry,
      date,
      condition,
      symptoms,
      temperature,
      actionTaken,
      medications,
      doctorVisit,
      doctorNotes,
      status,
      followUpDate: followUpDate || undefined,
      notes
    };

    // Update in localStorage
    const storedEntries = localStorage.getItem('healthEntries');
    if (storedEntries) {
      const allEntries = JSON.parse(storedEntries);
      const updatedEntries = allEntries.map(entry => 
        entry.id === selectedEntry.id ? updatedEntry : entry
      );
      localStorage.setItem('healthEntries', JSON.stringify(updatedEntries));
    }

    // Update state
    setHealthEntries(healthEntries.map(entry => 
      entry.id === selectedEntry.id ? updatedEntry : entry
    ));
    
    setIsEditDialogOpen(false);
  };

  const handleDelete = () => {
    if (!selectedEntry) return;

    // Remove from localStorage
    const storedEntries = localStorage.getItem('healthEntries');
    if (storedEntries) {
      const allEntries = JSON.parse(storedEntries);
      const updatedEntries = allEntries.filter(entry => entry.id !== selectedEntry.id);
      localStorage.setItem('healthEntries', JSON.stringify(updatedEntries));
    }

    // Update state
    setHealthEntries(healthEntries.filter(entry => entry.id !== selectedEntry.id));
    setIsDeleteDialogOpen(false);
  };

  const openEditDialog = (entry: HealthEntry) => {
    setSelectedEntry(entry);
    setDate(entry.date);
    setCondition(entry.condition);
    setSymptoms(entry.symptoms || []);
    setTemperature(entry.temperature || '');
    setActionTaken(entry.actionTaken || '');
    setMedications(entry.medications || '');
    setDoctorVisit(entry.doctorVisit || false);
    setDoctorNotes(entry.doctorNotes || '');
    setStatus(entry.status);
    setFollowUpDate(entry.followUpDate || '');
    setNotes(entry.notes || '');
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (entry: HealthEntry) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'monitoring':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (!activeProfileData) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen pt-10 px-4">
        <Card className="w-full max-w-md shadow-lg border-2 border-primary">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Icons.alertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">
                Please set up a baby profile in settings to track health conditions.
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
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 dark:from-blue-950 dark:to-green-950 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-300">Health Tracker</h1>
                <p className="text-blue-600 dark:text-blue-400">
                  Tracking health conditions for {activeProfileData.name}
                </p>
              </div>
              <Icons.medication className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterTimeframe} onValueChange={setFilterTimeframe}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="threeMonths">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icons.add className="mr-2 h-4 w-4" />
                Add Health Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Health Condition</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      max={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°F)</Label>
                    <Input
                      id="temperature"
                      type="text"
                      placeholder="98.6"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <div className="flex gap-2">
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select or enter condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonConditions.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {condition === 'Other' && (
                      <Input
                        placeholder="Enter condition"
                        value={condition === 'Other' ? '' : condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="flex-1"
                      />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Symptoms</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {symptoms.map(symptom => (
                      <Badge key={symptom} variant="secondary" className="flex items-center gap-1">
                        {symptom}
                        <button 
                          onClick={() => handleRemoveSymptom(symptom)}
                          className="text-xs rounded-full hover:bg-muted p-1"
                        >
                          <Icons.close className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add symptom"
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSymptom();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddSymptom} size="sm">
                      Add
                    </Button>
                  </div>
                  
                  <div className="mt-2">
                    <Label className="text-sm text-muted-foreground">Common symptoms:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {commonSymptoms.map(symptom => (
                        <Badge 
                          key={symptom} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleAddCommonSymptom(symptom)}
                        >
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="actionTaken">Action Taken</Label>
                  <Textarea
                    id="actionTaken"
                    placeholder="What actions were taken to address the condition?"
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medications">Medications</Label>
                  <Textarea
                    id="medications"
                    placeholder="List any medications given"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="doctorVisit"
                    checked={doctorVisit}
                    onCheckedChange={setDoctorVisit}
                  />
                  <Label htmlFor="doctorVisit">Doctor Visit Required</Label>
                </div>
                
                {doctorVisit && (
                  <div className="space-y-2">
                    <Label htmlFor="doctorNotes">Doctor's Notes</Label>
                    <Textarea
                      id="doctorNotes"
                      placeholder="Notes from the doctor's visit"
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value: 'active' | 'monitoring' | 'resolved') => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="followUpDate">Follow-up Date (if needed)</Label>
                    <Input
                      id="followUpDate"
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes or observations"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {healthEntries.length > 0 ? (
          <div className="space-y-4">
            {healthEntries.map(entry => (
              <Card key={entry.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{entry.condition}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(entry.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(entry.status)}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="treatment">Treatment</TabsTrigger>
                      <TabsTrigger value="notes">Notes</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details" className="space-y-2 pt-2">
                      {entry.symptoms && entry.symptoms.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Symptoms:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.symptoms.map(symptom => (
                              <Badge key={symptom} variant="outline">{symptom}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {entry.temperature && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Temperature:</p>
                          <p>{entry.temperature}°F</p>
                        </div>
                      )}
                      
                      {entry.followUpDate && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Follow-up Date:</p>
                          <p>{format(new Date(entry.followUpDate), 'MMM d, yyyy')}</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="treatment" className="space-y-2 pt-2">
                      {entry.actionTaken && (
                        <div>
                          <p className="text-sm font-medium">Action Taken:</p>
                          <p className="text-sm">{entry.actionTaken}</p>
                        </div>
                      )}
                      
                      {entry.medications && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Medications:</p>
                          <p className="text-sm">{entry.medications}</p>
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium">Doctor Visit:</p>
                        <p className="text-sm">{entry.doctorVisit ? 'Yes' : 'No'}</p>
                      </div>
                      
                      {entry.doctorVisit && entry.doctorNotes && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Doctor's Notes:</p>
                          <p className="text-sm">{entry.doctorNotes}</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="notes" className="pt-2">
                      {entry.notes ? (
                        <p className="text-sm">{entry.notes}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No additional notes.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(entry)}
                    >
                      <Icons.edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => openDeleteDialog(entry)}
                    >
                      <Icons.delete className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Icons.alertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">
                No health entries found. Add your first health entry to start tracking.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Health Condition</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-temperature">Temperature (°F)</Label>
                <Input
                  id="edit-temperature"
                  type="text"
                  placeholder="98.6"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-condition">Condition</Label>
              <div className="flex gap-2">
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select or enter condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonConditions.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {condition === 'Other' && (
                  <Input
                    placeholder="Enter condition"
                    value={condition === 'Other' ? '' : condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="flex-1"
                  />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Symptoms</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {symptoms.map(symptom => (
                  <Badge key={symptom} variant="secondary" className="flex items-center gap-1">
                    {symptom}
                    <button 
                      onClick={() => handleRemoveSymptom(symptom)}
                      className="text-xs rounded-full hover:bg-muted p-1"
                    >
                      <Icons.close className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add symptom"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSymptom();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddSymptom} size="sm">
                  Add
                </Button>
              </div>
              
              <div className="mt-2">
                <Label className="text-sm text-muted-foreground">Common symptoms:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {commonSymptoms.map(symptom => (
                    <Badge 
                      key={symptom} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => handleAddCommonSymptom(symptom)}
                    >
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-actionTaken">Action Taken</Label>
              <Textarea
                id="edit-actionTaken"
                placeholder="What actions were taken to address the condition?"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-medications">Medications</Label>
              <Textarea
                id="edit-medications"
                placeholder="List any medications given"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-doctorVisit"
                checked={doctorVisit}
                onCheckedChange={setDoctorVisit}
              />
              <Label htmlFor="edit-doctorVisit">Doctor Visit Required</Label>
            </div>
            
            {doctorVisit && (
              <div className="space-y-2">
                <Label htmlFor="edit-doctorNotes">Doctor's Notes</Label>
                <Textarea
                  id="edit-doctorNotes"
                  placeholder="Notes from the doctor's visit"
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={status} onValueChange={(value: 'active' | 'monitoring' | 'resolved') => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-followUpDate">Follow-up Date (if needed)</Label>
                <Input
                  id="edit-followUpDate"
                  type="date"
                  value={followUpDate || ''}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Additional Notes</Label>
              <Textarea
                id="edit-notes"
                placeholder="Any additional notes or observations"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this health entry? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}