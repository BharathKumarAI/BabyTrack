import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BabyProfile {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  notes?: string;
  birthWeight?: number; // New field
  birthLength?: number; // New field
  additionalDetails?: string; // New field
  active: boolean;
}

interface BabyProfileContextType {
  profiles: BabyProfile[];
  activeProfileId: string | null;
  activeProfileData: BabyProfile | null;
  setActiveProfileId: (id: string | null) => void;
  addProfile: (profile: Omit<BabyProfile, 'id'>) => string;
  updateProfile: (id: string, profile: Partial<Omit<BabyProfile, 'id'>>) => void;
  deleteProfile: (id: string) => void;
  calculateAge: (birthDate: string) => string;
}

const BabyProfileContext = createContext<BabyProfileContextType | undefined>(undefined);

export function BabyProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<BabyProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  useEffect(() => {
    const savedProfiles = localStorage.getItem('babyProfiles');
    const savedActiveProfileId = localStorage.getItem('activeProfileId');
    
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    }
    
    if (savedActiveProfileId) {
      setActiveProfileId(savedActiveProfileId);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('babyProfiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (activeProfileId) {
      localStorage.setItem('activeProfileId', activeProfileId);
    } else {
      localStorage.removeItem('activeProfileId');
    }
  }, [activeProfileId]);

  const activeProfileData = activeProfileId 
    ? profiles.find(profile => profile.id === activeProfileId) || null
    : null;

  const addProfile = (profile: Omit<BabyProfile, 'id'>) => {
    const id = Date.now().toString();
    const newProfile = { ...profile, id };
    setProfiles(prev => [...prev, newProfile]);
    return id;
  };

  const updateProfile = (id: string, profileUpdates: Partial<Omit<BabyProfile, 'id'>>) => {
    setProfiles(prev => 
      prev.map(profile => 
        profile.id === id ? { ...profile, ...profileUpdates } : profile
      )
    );
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(profile => profile.id !== id));
    if (activeProfileId === id) {
      setActiveProfileId(null);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    const days = today.getDate() - birth.getDate();
    
    return `${years}y ${months}m ${days}d`;
  };

  return (
    <BabyProfileContext.Provider
      value={{
        profiles,
        activeProfileId,
        activeProfileData,
        setActiveProfileId,
        addProfile,
        updateProfile,
        deleteProfile,
        calculateAge
      }}
    >
      {children}
    </BabyProfileContext.Provider>
  );
}

export function useBabyProfile() {
  const context = useContext(BabyProfileContext);
  if (context === undefined) {
    throw new Error('useBabyProfile must be used within a BabyProfileProvider');
  }
  return context;
}