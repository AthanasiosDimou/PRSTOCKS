// =============================================================================
// THEME CONFIGURATION & UTILITIES
// =============================================================================
// This file defines all the available themes and provides utilities for theme management
// Think of it as the "color palette manager" for our entire application

// =============================================================================
// THEME TYPE DEFINITIONS
// =============================================================================

/**
 * Interface defining what colors each theme must have
 * This ensures all themes have the same structure for consistency
 */
export interface ThemeColors {
  // Main brand colors
  primary: string;          // Main action color (buttons, links)
  secondary: string;        // Secondary accent color
  
  // Background colors
  background: string;       // Main background
  surface: string;          // Cards, modals, elevated surfaces
  surfaceVariant: string;   // Alternative surface color
  
  // Text colors
  onBackground: string;     // Text on main background
  onSurface: string;        // Text on surface elements
  onPrimary: string;        // Text on primary colored elements
  
  // Status colors
  success: string;          // Green for success states
  warning: string;          // Yellow/orange for warnings
  error: string;            // Red for errors
  info: string;             // Blue for information
  
  // Border and divider colors
  border: string;           // Default border color
  divider: string;          // Line separators
  
  // Interactive states
  hover: string;            // Hover state overlay
  active: string;           // Active/pressed state
  disabled: string;         // Disabled element color
  
  // Special colors
  shadow: string;           // Drop shadows
  overlay: string;          // Modal overlays, backdrops
}

/**
 * Complete theme definition including colors and other properties
 */
export interface Theme {
  id: string;              // Unique identifier (e.g., 'dark', 'light', 'ocean')
  name: string;            // Display name (e.g., 'Dark Mode', 'Light Mode')
  description: string;     // Brief description for tooltips
  colors: ThemeColors;     // Color palette
  isDark: boolean;         // Whether this is a dark theme
  icon?: string;           // Optional icon name for theme selector
}

// =============================================================================
// PREDEFINED THEMES
// =============================================================================

/**
 * Light Theme - Clean and bright like VS Code Light+
 */
export const lightTheme: Theme = {
  id: 'light',
  name: 'Light Mode',
  description: 'Clean and bright theme for daytime use',
  isDark: false,
  icon: 'sun',
  colors: {
    primary: '#007ACC',
    secondary: '#6C7B95',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceVariant: '#F1F3F4',
    onBackground: '#1F2328',
    onSurface: '#24292F',
    onPrimary: '#FFFFFF',
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8',
    border: '#D1D9E0',
    divider: '#E1E4E8',
    hover: 'rgba(0, 0, 0, 0.04)',
    active: 'rgba(0, 0, 0, 0.08)',
    disabled: '#8B949E',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)'
  }
};

/**
 * Dark Theme - Sophisticated like VS Code Dark+
 */
export const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark Mode',
  description: 'Easy on the eyes for nighttime coding',
  isDark: true,
  icon: 'moon',
  colors: {
    primary: '#4FC3F7',
    secondary: '#81C784',
    background: '#1E1E1E',
    surface: '#252526',
    surfaceVariant: '#2D2D30',
    onBackground: '#CCCCCC',
    onSurface: '#FFFFFF',
    onPrimary: '#000000',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    border: '#3E3E42',
    divider: '#424242',
    hover: 'rgba(255, 255, 255, 0.04)',
    active: 'rgba(255, 255, 255, 0.08)',
    disabled: '#6A6A6A',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)'
  }
};

/**
 * Ocean Theme - Blue tones inspired by underwater scenes
 */
export const oceanTheme: Theme = {
  id: 'ocean',
  name: 'Ocean Blue',
  description: 'Calming blue tones like deep ocean waters',
  isDark: true,
  icon: 'waves',
  colors: {
    primary: '#00BCD4',
    secondary: '#4DD0E1',
    background: '#0D1B2A',
    surface: '#1B263B',
    surfaceVariant: '#415A77',
    onBackground: '#E0F2F1',
    onSurface: '#FFFFFF',
    onPrimary: '#000000',
    success: '#26A69A',
    warning: '#FFB74D',
    error: '#EF5350',
    info: '#29B6F6',
    border: '#546E7A',
    divider: '#37474F',
    hover: 'rgba(0, 188, 212, 0.08)',
    active: 'rgba(0, 188, 212, 0.16)',
    disabled: '#607D8B',
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(13, 27, 42, 0.8)'
  }
};

/**
 * Forest Theme - Green tones inspired by nature
 */
export const forestTheme: Theme = {
  id: 'forest',
  name: 'Forest Green',
  description: 'Natural green tones like a peaceful forest',
  isDark: true,
  icon: 'tree',
  colors: {
    primary: '#4CAF50',
    secondary: '#8BC34A',
    background: '#1B2D1B',
    surface: '#2E3B2E',
    surfaceVariant: '#3C4B3C',
    onBackground: '#E8F5E8',
    onSurface: '#FFFFFF',
    onPrimary: '#FFFFFF',
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#42A5F5',
    border: '#4E6B4E',
    divider: '#425642',
    hover: 'rgba(76, 175, 80, 0.08)',
    active: 'rgba(76, 175, 80, 0.16)',
    disabled: '#6B7B6B',
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(27, 45, 27, 0.8)'
  }
};

/**
 * Sunset Theme - Warm orange and pink tones
 */
