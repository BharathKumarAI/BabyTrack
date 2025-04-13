'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { useBabyProfile } from '@/app/BabyProfileContext';
import { Badge } from '@/components/ui/badge';
import { Check, Edit, Trash2, UserPlus, UserX } from 'lucide-react';
import { useDarkMode } from '@/app/ClientLayout';

export default function Settings() {
  const { 
    profiles, 
    activeProfileId, 
    setActiveProfileId, 
    addProfile, 
    updateProfile, 
    deleteProfile,
    calculateAge 
  } = useBabyProfile();
  const { darkMode, setDarkMode } = useDarkMode();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [gender, setGender] = useState('');
  const [birthWeight, setBirthWeight] = useState('');
  const [birthLength, setBirthLength] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // Reset form fields
  const resetForm = () => {
    setName('');
    setBirthDate(format(new Date(), 'yyyy-MM-dd'));
    setGender('');
    setBirthWeight('');
    setBirthLength('');
    setBloodType('');
    setAllergies('');
    setNotes('');
    setPhotoUrl('');
    setIsActive(true);
  };
  
  // Handle edit profile
  const handleEditProfile = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setSelectedProfileId(profileId);
      setName(profile.name);
      setBirthDate(profile.birthDate);
      setGender(profile.gender);
      setNotes(profile.notes || '');
      setIsActive(profile.active);
      setBirthWeight(profile.birthWeight);
      setBirthLength(profile.birthLength);
      setBloodType(profile.bloodType);
      setAllergies(profile.allergies);
      setPhotoUrl(profile.photoUrl || '');
      setShowEditDialog(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        setPhotoUrl(event.target.result);
      }
    };

    reader.readAsDataURL(file);
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };
  
  // Handle save profile (add or edit)
  const handleSaveProfile = (isEdit: boolean = false) => {
    if (!name || !birthDate || !gender) {
      alert('Please fill in all required fields.');
      return;
    }
    
    const profileData = {
      name,
      birthDate,
      gender,
      birthWeight,
      birthLength,
      bloodType,
      allergies,
      notes,
      photoUrl: photoUrl || undefined,
      active: isActive
    };
    
    if (isEdit && selectedProfileId) {
      updateProfile(selectedProfileId, profileData);
      
      // If we're deactivating the active profile, set active profile to null
      if (selectedProfileId === activeProfileId && !isActive) {
        setActiveProfileId(null);
      }
      
      setShowEditDialog(false);
    } else {
      const newProfileId = addProfile(profileData);
      
      // If this is the first profile or isActive is true, set it as active
      if (profiles.length === 0 || isActive) {
        setActiveProfileId(newProfileId);
      }
      
      setShowAddDialog(false);
    }
    
    resetForm();
  };
  
  // Handle delete profile
  const handleDeleteProfile = () => {
    if (selectedProfileId) {
      deleteProfile(selectedProfileId);
      
      // If we're deleting the active profile, set active profile to null
      if (selectedProfileId === activeProfileId) {
        setActiveProfileId(null);
      }
      
      setShowDeleteDialog(false);
      setSelectedProfileId(null);
    }
  };
  
  // Handle activate/deactivate profile
  const handleToggleProfileActive = (profileId: string, active: boolean) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      updateProfile(profileId, { ...profile, active });
      
      // If we're deactivating the active profile, set active profile to null
      if (profileId === activeProfileId && !active) {
        setActiveProfileId(null);
      }
    }
  };
  
  // Handle set active profile
  const handleSetActiveProfile = (profileId: string) => {
    setActiveProfileId(profileId);
  };
  
  // Get active and inactive profiles
  const activeProfiles = profiles.filter(p => p.active);
  const inactiveProfiles = profiles.filter(p => !p.active);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-20 px-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Settings</CardTitle>
              <CardDescription>
                Manage baby profiles and application settings
              </CardDescription>
            </div>
            <Button onClick={() => {
              resetForm();
              setShowAddDialog(true);
            }}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Baby Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Profiles</TabsTrigger>
              <TabsTrigger value="inactive">Inactive Profiles</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              {activeProfiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeProfiles.map(profile => (
                    <Card key={profile.id} className={`overflow-hidden ${profile.id === activeProfileId ? 'border-2 border-primary' : ''}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{profile.name}</CardTitle>
                            <CardDescription>
                              {calculateAge(profile.birthDate)} • {profile.gender === 'male' ? 'Boy' : 'Girl'}
                            </CardDescription>
                          </div>
                          {profile.id === activeProfileId && (
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              <Check className="mr-1 h-3 w-3" /> Active
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">Birth Date:</span>
                            <span className="text-sm ml-2">{profile.birthDate}</span>
                          </div>
                          {profile.notes && (
                            <div>
                              <span className="text-sm font-medium">Notes:</span>
                              <p className="text-sm text-muted-foreground">{profile.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <div>
                          {profile.id !== activeProfileId && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSetActiveProfile(profile.id)}
                            >
                              Set Active
                            </Button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditProfile(profile.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedProfileId(profile.id);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleProfileActive(profile.id, false)}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No active baby profiles found.</p>
                  <p className="mt-2">Add a new profile to get started!</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="inactive" className="space-y-4">
              {inactiveProfiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inactiveProfiles.map(profile => (
                    <Card key={profile.id} className="overflow-hidden bg-muted/30">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-muted-foreground">{profile.name}</CardTitle>
                            <CardDescription>
                              {calculateAge(profile.birthDate)} • {profile.gender === 'male' ? 'Boy' : 'Girl'}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            Inactive
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">Birth Date:</span>
                            <span className="text-sm ml-2">{profile.birthDate}</span>
                          </div>
                          {profile.notes && (
                            <div>
                              <span className="text-sm font-medium">Notes:</span>
                              <p className="text-sm text-muted-foreground">{profile.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            handleToggleProfileActive(profile.id, true);
                            handleSetActiveProfile(profile.id);
                          }}
                        >
                          Activate
                        </Button>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditProfile(profile.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedProfileId(profile.id);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No inactive baby profiles found.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">App Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Dark Mode</h4>
                  <p className="text-sm text-muted-foreground">Toggle dark mode for the application</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-sm text-muted-foreground">Enable notifications for reminders</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Data Backup</h4>
                  <p className="text-sm text-muted-foreground">Automatically backup your data</p>
                </div>
                <Button variant="outline">Backup Now</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Profile Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Baby Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center mb-4">
                <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden relative">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt="Baby" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-500">
                      {name ? name.charAt(0).toUpperCase() : 'B'}
                    </div>
                  )}
                  <label 
                    htmlFor="photo-upload" 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white text-sm"
                  >
                    Change Photo
                  </label>
                  <input 
                    id="photo-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden"
                  />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Baby's Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter baby's name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input 
                id="birthDate" 
                type="date" 
                value={birthDate} 
                onChange={(e) => setBirthDate(e.target.value)} 
                max={format(new Date(), 'yyyy-MM-dd')}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Boy</SelectItem>
                  <SelectItem value="female">Girl</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthWeight">Birth Weight</Label>
                <Input 
                  id="birthWeight" 
                  value={birthWeight} 
                  onChange={(e) => setBirthWeight(e.target.value)} 
                  placeholder="e.g., 7.5 lbs"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthLength">Birth Length</Label>
                <Input 
                  id="birthLength" 
                  value={birthLength} 
                  onChange={(e) => setBirthLength(e.target.value)} 
                  placeholder="e.g., 20 inches"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select value={bloodType} onValueChange={setBloodType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type (if known)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input 
                id="allergies" 
                value={allergies} 
                onChange={(e) => setAllergies(e.target.value)} 
                placeholder="List any known allergies"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Add any additional notes"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="active" 
                checked={isActive} 
                onCheckedChange={setIsActive} 
              />
              <Label htmlFor="active">Set as active profile</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={() => handleSaveProfile(false)}>Add Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Baby Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Baby's Name</Label>
              <Input 
                id="edit-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter baby's name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-birthDate">Birth Date</Label>
              <Input 
                id="edit-birthDate" 
                type="date" 
                value={birthDate} 
                onChange={(e) => setBirthDate(e.target.value)} 
                max={format(new Date(), 'yyyy-MM-dd')}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-gender">Gender</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Boy</SelectItem>
                  <SelectItem value="female">Girl</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthWeight">Birth Weight (in kg)</Label>
              <Input 
                id="birthWeight" 
                type="number" 
                value={birthWeight} 
                onChange={(e) => setBirthWeight(e.target.value)} 
                placeholder="Enter birth weight"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthLength">Birth Length (in cm)</Label>
              <Input 
                id="birthLength" 
                type="number" 
                value={birthLength} 
                onChange={(e) => setBirthLength(e.target.value)} 
                placeholder="Enter birth length"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea 
                id="edit-notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Add any additional notes"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="edit-active" 
                checked={isActive} 
                onCheckedChange={setIsActive} 
              />
              <Label htmlFor="edit-active">Active profile</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={() => handleSaveProfile(true)}>Update Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Profile Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this baby profile and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProfile}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}