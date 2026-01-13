import React, { createContext, useContext, useState } from 'react';

const welcomeThemes = [
  { name: 'Teal', gradient: 'linear-gradient(100deg, #14b8a6 0%, #0f172a 116%)' },
  { name: 'Blue', gradient: 'linear-gradient(100deg, #2563eb 0%, #1e293b 116%)' },
  { name: 'Purple', gradient: 'linear-gradient(100deg, #9333ea 0%, #1e293b 116%)' },
  { name: 'Green', gradient: 'linear-gradient(100deg, #16a34a 0%, #064e3b 116%)' },
  { name: 'Orange', gradient: 'linear-gradient(100deg, #ea580c 0%, #431407 116%)' },
  { name: 'Red', gradient: 'linear-gradient(100deg, #dc2626 0%, #450a0a 116%)' },
];

interface ThemeContextType {
  currentTheme: typeof welcomeThemes[0];
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [index, setIndex] = useState(() => Number(localStorage.getItem('app-theme-index') || 0));

  const cycleTheme = () => {
    setIndex((prev) => {
      const next = (prev + 1) % welcomeThemes.length;
      localStorage.setItem('app-theme-index', String(next));
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ currentTheme: welcomeThemes[index], cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};