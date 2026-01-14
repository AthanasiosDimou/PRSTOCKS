// =============================================================================
// DATABASE EXPORT & BACKUP COMPONENT
// =============================================================================
// Simple component with two buttons: Export DB (downloads to device) and Backup DB (saves to host)

import React, { useState } from 'react';
import { databaseService } from '../../services';
import { useTheme } from '../../shared/themes/DualThemeProvider';
import './DatabaseExport.css';

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const DatabaseExport: React.FC = () => {
  const { currentTheme } = useTheme();
  
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  const [isExporting, setIsExporting] = useState(false);
  const [isBackingUp, _setIsBackingUp] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);

  // =============================================================================
  // EXPORT HANDLERS
  // =============================================================================
  
  // Export DB - Downloads to the device you use
  const handleExportDB = async () => {
    setIsExporting(true);
    setStatusMessage({ type: 'info', message: 'Preparing database export for download...' });

    try {
      // Use the browser database export functionality
      await databaseService.exportAllDatabases();

      setStatusMessage({
        type: 'success',
        message: `✅ All databases exported successfully!\n📁 Downloaded files: inventory.db, users.db, preferences.db\n🕐 ${new Date().toLocaleString()}`
      });

    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: `❌ Export failed: ${error}`
      });
    } finally {
      setIsExporting(false);
    }
  };

  // BACKUP FUNCTIONALITY COMMENTED OUT FOR FASTER COMPILATION
  // DuckDB dependency slows down build times significantly
  /*
  // Backup DB - Saves to the host device
  const handleBackupDB = async () => {
    setIsBackingUp(true);
    setStatusMessage({ type: 'info', message: 'Creating database backup on host...' });

    try {
      // Using direct backend API
      
      // Use the backup command that saves to host public directory
      const backupPath = await invoke('create_inventory_backup', { 
        backupType: 'full', 
        createdBy: 'user' 
      }) as string;

      setStatusMessage({
        type: 'success',
        message: `✅ Database backup created successfully!\n💾 Saved to host: ${backupPath}\n🕐 ${new Date().toLocaleString()}`
      });

    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: `❌ Backup failed: ${error}`
      });
    } finally {
      setIsBackingUp(false);
    }
  };
  */

  // Clear status message after 5 seconds
  React.useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // =============================================================================
  // RENDER
  // =============================================================================
  return (
    <div 
      className="database-export-container"
      style={{ 
        backgroundColor: currentTheme.colors.surface,
        color: currentTheme.colors.onSurface
      }}
    >
      <div className="export-header">
        <h3 style={{ color: currentTheme.colors.primary }}>
          💾 Database Export & Backup
        </h3>
        <p style={{ color: currentTheme.colors.disabled }}>
          Export database for download or create backup on host device
        </p>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div 
          className={`status-message ${statusMessage.type}`}
          style={{
            backgroundColor: statusMessage.type === 'success' ? currentTheme.colors.success + '20' :
                           statusMessage.type === 'error' ? currentTheme.colors.error + '20' :
                           currentTheme.colors.info + '20',
            borderColor: statusMessage.type === 'success' ? currentTheme.colors.success :
                        statusMessage.type === 'error' ? currentTheme.colors.error :
                        currentTheme.colors.info,
            color: currentTheme.colors.onSurface
          }}
        >
          {statusMessage.message}
        </div>
      )}

      {/* Export & Backup Buttons */}
      <div className="export-buttons">
        <button
          onClick={handleExportDB}
          disabled={isExporting || isBackingUp}
          className="export-button export-download"
          style={{
            backgroundColor: currentTheme.colors.primary,
            color: currentTheme.colors.onPrimary,
            opacity: (isExporting || isBackingUp) ? 0.6 : 1
          }}
        >
          {isExporting ? '⏳ Exporting...' : '📥 Export DB'}
          <span className="button-subtitle">Downloads to your device</span>
        </button>

        {/* BACKUP FUNCTIONALITY COMMENTED OUT FOR FASTER COMPILATION */}
        {/* DuckDB dependency slows down build times significantly */}
        {/*
        <button
          onClick={handleBackupDB}
          disabled={isExporting || isBackingUp}
          className="export-button backup-host"
          style={{
            backgroundColor: currentTheme.colors.secondary,
            color: currentTheme.colors.onPrimary,
            opacity: (isExporting || isBackingUp) ? 0.6 : 1
          }}
        >
          {isBackingUp ? '⏳ Backing up...' : '💾 Backup DB'}
          <span className="button-subtitle">Saves to host device</span>
        </button>
        */}
      </div>

      {/* Info Section */}
      <div className="export-info">
        <div className="info-item">
          <span style={{ color: currentTheme.colors.disabled }}>📥 Export:</span>
          <span style={{ color: currentTheme.colors.onSurface }}>
            Downloads complete database to your current device for portability
          </span>
        </div>
        <div className="info-item">
          <span style={{ color: currentTheme.colors.disabled }}>💾 Backup:</span>
          <span style={{ color: currentTheme.colors.onSurface }}>
            Creates backup copy on the host server for safety and recovery
          </span>
        </div>
        <div className="info-item">
          <span style={{ color: currentTheme.colors.disabled }}>💡 Tip:</span>
          <span style={{ color: currentTheme.colors.onSurface }}>
            Regular backups help prevent data loss and exports enable data sharing
          </span>
        </div>
      </div>
    </div>
  );
};

export default DatabaseExport;

