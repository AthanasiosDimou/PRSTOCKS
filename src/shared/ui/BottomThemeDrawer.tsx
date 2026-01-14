// =============================================================================
// BOTTOM THEME DRAWER COMPONENT
// =============================================================================
// A horizontal theme selector that slides up from the bottom like MUI Joy

import React, { useState, useEffect, useRef } from 'react';
import { 
  availableThemes, 
  Theme
} from '../themes/theme_definitions';
import { useTheme } from '../themes/DualThemeProvider';
import './BottomThemeDrawer.css';

// =============================================================================
// PROPS INTERFACE
// =============================================================================
interface BottomThemeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange?: (theme: Theme) => void;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const BottomThemeDrawer: React.FC<BottomThemeDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onThemeChange 
}) => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  const { currentTheme, setTheme } = useTheme();
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [autoCloseTimer, setAutoCloseTimer] = useState<number | null>(null);

  // =============================================================================
  // EFFECTS
  // =============================================================================
  
  // Handle clicks outside the drawer to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // Auto-close when mouse leaves the drawer area for too long
  useEffect(() => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }
    
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 30000); // Auto close after 30 seconds of inactivity (increased from 10)
      
      setAutoCloseTimer(timer as any);
    }

    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [isOpen, hoveredTheme]);

  // =============================================================================
  // THEME SELECTION HANDLER
  // =============================================================================
  const handleThemeSelect = (theme: Theme) => {
    console.log(`🎨 Switching to theme: ${theme.name}`);
    
    // Update current theme using context
    setTheme(theme);
    
    // Call optional callback
    onThemeChange?.(theme);
    
    // Don't auto-close the drawer - let user close it manually
  };

  // =============================================================================
  // THEME ICON MAPPING
  // =============================================================================
  const getThemeIcon = (theme: Theme): string => {
    const iconMap: Record<string, string> = {
      light: '☀️',
      dark: '🌙',
      ocean: '🌊',
      forest: '🌲',
      sunset: '🌅',
      purple: '👑',
      'light-mint': '🌿',
      'light-pink': '🌸',
      cyberpunk: '🤖',
      arctic: '❄️',
      golden: '✨',
      lavender: '💜',
      emerald: '💎'
    };
    
    return iconMap[theme.id] || '🎨';
  };

  // =============================================================================
  // MOUSE HANDLERS FOR AUTO-CLOSE
  // =============================================================================
  const handleMouseEnter = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
  };

  const handleMouseLeave = () => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Close after 3 seconds when mouse leaves
    setAutoCloseTimer(timer as any);
  };

  // =============================================================================
  // RENDER
  // =============================================================================
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="bottom-drawer-backdrop" onClick={onClose} />
      
      {/* Main Drawer */}
      <div
        ref={drawerRef}
        className={`bottom-theme-drawer ${isOpen ? 'visible' : 'hidden'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border,
          boxShadow: `0 -8px 32px ${currentTheme.colors.shadow}`
        }}
      >
        {/* Handle Bar */}
        <div 
          className="drawer-handle"
          style={{ backgroundColor: currentTheme.colors.border }}
        />
        
        {/* Header */}
        <div className="drawer-header">
          <h3 style={{ color: currentTheme.colors.onSurface }}>Choose Theme</h3>
          <button 
            className="close-button"
            onClick={onClose}
            style={{ 
              color: currentTheme.colors.disabled,
              backgroundColor: 'transparent'
            }}
          >
            ✕
          </button>
        </div>

        {/* Theme Selection Grid - Horizontal Scroll */}
        <div className="theme-selection-container">
          <div className="theme-selection-grid">
            {availableThemes.map((theme, index) => {
              const isSelected = currentTheme.id === theme.id;
              const isHovered = hoveredTheme === theme.id;
              
              return (
                <button
                  key={theme.id}
                  className={`theme-circular-button ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                  style={{
                    '--theme-primary': theme.colors.primary,
                    '--theme-background': theme.colors.background,
                    '--theme-surface': theme.colors.surface,
                    '--theme-secondary': theme.colors.secondary,
                    animationDelay: `${index * 50}ms`
                  } as React.CSSProperties}
                  onMouseEnter={() => setHoveredTheme(theme.id)}
                  onMouseLeave={() => setHoveredTheme(null)}
                  onClick={() => handleThemeSelect(theme)}
                  title={`${theme.name} - ${theme.description}`}
                >
                  {/* Theme Preview Circle */}
                  <div className="theme-preview-circle">
                    <div 
                      className="color-segment segment-1"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div 
                      className="color-segment segment-2"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                    <div 
                      className="color-segment segment-3"
                      style={{ backgroundColor: theme.colors.background }}
                    />
                    <div 
                      className="color-segment segment-4"
                      style={{ backgroundColor: theme.colors.surface }}
                    />
                  </div>
                  
                  {/* Theme Icon */}
                  <div className="theme-icon">
                    {getThemeIcon(theme)}
                  </div>
                  
                  {/* Theme Name */}
                  <div 
                    className="theme-name"
                    style={{ color: currentTheme.colors.onSurface }}
                  >
                    {theme.name}
                  </div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div 
                      className="selection-ring"
                      style={{ borderColor: currentTheme.colors.primary }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Theme Info */}
        <div className="current-theme-info">
          <div className="current-theme-text" style={{ color: currentTheme.colors.onSurface }}>
            <span className="label" style={{ color: currentTheme.colors.disabled }}>
              Current:
            </span>
            <span className="theme-name" style={{ color: currentTheme.colors.primary }}>
              {currentTheme.name}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomThemeDrawer;
