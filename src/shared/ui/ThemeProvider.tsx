// =============================================================================
// THEME PROVIDER CONTEXT
// =============================================================================
// This provides theme functionality throughout the entire React app
// It's like a "theme manager" that all components can access

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Theme, 
  getInitialTheme, 
  applyThemeToCSS, 
  saveThemePreference,
  lightTheme,
  darkTheme
} from '../themes/theme_definitions';

// =============================================================================
// CONTEXT TYPE DEFINITIONS
// =============================================================================

interface ThemeContextType {
  currentTheme: Theme;                    // The currently active theme
  setTheme: (theme: Theme) => void;      // Function to change the theme
  isDark: boolean;                        // Quick check if current theme is dark
  toggleTheme: () => void;               // Quick toggle between light/dark
}

// =============================================================================
// CREATE CONTEXT
// =============================================================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// =============================================================================
// THEME PROVIDER COMPONENT
// =============================================================================

interface ThemeProviderProps {
  children: ReactNode;  // All the components that need access to theme
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  
  const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme());

  // =============================================================================
  // THEME CHANGE HANDLER
  // =============================================================================
  
  const setTheme = (theme: Theme) => {
    console.log(`🎨 ThemeProvider: Switching to ${theme.name}`);
    
    // Update state
    setCurrentTheme(theme);
    
    // Apply to CSS immediately
    applyThemeToCSS(theme);
    
    // Save preference
    saveThemePreference(theme.id);
    
    // Add a temporary class to document to help with transitions
    document.documentElement.classList.add('theme-changing');
    
    // Remove the class after a short delay
    setTimeout(() => {
      document.documentElement.classList.remove('theme-changing');
    }, 100);
  };

  // =============================================================================
  // QUICK TOGGLE FUNCTION
  // =============================================================================
  
  const toggleTheme = () => {
    // This is a simple toggle - you could make it more sophisticated
    // by cycling through all themes or remembering the last light/dark theme
    
    if (currentTheme.isDark) {
      setTheme(lightTheme);
    } else {
      setTheme(darkTheme);
    }
  };

  // =============================================================================
  // EFFECTS
  // =============================================================================
  
  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyThemeToCSS(currentTheme);
  }, [currentTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually selected a theme
      // (This is optional - you might want to always respect manual selection)
      console.log(`🌓 System theme changed to: ${e.matches ? 'dark' : 'light'}`);
      
      // You could implement auto-switching here if desired
      // For now, we'll just log it
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================
  
  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    isDark: currentTheme.isDark,
    toggleTheme
  };

  // =============================================================================
  // RENDER
  // =============================================================================
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// =============================================================================
// CUSTOM HOOK FOR USING THEME
// =============================================================================

/**
 * Custom hook to access theme functionality
 * Use this in any component that needs to work with themes
 * 
 * Example usage:
 * ```tsx
 * const { currentTheme, setTheme, isDark, toggleTheme } = useTheme();
 * ```
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

/**
 * Component that automatically applies theme classes to its children
 * Useful for sections that need theme-specific styling
 */
interface ThemedProps {
  children: ReactNode;
  className?: string;
}

export const Themed: React.FC<ThemedProps> = ({ children, className = '' }) => {
  const { currentTheme } = useTheme();
  
  const themeClasses = [
    `theme-${currentTheme.id}`,
    currentTheme.isDark ? 'theme-dark' : 'theme-light',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={themeClasses} data-theme={currentTheme.id}>
      {children}
    </div>
  );
};

/**
 * Component for theme-aware text color
 * Automatically uses the right text color for current theme
 */
interface ThemeTextProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'surface' | 'disabled';
  className?: string;
}

export const ThemeText: React.FC<ThemeTextProps> = ({ 
  children, 
  variant = 'primary', 
  className = '' 
}) => {
  const { currentTheme } = useTheme();
  
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return currentTheme.colors.onBackground;
      case 'secondary':
        return currentTheme.colors.disabled;
      case 'surface':
        return currentTheme.colors.onSurface;
      case 'disabled':
        return currentTheme.colors.disabled;
      default:
        return currentTheme.colors.onBackground;
    }
  };
  
  return (
    <span 
      className={className}
      style={{ color: getTextColor() }}
    >
      {children}
    </span>
  );
};

// =============================================================================
// THEME BUTTON COMPONENT
// =============================================================================

/**
 * Simple button component that's automatically themed
 */
interface ThemeButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  className?: string;
}

export const ThemeButton: React.FC<ThemeButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = ''
}) => {
  const { currentTheme } = useTheme();
  
  const getButtonStyles = () => {
    const baseStyles = {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      outline: 'none'
    };
    
    if (disabled) {
      return {
        ...baseStyles,
        backgroundColor: currentTheme.colors.disabled,
        color: currentTheme.colors.onBackground,
        opacity: 0.5
      };
    }
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: currentTheme.colors.primary,
          color: currentTheme.colors.onPrimary
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: currentTheme.colors.secondary,
          color: currentTheme.colors.onPrimary
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: currentTheme.colors.primary,
          border: `1px solid ${currentTheme.colors.primary}`
        };
      default:
        return baseStyles;
    }
  };
  
  return (
    <button
      className={className}
      style={getButtonStyles()}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default ThemeProvider;
