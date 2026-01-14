// =============================================================================
// DRAWER THEMES COMPONENT
// =============================================================================
// Theme selector component for the horizontal drawer

import React from 'react';
import './DrawerThemes.css';

interface DrawerThemesProps {
  onThemeChange: (theme: string) => void;
  currentTheme?: string;
}

interface ThemeOption {
  id: string;
  name: string;
  className: string;
}

const themeOptions: ThemeOption[] = [
  { id: 'light', name: 'Light', className: 'theme-light' },
  { id: 'dark', name: 'Dark', className: 'theme-dark' },
  { id: 'blue', name: 'Blue', className: 'theme-blue' },
  { id: 'green', name: 'Green', className: 'theme-green' },
];

export const DrawerThemes: React.FC<DrawerThemesProps> = ({ 
  onThemeChange, 
  currentTheme = 'light' 
}) => {
  const handleThemeClick = (themeId: string) => {
    onThemeChange(themeId);
  };

  return (
    <div className="drawer-theme-container">
      {themeOptions.map((theme) => (
        <button
          key={theme.id}
          onClick={() => handleThemeClick(theme.id)}
          className={`drawer-theme-selector ${theme.className} ${
            currentTheme === theme.id ? 'active' : ''
          }`}
          type="button"
          aria-label={`Switch to ${theme.name} theme`}
          title={`Switch to ${theme.name} theme`}
        >
          <div className={`drawer-theme-icon ${theme.className}`} />
          <span className="drawer-theme-text">{theme.name}</span>
        </button>
      ))}
    </div>
  );
};
