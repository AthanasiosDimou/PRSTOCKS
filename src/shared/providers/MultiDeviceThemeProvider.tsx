// =============================================================================
// MULTI-DEVICE THEME PROVIDER
// =============================================================================
// Manages themes that sync across multiple devices for authenticated users

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Theme, 
  getInitialTheme, 
  applyThemeToCSS, 
  saveThemePreference,
  lightTheme,
  darkTheme,
  getThemeById
} from '../themes/theme_definitions';
import { CrossDevicePreferencesService } from '../services/preferences/CrossDevicePreferencesService';

// =============================================================================
// CONTEXT TYPE DEFINITIONS
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
// MULTI-DEVICE THEME PROVIDER COMPONENT
// =============================================================================

interface MultiDeviceThemeProviderProps {
  children: ReactNode;
  username?: string;
  syncMode?: 'local' | 'cross-device';
}

export const MultiDeviceThemeProvider: React.FC<MultiDeviceThemeProviderProps> = ({ 
  children, 
  username 
}) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme());
  const [userPreferences, setUserPreferences] = useState<any | null>(null);
  const [userStats, setUserStats] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const syncMode = username ? 'cross-device' : 'local';

  // =============================================================================
  // INITIALIZATION - LOAD USER PREFERENCES
  // =============================================================================
  
  useEffect(() => {
    const initializeThemeSystem = async () => {
      if (syncMode === 'cross-device' && username) {
        try {
          console.log(`🎨 Loading cross-device theme for user: ${username}`);
          await CrossDevicePreferencesService.initializeDevice();
          const preferences = await CrossDevicePreferencesService.getUserPreferences(username);
          console.log(`🎨 Backend preferences for ${username}:`, preferences);
          
          setUserPreferences(preferences);
          const stats = await CrossDevicePreferencesService.getDeviceStats(username);
          setUserStats(stats);
          
          // Always use backend theme if available, never localStorage for logged-in users
          let themeToApply;
          if (preferences?.theme) {
            themeToApply = getThemeById(preferences.theme);
            console.log(`🎨 Using saved theme for ${username}: ${preferences.theme}`);
          }
          
          if (!themeToApply) {
            // No theme found in backend, use default dark theme and save it
            themeToApply = getThemeById('dark') || darkTheme;
            console.log(`🎨 No theme found for ${username}, using default: ${themeToApply.id}`);
            await CrossDevicePreferencesService.updateUserTheme(themeToApply.id, username);
          }
          
          console.log(`🎨 Final theme to apply for ${username}:`, themeToApply.id);
          setCurrentTheme(themeToApply);
          applyThemeToCSS(themeToApply);
          setIsInitialized(true);
        } catch (error) {
          console.warn('Cross-device theme sync failed, using local storage:', error);
          const fallbackTheme = getInitialTheme();
          setCurrentTheme(fallbackTheme);
          applyThemeToCSS(fallbackTheme);
          setIsInitialized(true);
        }
      } else {
        // Local-only mode (not logged in)
        console.log('🎨 Using local-only theme storage');
        const localTheme = getInitialTheme();
        setCurrentTheme(localTheme);
        applyThemeToCSS(localTheme);
        setIsInitialized(true);
      }
    };

    initializeThemeSystem();
  }, [username, syncMode]);

  // =============================================================================
  // THEME CHANGE HANDLER
  // =============================================================================
  
  const setTheme = async (theme: Theme) => {
    console.log(`🎨 Setting theme to: ${theme.id} for user: ${username || 'local'}`);
    
    // Always apply theme immediately for better UX
    setCurrentTheme(theme);
    applyThemeToCSS(theme);
    
    // Save to appropriate storage
    if (syncMode === 'cross-device' && username) {
      try {
        await CrossDevicePreferencesService.updateUserTheme(theme.id, username);
        console.log(`🎨 Theme ${theme.id} saved to server for ${username}`);
      } catch (error) {
        console.error(`🎨 Failed to save theme to server for ${username}:`, error);
        // Fall back to local storage if server save fails
        saveThemePreference(theme.id);
      }
    } else {
      // Local storage for non-authenticated users
      saveThemePreference(theme.id);
      console.log(`🎨 Theme ${theme.id} saved locally`);
    }
  };

  // =============================================================================
  // CONVENIENCE METHODS
  // =============================================================================
  
  const isDark = currentTheme.id.includes('dark') || currentTheme.id === 'midnight' || currentTheme.id === 'space';
  
  const toggleTheme = () => {
    const newTheme = isDark ? lightTheme : darkTheme;
    setTheme(newTheme);
  };

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================
  
  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    isDark,
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

export const useMultiDeviceTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useMultiDeviceTheme must be used within a MultiDeviceThemeProvider');
  }
  return context;
};

// =============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// =============================================================================

// Export with old names for backward compatibility during transition
export const DualThemeProvider = MultiDeviceThemeProvider;
export const useDualTheme = useMultiDeviceTheme;