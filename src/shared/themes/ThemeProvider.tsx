// =============================================================================
// SIMPLIFIED THEME PROVIDER FOR DUAL DATABASE SYSTEM
// =============================================================================
// Simplified theme provider that quietly stores preferences without UI clutter

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Theme, 
  getInitialTheme, 
  applyThemeToCSS, 
  saveThemePreference,
  lightTheme,
  darkTheme,
  getThemeById
} from './theme_definitions';
import { UserPreferencesService } from '../services/UserPreferencesService';

// =============================================================================
// CONTEXT TYPE DEFINITIONS (Simplified)
// =============================================================================

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
  isDark: boolean;
  toggleTheme: () => void;
  username: string | null;
  userPreferences: any | null;
  userStats: any | null;
  isInitialized: boolean;
}

// =============================================================================
// CREATE CONTEXT
// =============================================================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// =============================================================================
// THEME PROVIDER COMPONENT (Simplified)
// =============================================================================

interface ThemeProviderProps {
  children: ReactNode;
  username?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, username }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme());
  const [userPreferences, setUserPreferences] = useState<any | null>(null);
  const [userStats, setUserStats] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // =============================================================================
  // QUIET INITIALIZATION (No UI feedback)
  // =============================================================================
  
  useEffect(() => {
    const initializeQuietly = async () => {
      if (!username) {
        console.warn('No username provided to ThemeProvider');
        setIsInitialized(true);
        return;
      }
      
      try {
        // Initialize device in background
        await UserPreferencesService.initializeDevice();
        
        // Get saved theme preference
        const preferences = await UserPreferencesService.getUserPreferences(username);
        setUserPreferences(preferences);
        
        // Get user stats (not really used)
        const stats = await UserPreferencesService.getDeviceStats(username);
        setUserStats(stats);
        
        if (preferences?.theme) {
          const savedTheme = getThemeById(preferences.theme) || getInitialTheme();
          setCurrentTheme(savedTheme);
          applyThemeToCSS(savedTheme);
        } else {
          // Save default theme quietly
          await UserPreferencesService.saveUserPreferences(username, {
            theme: currentTheme.id,
            language: 'en',
            items_per_page: 25,
            default_view: 'grid',
            notifications_enabled: true,
            auto_backup: false
          });
        }
        
        setIsInitialized(true);
        
      } catch (error) {
        // Fail silently, use local theme
        console.warn('Theme preferences will be stored locally only:', error);
        setIsInitialized(true);
      }
    };
    
    initializeQuietly();
  }, [username]);

  // =============================================================================
  // THEME CHANGE HANDLER (Simplified)
  // =============================================================================
  
  const setTheme = async (theme: Theme) => {
    // Update UI immediately
    setCurrentTheme(theme);
    applyThemeToCSS(theme);
    saveThemePreference(theme.id);
    
    // Save to database quietly in background
    if (username) {
      try {
        await UserPreferencesService.updateDeviceTheme(theme.id, username);
      } catch (error) {
        // Fail silently - theme still works locally
        console.warn('Could not save theme to database:', error);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = currentTheme.isDark ? lightTheme : darkTheme;
    setTheme(newTheme);
  };

  // =============================================================================
  // APPLY THEME
  // =============================================================================
  
  useEffect(() => {
    applyThemeToCSS(currentTheme);
  }, [currentTheme]);

  // =============================================================================
  // CONTEXT VALUE (Simplified)
  // =============================================================================
  
  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    isDark: currentTheme.isDark,
    toggleTheme,
    username: username || null,
    userPreferences,
    userStats,
    isInitialized
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// =============================================================================
// CUSTOM HOOK
// =============================================================================

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};


