// =============================================================================
// THEME BUTTON COMPONENT - Beautiful Theme Toggle Button
// =============================================================================
// This component creates a beautiful button to open/close the theme drawer
// It shows the current theme and provides visual feedback

import React, { useState } from 'react';
import { useTheme } from '../themes/DualThemeProvider';
import './ThemeButton.css';

// =============================================================================
// PROPS INTERFACE
// =============================================================================
interface ThemeButtonProps {
  onClick: () => void;          // Function to call when button is clicked
  className?: string;           // Optional additional CSS classes
  showLabel?: boolean;          // Whether to show text label (default: true)
  size?: 'small' | 'medium' | 'large';  // Button size variant
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const ThemeButton: React.FC<ThemeButtonProps> = ({ 
  onClick, 
  className = '', 
  showLabel = true,
  size = 'medium'
}) => {
  // =============================================================================
  // HOOKS & STATE
  // =============================================================================
  const { currentTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // =============================================================================
  // THEME ICON MAPPING
  // =============================================================================
  const getThemeIcon = (): string => {
    // Map theme IDs to emoji icons for visual identification
    const iconMap: Record<string, string> = {
      light: '☀️',
      dark: '🌙',
      ocean: '🌊',
      forest: '🌲',
      sunset: '🌅',
      purple: '👑'
    };
    
    return iconMap[currentTheme.id] || '🎨';
  };

  // =============================================================================
  // SIZE MAPPING
  // =============================================================================
  const getSizeClass = (): string => {
    switch (size) {
      case 'small': return 'theme-button-small';
      case 'large': return 'theme-button-large';
      default: return 'theme-button-medium';
    }
  };

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  const handleClick = () => {
    console.log('🎨 Theme button clicked');
    onClick();
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  // =============================================================================
  // DYNAMIC STYLES
  // =============================================================================
  const buttonStyle = {
    '--theme-primary': currentTheme.colors.primary,
    '--theme-background': currentTheme.colors.background,
    '--theme-surface': currentTheme.colors.surface,
    '--theme-on-surface': currentTheme.colors.onSurface,
    '--theme-border': currentTheme.colors.border,
    '--theme-hover': currentTheme.colors.hover,
    '--theme-shadow': currentTheme.colors.shadow
  } as React.CSSProperties;

  // =============================================================================
  // CSS CLASSES
  // =============================================================================
  const buttonClasses = [
    'theme-toggle-button',
    getSizeClass(),
    isHovered ? 'hovered' : '',
    isPressed ? 'pressed' : '',
    currentTheme.isDark ? 'dark-theme' : 'light-theme',
    className
  ].filter(Boolean).join(' ');

  // =============================================================================
  // RENDER
  // =============================================================================
  return (
    <button
      className={buttonClasses}
      style={buttonStyle}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={`Current theme: ${currentTheme.name}. Click to change theme.`}
      aria-label={`Theme selector. Current theme: ${currentTheme.name}`}
    >
      {/* Theme Preview Circle */}
      <div className="theme-preview">
        <div 
          className="theme-color-segment primary"
          style={{ backgroundColor: currentTheme.colors.primary }}
        />
        <div 
          className="theme-color-segment secondary"
          style={{ backgroundColor: currentTheme.colors.secondary }}
        />
        <div 
          className="theme-color-segment background"
          style={{ backgroundColor: currentTheme.colors.background }}
        />
      </div>

      {/* Theme Icon */}
      <div className="theme-icon">
        {getThemeIcon()}
      </div>

      {/* Theme Label (optional) */}
      {showLabel && (
        <div className="theme-label">
          <span className="theme-name">{currentTheme.name}</span>
          <span className="theme-hint">Click to change</span>
        </div>
      )}

      {/* Ripple Effect Container */}
      <div className="ripple-container">
        <div className="ripple-effect" />
      </div>

      {/* Hover Glow Effect */}
      <div className="glow-effect" />
    </button>
  );
};

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

/**
 * Simple theme icon-only button for compact spaces
 */
interface CompactThemeButtonProps {
  onClick: () => void;
  className?: string;
}

export const CompactThemeButton: React.FC<CompactThemeButtonProps> = ({ 
  onClick, 
  className = '' 
}) => {
  return (
    <ThemeButton
      onClick={onClick}
      className={`compact-theme-button ${className}`}
      showLabel={false}
      size="small"
    />
  );
};

/**
 * Theme status indicator (read-only, no click action)
 */
interface ThemeIndicatorProps {
  className?: string;
  showDescription?: boolean;
}

export const ThemeIndicator: React.FC<ThemeIndicatorProps> = ({ 
  className = '',
  showDescription = false
}) => {
  const { currentTheme } = useTheme();
  
  const indicatorStyle = {
    '--theme-primary': currentTheme.colors.primary,
    '--theme-on-surface': currentTheme.colors.onSurface,
    '--theme-disabled': currentTheme.colors.disabled
  } as React.CSSProperties;

  return (
    <div 
      className={`theme-indicator ${className}`}
      style={indicatorStyle}
    >
      <div className="theme-dot" style={{ backgroundColor: currentTheme.colors.primary }} />
      <div className="theme-info">
        <span className="theme-name">{currentTheme.name}</span>
        {showDescription && (
          <span className="theme-description">{currentTheme.description}</span>
        )}
      </div>
    </div>
  );
};

export default ThemeButton;
