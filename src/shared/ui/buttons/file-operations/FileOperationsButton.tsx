// =============================================================================
// FILE OPERATIONS BUTTON COMPONENT
// =============================================================================
// Button component for file operations functionality

import React from 'react';
import { FileIcon } from '../../icons/icons';
import './FileOperationsButton.css';

interface FileOperationsButtonProps {
  onClick: () => void;
  title?: string;
  className?: string;
}

export const FileOperationsButton: React.FC<FileOperationsButtonProps> = ({ 
  onClick, 
  title = "File Operations",
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={`file-operations-button ${className}`}
      type="button"
      aria-label={title}
      title={title}
    >
      <FileIcon className="button-icon" />
      <span className="button-text">File Ops</span>
    </button>
  );
};
