// =============================================================================
// INVENTORY BUTTON COMPONENT
// =============================================================================
// Button component for inventory management functionality

import React from 'react';
import { InventoryIcon } from '../../icons/icons';
import './InventoryButton.css';

interface InventoryButtonProps {
  onClick: () => void;
  title?: string;
  className?: string;
}

export const InventoryButton: React.FC<InventoryButtonProps> = ({ 
  onClick, 
  title = "Inventory Management",
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={`inventory-button ${className}`}
      type="button"
      aria-label={title}
      title={title}
    >
      <InventoryIcon className="button-icon" />
      <span className="button-text">Inventory</span>
    </button>
  );
};
