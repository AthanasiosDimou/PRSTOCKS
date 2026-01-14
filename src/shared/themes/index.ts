// =============================================================================
// THEMES MODULE - Main Export File
// =============================================================================
// This file exports all theme-related functionality for easy importing
// Import everything you need from here: import { useTheme, ThemeDrawer } from './themes'

// =============================================================================
// THEME UTILITIES
// =============================================================================
export {
  // Theme type definitions
  type Theme,
  type ThemeColors,
  
  // Predefined themes
  lightTheme,
  darkTheme,
  oceanTheme,
  forestTheme,
  sunsetTheme,
  purpleTheme,
  availableThemes,
  
  // Theme utility functions
  getThemeById,
  getThemeIds,
  getLightThemes,
  getDarkThemes,
  applyThemeToCSS,
  detectSystemTheme,
  createCustomTheme,
  saveThemePreference,
  loadThemePreference,
  getInitialTheme
} from './theme_definitions';

// =============================================================================
// THEME COMPONENTS
// =============================================================================
export {
  // Theme context and provider
  ThemeProvider,
  useTheme
} from './ThemeProvider';

export {
  // Theme components
  Themed,
  ThemeText,
  ThemeButton as ThemedButton
} from './components';

export {
  // Theme selector drawer
  ThemeDrawer
} from './ThemeDrawer';

export {
  // Bottom theme drawer (horizontal)
  BottomThemeDrawer
} from './components/BottomThemeDrawer';

export {
  // Theme toggle button
  ThemeButton,
  CompactThemeButton,
  ThemeIndicator
} from './ThemeButton';

// =============================================================================
// OPTIONAL: THEME UTILITIES (additional helpers)
// =============================================================================
// Commented out temporarily to fix import issues
// export {
//   // CSS class helpers
//   createThemeClasses,
//   getThemeClass,
//   
//   // Color manipulation utilities
//   lightenColor,
//   darkenColor,
//   adjustColorOpacity,
//   getContrastColor,
//   
//   // Theme validation
//   validateTheme,
//   isValidThemeId
// } from './theme_utils/theme_helpers';
