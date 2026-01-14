// =============================================================================
// HORIZONTAL DRAWER COMPONENT
// =============================================================================
// Main horizontal drawer component with automation similar to your example
// but positioned horizontally (from the left side)

import React, { useState, useEffect } from 'react';
import { MyRadixIcon } from './icons/icons';
import { 
  InventoryButton, 
  InspectionButton, 
  FileOperationsButton, 
  SettingsButton 
} from './buttons';
import { DrawerThemes } from './themes/DrawerThemes';
import './HorizontalDrawer.css';

// Define ViewType for the application
export type ViewType = 'inventory' | 'inspection' | 'fileOperations' | 'settings';

interface RadixButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

const RadixButton: React.FC<RadixButtonProps> = ({ onClick, children, className, ariaLabel }) => {
  return (
    <button
      onClick={onClick}
      className={className}
      type="button"
      aria-label={ariaLabel || (typeof children === 'string' ? children : 'button')}
      aria-haspopup="true"
    >
      {children}
    </button>
  );
};

interface HorizontalDrawerProps {
  onSetView: (view: ViewType) => void;
  onThemeChange: (theme: string) => void;
  currentTheme?: string;
}

const HorizontalDrawer: React.FC<HorizontalDrawerProps> = ({ 
  onSetView, 
  onThemeChange,
  currentTheme = 'light'
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleCloseDrawerEvent = () => {
      setIsDrawerOpen(false);
    };

    // Auto-close when clicking outside drawer area
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Ensure drawer toggle button itself doesn't trigger close if clicked when open
      if (isDrawerOpen && !target.closest('.horizontal-drawer-content') && !target.closest('.drawer-toggle-button')) {
        setIsDrawerOpen(false);
      }
    };
    
    // Handle escape key
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    
    window.addEventListener('closeDrawer', handleCloseDrawerEvent);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      window.removeEventListener('closeDrawer', handleCloseDrawerEvent);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isDrawerOpen]);

  const handleRadixButtonClick = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleButtonHover = () => {
    // Only open if not already open, to prevent re-triggering on hover if manually opened
    if (!isDrawerOpen) {
        setIsDrawerOpen(true);
    }
  };

  const handleDrawerMouseLeave = () => {
    // Adding a small delay to prevent accidental closing when moving mouse quickly
    setTimeout(() => {
        setIsDrawerOpen(false);
    }, 300); 
  };
  
  const handleViewChange = (view: ViewType) => {
    onSetView(view);
    setIsDrawerOpen(false); // Close drawer after selection
  };

  const handleOverlayClick = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="horizontal-drawer-container">
      {/* Drawer Toggle Button */}
      <RadixButton
        onClick={handleRadixButtonClick}
        className="drawer-toggle-button"
        ariaLabel="Toggle navigation menu"
      >
        <div onMouseEnter={handleButtonHover} className="drawer-hover-area">
          <MyRadixIcon className="button-icon-style" />
        </div>
      </RadixButton>

      {/* Overlay */}
      <div 
        className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`}
        onClick={handleOverlayClick}
      />

      {/* Horizontal Drawer Content */}
      <div 
        className={`horizontal-drawer-content ${isDrawerOpen ? 'open' : ''}`}
        onMouseLeave={handleDrawerMouseLeave}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <h2 id="drawer-title" className="drawer-title">
            PRSTOCKS Menu
          </h2>
        </div>

        {/* Navigation Buttons */}
        <div className="drawer-navigation" role="presentation">
          <InventoryButton 
            onClick={() => handleViewChange('inventory')} 
            title="Inventory Management"
          />
          <InspectionButton 
            onClick={() => handleViewChange('inspection')} 
            title="Inspection Page"
          />
          <FileOperationsButton 
            onClick={() => handleViewChange('fileOperations')} 
            title="File Operations"
          />
          <SettingsButton 
            onClick={() => handleViewChange('settings')} 
            title="Application Settings"
          />
        </div>

        {/* Theme Selector */}
        <DrawerThemes 
          onThemeChange={onThemeChange}
          currentTheme={currentTheme}
        />
      </div>
    </div>
  );
};

export default HorizontalDrawer;
