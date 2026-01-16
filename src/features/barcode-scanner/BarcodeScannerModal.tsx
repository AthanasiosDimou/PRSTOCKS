// =============================================================================
// BARCODE SCANNER MODAL COMPONENT
// =============================================================================
// Uses html5-qrcode to scan codes via camera

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useTheme } from '../../shared/themes/DualThemeProvider';
import './BarcodeScannerModal.css';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const { currentTheme } = useTheme();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  
  // Refs for stability check (debounce)
  const lastScannedRef = useRef<string>('');
  const firstScanTimeRef = useRef<number>(0);

  // Initialize scanner when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    // Reset stability counters
    lastScannedRef.current = '';
    firstScanTimeRef.current = 0;

    // Small timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      // Clear previous instance if any
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }

      try {
        const scanner = new Html5QrcodeScanner(
          "reader",
          { 
            fps: 10,
            // Reduced height further to help isolate specific barcodes in a stack
            qrbox: { width: 300, height: 100 }, 
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            formatsToSupport: [
              // Html5QrcodeSupportedFormats.QR_CODE, // Disabled QR scanning
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.CODABAR,
              Html5QrcodeSupportedFormats.ITF
            ]
          },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            // Stability Check / Debounce
            // We require the same code to be scanned multiple times consecutively 
            // over a period of time to prevent random misreads or partial scans
            const REQUIRED_STABLE_TIME_MS = 800; // 800ms stability required
            const now = Date.now();

            if (decodedText !== lastScannedRef.current) {
              // New code detected, reset timer
              lastScannedRef.current = decodedText;
              firstScanTimeRef.current = now;
            } else {
              // Same code detected again, check if enough time has passed
              if (now - firstScanTimeRef.current >= REQUIRED_STABLE_TIME_MS) {
                console.log("Scan verified:", decodedText);
                onScanSuccess(decodedText);
                onClose();
                
                // Reset to prevent double firing
                lastScannedRef.current = '';
                firstScanTimeRef.current = 0;
              }
            }
          },
          (errorMessage) => {
            // Error callback (called frequently, better to ignore unless debugging)
            // console.warn("Scan error:", errorMessage);
          }
        );

        scannerRef.current = scanner;
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
        setScannerError("Camera permisson denied, or scanner failed to start.");
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isOpen, onClose, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="scanner-modal-overlay" onClick={onClose}>
      <div 
        className="scanner-modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: currentTheme.colors.surface,
          color: currentTheme.colors.onSurface
        }}
      >
        <div className="scanner-modal-header">
          <h3 style={{ color: currentTheme.colors.onSurface }}>
            Scan Barcode
          </h3>
          <button 
            onClick={onClose}
            className="scanner-close-button"
            style={{ color: currentTheme.colors.onSurface }}
          >
            ✕
          </button>
        </div>
        
        <div className="scanner-container">
          <div id="reader"></div>
        </div>

        {scannerError && (
          <div style={{ color: currentTheme.colors.error, marginTop: 16, textAlign: 'center' }}>
            {scannerError}
          </div>
        )}

        <div className="scanner-instructions" style={{ color: currentTheme.colors.disabled }}>
          Align the red line with the barcode you want to scan
        </div>
      </div>
    </div>
  );
};
