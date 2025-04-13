// app/layout.tsx
'use client';

import './globals.css';
import { BabyProfileProvider } from './BabyProfileContext';
import { Navbar } from '@/components/ui/navbar'; // Import the Navbar component
import { useState, createContext, useContext } from 'react';

export const DarkModeContext = createContext({
  darkMode: false,
  setDarkMode: (value: boolean) => {},
});

export const useDarkMode = () => useContext(DarkModeContext);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <html lang="en" className={darkMode ? 'dark' : ''}>
      <body className="min-h-screen bg-background">
        <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
          <BabyProfileProvider>
            <div className="pb-20"> {/* Add padding to bottom to account for navbar */}
              {children}
            </div>
            <Navbar /> {/* Add the navbar component */}
          </BabyProfileProvider>
        </DarkModeContext.Provider>
      </body>
    </html>
  );
}