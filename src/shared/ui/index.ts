// =============================================================================
// THEME COMPONENTS - Index File
// =============================================================================
// This file exports all theme components for easy importing

// Re-export theme provider components
export { 
  ThemeProvider, 
  useTheme
} from '../themes/ThemeProvider';

export {
  Themed, 
  ThemeText,
  ThemeButton as ThemedButton  // Rename to avoid conflict
} from '../themes/components';

// Re-export theme drawer
export { ThemeDrawer } from './ThemeDrawer';

// Re-export bottom theme drawer
export { BottomThemeDrawer } from './BottomThemeDrawer';

// Re-export theme button components
export { 
  ThemeButton, 
  CompactThemeButton, 
  ThemeIndicator 
} from './ThemeButton';
