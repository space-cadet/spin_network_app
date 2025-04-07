import React, { useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectTheme } from '../../store/selectors';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useAppSelector(selectTheme);
  
  useEffect(() => {
    // Determine if we should use dark mode
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDarkMode = 
      theme === 'dark' || 
      (theme === 'system' && systemPrefersDark);
    
    // Apply dark mode class to the document
    if (shouldUseDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;
