import React, { useState } from 'react';
import { useTheme } from '../../shared/themes/DualThemeProvider';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import './BarcodeScannerButton.css';

interface BarcodeScannerButtonProps {
  onClick?: () => void;
  visible?: boolean;
}

export const BarcodeScannerButton: React.FC<BarcodeScannerButtonProps> = ({ 
  onClick, 
  visible = true 
}) => {
  const { currentTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!visible) return null;

  const handleClick = () => {
    setIsModalOpen(true);
    if (onClick) onClick();
  };

  const handleScanSuccess = (decodedText: string) => {
    // Dispatch custom event with the scanned data
    const event = new CustomEvent('barcode-scanned', { detail: decodedText });
    window.dispatchEvent(event);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="barcode-scanner-button"
        style={{
          backgroundColor: currentTheme.colors.primary,
          color: currentTheme.colors.onPrimary,
          boxShadow: `0 4px 16px ${currentTheme.colors.shadow}`
        }}
        title="Scan Barcode"
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 11C4.80285 11 2.52952 9.62184 1.09622 7.50001C2.52952 5.37816 4.80285 4 7.5 4C10.1971 4 12.4705 5.37816 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11ZM7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253334 7.60288 0.0760014 7.76501C1.65639 10.2936 4.30786 12 7.5 12C10.6921 12 13.3436 10.2936 14.924 7.76501C15.0253 7.60288 15.0253 7.39715 14.924 7.23501C13.3436 4.70638 10.6921 3 7.5 3ZM7.5 9.5C8.60457 9.5 9.5 8.60457 9.5 7.5C9.5 6.39543 8.60457 5.5 7.5 5.5C6.39543 5.5 5.5 6.39543 5.5 7.5C5.5 8.60457 6.39543 9.5 7.5 9.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
      </button>

      <BarcodeScannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
};
