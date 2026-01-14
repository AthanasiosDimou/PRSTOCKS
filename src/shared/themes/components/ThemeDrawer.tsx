// =============================================================================
// THEME DRAWER COMPONENT - Horizontal Theme Selector
// =============================================================================
// This component creates a beautiful horizontal drawer like VS Code's theme selector
// It slides down from the top with circular theme buttons arranged horizontally

import React, { useState, useEffect, useRef } from 'react';
import { 
  availableThemes, 
  Theme, 
  applyThemeToCSS, 
  saveThemePreference,
  getInitialTheme 
} from '../theme_definitions';
import './ThemeDrawer.css';

// =============================================================================
// PROPS INTERFACE
// =============================================================================
interface ThemeDrawerProps {
  isOpen: boolean;                    // Whether the drawer is visible
  onClose: () => void;               // Function to call when drawer should close
  onThemeChange?: (theme: Theme) => void; // Optional callback when theme changes
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const ThemeDrawer: React.FC<ThemeDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onThemeChange 
}) => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme());
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // =============================================================================
  // EFFECTS
  // =============================================================================
  
  // Apply theme on component mount
  useEffect(() => {
    applyThemeToCSS(currentTheme);
  }, []);

  // Handle clicks outside the drawer to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Also close on Escape key
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // =============================================================================
  // THEME SELECTION HANDLER
  // =============================================================================
  const handleThemeSelect = (theme: Theme) => {
    console.log(`🎨 Switching to theme: ${theme.name}`);
    
    // Update current theme
    setCurrentTheme(theme);
    
    // Apply theme to CSS
    applyThemeToCSS(theme);
    
    // Save preference
    saveThemePreference(theme.id);
    
    // Call optional callback
    onThemeChange?.(theme);
    
    // Close drawer after selection
    setTimeout(() => {
      onClose();
    }, 300); // Small delay for smooth animation
  };

  // =============================================================================
  // THEME ICON MAPPING
  // =============================================================================
  const getThemeIcon = (theme: Theme): string => {
    // Map theme IDs to emoji icons for visual identification
    const iconMap: Record<string, string> = {
      light: '☀️',
      dark: '🌙',
      ocean: '🌊',
      forest: '🌲',
      sunset: '🌅',
      purple: '👑'
    };
    
    return iconMap[theme.id] || '🎨';
  };

  // =============================================================================
  // ANIMATION VARIANTS (simplified CSS-based animations)
  // =============================================================================
  const getAnimationClass = () => {
    return isOpen ? 'theme-drawer-visible' : 'theme-drawer-hidden';
  };

  // =============================================================================
  // RENDER
  // =============================================================================
  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="theme-drawer-backdrop"
            onClick={onClose}
          />
          
          {/* Main Drawer */}
          <div
            ref={drawerRef}
            className={`theme-drawer ${getAnimationClass()}`}
          >
            {/* Header */}
            <div className="theme-drawer-header">
              <h3 className="theme-drawer-title">Choose Your Theme</h3>
              <p className="theme-drawer-subtitle">
                Pick a color scheme that feels right for you
              </p>
            </div>

            {/* Theme Selection Grid */}
            <div className="theme-selection-grid">
              {availableThemes.map((theme, index) => {
                const isSelected = currentTheme.id === theme.id;
                const isHovered = hoveredTheme === theme.id;
                
                return (
                  <button
                    key={theme.id}
                    className={`theme-button ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                    style={{
                      '--theme-primary': theme.colors.primary,
                      '--theme-background': theme.colors.background,
                      '--theme-surface': theme.colors.surface,
                      '--theme-text': theme.colors.onSurface,
                      animationDelay: `${index * 100}ms`
                    } as React.CSSProperties}
                    onMouseEnter={() => setHoveredTheme(theme.id)}
                    onMouseLeave={() => setHoveredTheme(null)}
                    onClick={() => handleThemeSelect(theme)}
                  >
                    {/* Theme Preview Circle */}
                    <div className="theme-preview-circle">
                      <div 
                        className="theme-color-primary"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div 
                        className="theme-color-secondary"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <div 
                        className="theme-color-background"
                        style={{ backgroundColor: theme.colors.background }}
                      />
                    </div>
                    
                    {/* Theme Icon */}
                    <div className="theme-icon">
                      {getThemeIcon(theme)}
                    </div>
                    
                    {/* Theme Name */}
                    <div className="theme-name">
                      {theme.name}
                    </div>
                    
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="selection-indicator" />
                    )}
                    
                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div className="theme-tooltip">
                        {theme.description}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Current Theme Info */}
            <div className="current-theme-info">
              <div className="current-theme-text">
                <span className="label">Current Theme:</span>
                <span className="theme-name">{currentTheme.name}</span>
              </div>
              <div className="theme-description">
                {currentTheme.description}
              </div>
            </div>

            {/* Close Button */}
            <button
              className="close-button"
              onClick={onClose}
            >
              <span className="close-icon">✕</span>
              <span className="close-text">Close</span>
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default ThemeDrawer;
