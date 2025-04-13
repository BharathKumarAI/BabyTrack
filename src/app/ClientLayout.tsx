// ClientLayout.tsx (client component)
'use client';

import { Navbar } from "@/components/ui/navbar";
import { BabyProfileProvider } from './BabyProfileContext';
import { useState, createContext, useContext, useEffect } from "react";

const DarkModeContext = createContext({
  isDarkMode: false,
  setIsDarkMode: (_: boolean) => {},
});

export const useDarkMode = () => useContext(DarkModeContext);

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
      <DarkModeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
          <BabyProfileProvider>
            {children}
            <Navbar />
          </BabyProfileProvider>
      </DarkModeContext.Provider>
  );
}