export const sunsetTheme: Theme = {
  id: 'sunset',
  name: 'Sunset Orange',
  description: 'Warm sunset colors for a cozy feeling',
  isDark: true,
  icon: 'sunset',
  colors: {
    primary: '#FF7043',
    secondary: '#FFAB40',
    background: '#2D1B1B',
    surface: '#3B2E2E',
    surfaceVariant: '#4B3C3C',
    onBackground: '#FFF3E0',
    onSurface: '#FFFFFF',
    onPrimary: '#FFFFFF',
    success: '#66BB6A',
    warning: '#FFB74D',
    error: '#F44336',
    info: '#42A5F5',
    border: '#6B4E4E',
    divider: '#564242',
    hover: 'rgba(255, 112, 67, 0.08)',
    active: 'rgba(255, 112, 67, 0.16)',
    disabled: '#7B6B6B',
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(45, 27, 27, 0.8)'
  }
};

/**
 * Purple Theme - Rich purple tones for creativity
 */
export const purpleTheme: Theme = {
  id: 'purple',
  name: 'Royal Purple',
  description: 'Rich purple tones for creative minds',
  isDark: true,
  icon: 'crown',
  colors: {
    primary: '#9C27B0',
    secondary: '#BA68C8',
    background: '#1A0D1A',
    surface: '#2E1B2E',
    surfaceVariant: '#3C2E3C',
    onBackground: '#F3E5F5',
    onSurface: '#FFFFFF',
    onPrimary: '#FFFFFF',
    success: '#66BB6A',
    warning: '#FFB74D',
    error: '#EF5350',
    info: '#42A5F5',
    border: '#6B4E6B',
    divider: '#564256',
    hover: 'rgba(156, 39, 176, 0.08)',
    active: 'rgba(156, 39, 176, 0.16)',
    disabled: '#7B6B7B',
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(26, 13, 26, 0.8)'
  }
};

// =============================================================================
// THEME COLLECTION
// =============================================================================

// Import additional themes
import { additionalThemes } from './additional_themes';

/**
 * Array of all available themes
 * Add new themes here to make them available in the theme selector
 */
export const availableThemes: Theme[] = [
  lightTheme,
  darkTheme,
  oceanTheme,
  forestTheme,
  sunsetTheme,
  purpleTheme,
  ...additionalThemes
];

// =============================================================================
// THEME UTILITY FUNCTIONS
// =============================================================================

/**
 * Gets a theme by its ID
 * @param themeId - ID of the theme to find
 * @returns The theme object or the default light theme if not found
 */
export function getThemeById(themeId: string): Theme {
  return availableThemes.find(theme => theme.id === themeId) || lightTheme;
}

/**
 * Gets all available theme IDs
 * @returns Array of theme IDs
 */
export function getThemeIds(): string[] {
  return availableThemes.map(theme => theme.id);
}

/**
 * Gets all light themes
 * @returns Array of light themes
 */
export function getLightThemes(): Theme[] {
  return availableThemes.filter(theme => !theme.isDark);
}

/**
 * Gets all dark themes
 * @returns Array of dark themes
 */
export function getDarkThemes(): Theme[] {
  return availableThemes.filter(theme => theme.isDark);
}

/**
 * Applies theme colors to CSS custom properties
 * This function updates the CSS variables that control the app's appearance
 * @param theme - Theme to apply
 */
export function applyThemeToCSS(theme: Theme): void {
  const root = document.documentElement;
  
  // Apply all color variables with the '--theme-' prefix
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });
  
  // Set additional helpful variables
  root.style.setProperty('--theme-is-dark', theme.isDark ? '1' : '0');
  root.style.setProperty('--theme-name', theme.name);
  
  console.log(`🎨 Applied theme: ${theme.name}`);
}

/**
 * Detects user's system theme preference
 * @returns 'dark' if user prefers dark mode, 'light' otherwise
 */
export function detectSystemTheme(): 'dark' | 'light' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light'; // Default fallback
}

/**
 * Creates a custom theme based on a base theme with color overrides
 * @param baseTheme - Theme to use as starting point
 * @param colorOverrides - Colors to override
 * @param customName - Name for the custom theme
 * @returns New custom theme
 */
export function createCustomTheme(
  baseTheme: Theme, 
  colorOverrides: Partial<ThemeColors>,
  customName: string
): Theme {
  return {
    ...baseTheme,
    id: `custom-${Date.now()}`,
    name: customName,
    description: `Custom theme based on ${baseTheme.name}`,
    colors: {
      ...baseTheme.colors,
      ...colorOverrides
    }
  };
}

/**
 * Key used to store theme preference in localStorage
 */
const THEME_STORAGE_KEY = 'prstocks-theme-preference';

/**
 * Saves theme preference to localStorage
 * @param themeId - ID of the theme to save
 */
export function saveThemePreference(themeId: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    console.log(`💾 Saved theme preference: ${themeId}`);
  } catch (error) {
    console.warn('⚠️ Could not save theme preference:', error);
  }
}

/**
 * Loads theme preference from localStorage
 * @returns Saved theme ID or null if none saved
 */
export function loadThemePreference(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.warn('⚠️ Could not load theme preference:', error);
    return null;
  }
}

/**
 * Gets the initial theme based on saved preference or system preference
 * @returns Theme to use on app startup
 */
export function getInitialTheme(): Theme {
  // First, try to load saved preference
  const savedThemeId = loadThemePreference();
  if (savedThemeId) {
    const savedTheme = getThemeById(savedThemeId);
    if (savedTheme) {
      // console.log(`🎨 Using saved theme: ${savedTheme.name}`);
      // Note: For logged-in users, database preferences will override this
      return savedTheme;
    }
  }
  
  // Fall back to system preference
  const systemPreference = detectSystemTheme();
  const systemTheme = systemPreference === 'dark' ? darkTheme : lightTheme;
  console.log(`🎨 Using system theme: ${systemTheme.name}`);
  return systemTheme;
}
