// =============================================================================
// ENHANCED SETTINGS PAGE FOR DUAL DATABASE SYSTEM
// =============================================================================
// Settings page that works with device-specific preferences and shows device info

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../shared/themes/DualThemeProvider';
import { UserPreferencesService, DevicePreferences } from '../../shared/services/UserPreferencesService';
import { ThemeDrawer } from '../../shared/themes/components/ThemeDrawer';
import './SettingsPage.css';

interface SettingsPageProps {
  onBackToMain?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBackToMain }) => {
  // =============================================================================
  // HOOKS AND STATE
  // =============================================================================
  const { 
    currentTheme, 
    username, 
    userPreferences, 
    isInitialized 
  } = useTheme();
  
  const [showThemeDrawer, setShowThemeDrawer] = useState(false);
  const [localPreferences, setLocalPreferences] = useState<DevicePreferences | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // =============================================================================
  // LOAD PREFERENCES ON MOUNT
  // =============================================================================
  useEffect(() => {
    if (userPreferences) {
      setLocalPreferences(userPreferences);
    }
  }, [userPreferences]);

  // =============================================================================
  // SAVE PREFERENCES HANDLER
  // =============================================================================
  const handleSavePreferences = async () => {
    if (!localPreferences || !username) return;
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      await UserPreferencesService.saveDevicePreferences(
        localPreferences.theme,
        localPreferences.language,
        localPreferences.items_per_page,
        localPreferences.default_view,
        localPreferences.notifications_enabled,
        localPreferences.auto_backup,
        username
      );
      
      setSaveStatus('saved');
      console.log('✅ Preferences saved successfully');
      
      // Clear saved status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
      
    } catch (error) {
      console.error('❌ Failed to save preferences:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // =============================================================================
  // BACKUP PREFERENCES HANDLER
  // =============================================================================
  const handleBackupPreferences = async () => {
    if (!username) return;
    
    try {
      await UserPreferencesService.backupDevicePreferences(username);
      alert('✅ User preferences backed up successfully!');
    } catch (error) {
      console.error('❌ Failed to backup preferences:', error);
      alert('❌ Failed to backup preferences. Please try again.');
    }
  };

  // =============================================================================
  // PREFERENCE UPDATE HANDLERS
  // =============================================================================
  const updatePreference = (key: keyof DevicePreferences, value: any) => {
    if (!localPreferences) return;
    
    setLocalPreferences({
      ...localPreferences,
      [key]: value
    });
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================
  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return '💾 Saving...';
      case 'saved': return '✅ Saved!';
      case 'error': return '❌ Error';
      default: return '💾 Save Preferences';
    }
  };

  const getSaveButtonClass = () => {
    return `save-button ${saveStatus}`;
  };

  // =============================================================================
  // RENDER
  // =============================================================================
  
  if (!isInitialized) {
    return (
      <div className="settings-page loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading device settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page dual-database" style={{ 
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.onBackground 
    }}>
      {/* Header */}
      <div className="settings-header">
        <button 
          className="back-button"
          onClick={onBackToMain}
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            color: currentTheme.colors.onSurface 
          }}
        >
          ← Back
        </button>
        <h1>⚙️ User Settings</h1>
        <p>Configure your PRSTOCKS preferences</p>
      </div>

      <div className="settings-content">
        {/* User Information Section */}
        <div className="settings-section" style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.primary 
        }}>
          <h2>� User Information</h2>
          <div className="device-info-grid">
            <div className="info-item">
              <span className="info-label">Username:</span>
              <span className="info-value">{username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Current Theme:</span>
              <span className="info-value">{currentTheme.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Preferences Status:</span>
              <span className="info-value">
                {userPreferences ? '✅ Loaded' : '❌ Not Found'}
              </span>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="settings-section" style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.primary 
        }}>
          <h2>🎨 Theme Settings</h2>
          <div className="setting-item">
            <label className="setting-label">Current Theme</label>
            <div className="theme-setting">
              <div 
                className="current-theme-preview"
                style={{ 
                  backgroundColor: currentTheme.colors.primary,
                  borderColor: currentTheme.colors.secondary 
                }}
              >
                <span style={{ color: currentTheme.colors.onPrimary }}>
                  {currentTheme.name}
                </span>
              </div>
              <button
                className="change-theme-button"
                onClick={() => setShowThemeDrawer(true)}
                style={{ 
                  backgroundColor: currentTheme.colors.primary,
                  color: currentTheme.colors.onPrimary 
                }}
              >
                Change Theme
              </button>
            </div>
          </div>
        </div>

        {/* Application Preferences */}
        {localPreferences && (
          <div className="settings-section" style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.primary 
          }}>
            <h2>⚙️ Application Preferences</h2>
            
            <div className="setting-item">
              <label className="setting-label">Language</label>
              <select 
                className="setting-input"
                value={localPreferences.language}
                onChange={(e) => updatePreference('language', e.target.value)}
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.onBackground,
                  borderColor: currentTheme.colors.primary 
                }}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
              </select>
            </div>

            <div className="setting-item">
              <label className="setting-label">Items per page</label>
              <select 
                className="setting-input"
                value={localPreferences.items_per_page}
                onChange={(e) => updatePreference('items_per_page', parseInt(e.target.value))}
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.onBackground,
                  borderColor: currentTheme.colors.primary 
                }}
              >
                <option value={10}>10 items</option>
                <option value={25}>25 items</option>
                <option value={50}>50 items</option>
                <option value={100}>100 items</option>
              </select>
            </div>

            <div className="setting-item">
              <label className="setting-label">Default view</label>
              <select 
                className="setting-input"
                value={localPreferences.default_view}
                onChange={(e) => updatePreference('default_view', e.target.value)}
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.onBackground,
                  borderColor: currentTheme.colors.primary 
                }}
              >
                <option value="grid">Grid view</option>
                <option value="list">List view</option>
                <option value="table">Table view</option>
              </select>
            </div>

            <div className="setting-item">
              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={localPreferences.notifications_enabled}
                  onChange={(e) => updatePreference('notifications_enabled', e.target.checked)}
                />
                <span className="checkmark" style={{ 
                  backgroundColor: localPreferences.notifications_enabled ? 
                    currentTheme.colors.primary : 
                    currentTheme.colors.background,
                  borderColor: currentTheme.colors.primary 
                }}></span>
                Enable notifications
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={localPreferences.auto_backup}
                  onChange={(e) => updatePreference('auto_backup', e.target.checked)}
                />
                <span className="checkmark" style={{ 
                  backgroundColor: localPreferences.auto_backup ? 
                    currentTheme.colors.primary : 
                    currentTheme.colors.background,
                  borderColor: currentTheme.colors.primary 
                }}></span>
                Enable automatic backup
              </label>
            </div>
          </div>
        )}

        {/* Database Operations */}
        <div className="settings-section" style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.secondary 
        }}>
          <h2>💾 Database Operations</h2>
          <div className="database-operations">
            <button
              className="operation-button backup"
              onClick={handleBackupPreferences}
              style={{ 
                backgroundColor: currentTheme.colors.secondary,
                color: currentTheme.colors.onSurface 
              }}
            >
              🗄️ Backup Preferences to DuckDB
            </button>
            <p className="operation-description">
              Backup your device preferences to the DuckDB backup database for safekeeping.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button
            className={getSaveButtonClass()}
            onClick={handleSavePreferences}
            disabled={isSaving || !localPreferences}
            style={{ 
              backgroundColor: saveStatus === 'saved' ? 
                currentTheme.colors.success || '#4CAF50' : 
                saveStatus === 'error' ? 
                currentTheme.colors.error || '#F44336' : 
                currentTheme.colors.primary,
              color: currentTheme.colors.onPrimary 
            }}
          >
            {getSaveButtonText()}
          </button>
        </div>
      </div>

      {/* Theme Drawer */}
      <ThemeDrawer
        isOpen={showThemeDrawer}
        onClose={() => setShowThemeDrawer(false)}
        onThemeChange={() => {
          setShowThemeDrawer(false);
          // Theme is automatically saved by the ThemeProvider
        }}
      />
    </div>
  );
};


