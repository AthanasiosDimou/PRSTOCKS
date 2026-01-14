// =============================================================================
// SETTINGS BUTTON COMPONENT
// =============================================================================
// Button component for settings functionality

import React from 'react';
import { SettingsIcon } from '../../icons/icons';
import './SettingsButton.css';

interface SettingsButtonProps {
  onClick: () => void;
  title?: string;
  className?: string;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ 
  onClick, 
  title = "Settings",
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={`settings-button ${className}`}
      type="button"
      aria-label={title}
      title={title}
    >
      <SettingsIcon className="button-icon" />
      <span className="button-text">Settings</span>
    </button>
  );
};
