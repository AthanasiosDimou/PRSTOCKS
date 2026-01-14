// =============================================================================
// INSPECTION BUTTON COMPONENT
// =============================================================================
// Button component for inspection functionality

import React from 'react';
import { InspectionIcon } from '../../icons/icons';
import './InspectionButton.css';

interface InspectionButtonProps {
  onClick: () => void;
  title?: string;
  className?: string;
}

export const InspectionButton: React.FC<InspectionButtonProps> = ({ 
  onClick, 
  title = "Inspection Page",
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={`inspection-button ${className}`}
      type="button"
      aria-label={title}
      title={title}
    >
      <InspectionIcon className="button-icon" />
      <span className="button-text">Inspection</span>
    </button>
  );
};
