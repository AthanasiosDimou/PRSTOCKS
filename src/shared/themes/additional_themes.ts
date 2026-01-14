// =============================================================================
// ADDITIONAL THEMES FOR POSEIDON RACING STOCK MANAGEMENT
// =============================================================================
// Adding more themes to match the desired variety

import { Theme } from './theme_definitions';

/**
 * Light Mint Theme - Fresh mint green for light mode
 */
export const lightMintTheme: Theme = {
  id: 'light-mint',
  name: 'Light Mint',
  description: 'Fresh mint green theme for a clean look',
  isDark: false,
  icon: 'mint',
  colors: {
    primary: '#00C896',
    secondary: '#4ECDC4',
    background: '#F8FFFE',
    surface: '#F0FDF9',
    surfaceVariant: '#E8F5F0',
    onBackground: '#1F2937',
    onSurface: '#1F2937',
    onPrimary: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    border: '#A7F3D0',
    divider: '#BBFDD7',
    hover: 'rgba(0, 200, 150, 0.04)',
    active: 'rgba(0, 200, 150, 0.08)',
    disabled: '#9CA3AF',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)'
  }
};

/**
 * Light Pink Theme - Soft pink for light mode
 */
export const lightPinkTheme: Theme = {
  id: 'light-pink',
  name: 'Light Pink',
  description: 'Soft pink theme for a warm feeling',
  isDark: false,
  icon: 'blossom',
  colors: {
    primary: '#F472B6',
    secondary: '#FB7185',
    background: '#FFFBFE',
    surface: '#FEF7FF',
    surfaceVariant: '#FCE7F3',
    onBackground: '#1F2937',
    onSurface: '#1F2937',
    onPrimary: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    border: '#FBCFE8',
    divider: '#FCCDD3',
    hover: 'rgba(244, 114, 182, 0.04)',
    active: 'rgba(244, 114, 182, 0.08)',
    disabled: '#9CA3AF',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)'
  }
};

/**
 * Cyberpunk Theme - Neon cyan and magenta
 */
export const cyberpunkTheme: Theme = {
  id: 'cyberpunk',
  name: 'Cyberpunk',
  description: 'Futuristic neon theme inspired by cyberpunk aesthetics',
  isDark: true,
  icon: 'circuit',
  colors: {
    primary: '#00FFFF',
    secondary: '#FF00FF',
    background: '#0A0A0A',
    surface: '#1A1A2E',
    surfaceVariant: '#16213E',
    onBackground: '#E0E0E0',
    onSurface: '#FFFFFF',
    onPrimary: '#000000',
    success: '#00FF41',
    warning: '#FFA500',
    error: '#FF0040',
    info: '#00BFFF',
    border: '#0F3460',
    divider: '#533483',
    hover: 'rgba(0, 255, 255, 0.08)',
    active: 'rgba(0, 255, 255, 0.16)',
    disabled: '#6A6A6A',
    shadow: 'rgba(0, 255, 255, 0.2)',
    overlay: 'rgba(10, 10, 10, 0.8)'
  }
};

/**
 * Arctic Theme - Cool blue-white theme
 */
export const arcticTheme: Theme = {
  id: 'arctic',
  name: 'Arctic Blue',
  description: 'Cool arctic theme with ice-blue tones',
  isDark: true,
  icon: 'snowflake',
  colors: {
    primary: '#60A5FA',
    secondary: '#93C5FD',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    onBackground: '#F1F5F9',
    onSurface: '#FFFFFF',
    onPrimary: '#000000',
    success: '#22D3EE',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#38BDF8',
    border: '#475569',
    divider: '#64748B',
    hover: 'rgba(96, 165, 250, 0.08)',
    active: 'rgba(96, 165, 250, 0.16)',
    disabled: '#6B7280',
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(15, 23, 42, 0.8)'
  }
};

/**
 * Golden Theme - Warm gold and yellow tones
 */
export const goldenTheme: Theme = {
  id: 'golden',
  name: 'Golden Hour',
  description: 'Warm golden theme inspired by sunset hours',
  isDark: true,
  icon: 'sun-low',
  colors: {
    primary: '#FBBF24',
    secondary: '#F59E0B',
    background: '#1C1917',
    surface: '#292524',
    surfaceVariant: '#44403C',
    onBackground: '#FEF3C7',
    onSurface: '#FFFFFF',
    onPrimary: '#000000',
    success: '#84CC16',
    warning: '#EAB308',
    error: '#EF4444',
    info: '#06B6D4',
    border: '#57534E',
    divider: '#78716C',
    hover: 'rgba(251, 191, 36, 0.08)',
    active: 'rgba(251, 191, 36, 0.16)',
    disabled: '#A8A29E',
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(28, 25, 23, 0.8)'
  }
};

/**
 * Lavender Theme - Soft purple and blue
 */
export const lavenderTheme: Theme = {
  id: 'lavender',
  name: 'Lavender Dream',
  description: 'Soft lavender theme for a calming experience',
  isDark: true,
  icon: 'flower',
  colors: {
    primary: '#A78BFA',
    secondary: '#C4B5FD',
    background: '#1E1B26',
    surface: '#2D2B36',
    surfaceVariant: '#3C3A46',
    onBackground: '#F3F0FF',
    onSurface: '#FFFFFF',
    onPrimary: '#000000',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#F87171',
    info: '#60A5FA',
    border: '#4C4556',
    divider: '#6B6576',
    hover: 'rgba(167, 139, 250, 0.08)',
    active: 'rgba(167, 139, 250, 0.16)',
    disabled: '#8B8A96',
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(30, 27, 38, 0.8)'
  }
};

/**
 * Emerald Theme - Rich green tones
 */
export const emeraldTheme: Theme = {
  id: 'emerald',
  name: 'Emerald Forest',
  description: 'Rich emerald green theme inspired by deep forests',
  isDark: true,
  icon: 'gem',
  colors: {
    primary: '#10B981',
    secondary: '#34D399',
    background: '#022C22',
    surface: '#064E3B',
    surfaceVariant: '#065F46',
    onBackground: '#ECFDF5',
    onSurface: '#FFFFFF',
    onPrimary: '#FFFFFF',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    border: '#047857',
    divider: '#059669',
    hover: 'rgba(16, 185, 129, 0.08)',
    active: 'rgba(16, 185, 129, 0.16)',
    disabled: '#6B7280',
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(2, 44, 34, 0.8)'
  }
};

// Export all new themes
export const additionalThemes = [
  lightMintTheme,
  lightPinkTheme,
  cyberpunkTheme,
  arcticTheme,
  goldenTheme,
  lavenderTheme,
  emeraldTheme
];
