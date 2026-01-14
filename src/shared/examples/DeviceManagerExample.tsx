// =============================================================================
// EXAMPLE: Using Enhanced Device Identity System
// =============================================================================
// This example shows how to integrate the new robust device identification

import React, { useEffect, useState } from 'react';
import { DeviceIdentityService } from '../services/DeviceIdentityService';
import { EnhancedDevicePreferencesService, DevicePreferences } from '../services/EnhancedDevicePreferencesService';

interface DeviceInfo {
  deviceId: string;
  preferences: DevicePreferences | null;
  isNewDevice: boolean;
  migrationStatus?: string;
}

export const ExampleDeviceManager: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDevice();
  }, []);

  const initializeDevice = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Initialize device with automatic migration
      const initResult = await EnhancedDevicePreferencesService.initializeDevice();
      
      console.log('🚀 Device initialization result:', initResult);

      setDeviceInfo({
        deviceId: initResult.device_id,
        preferences: initResult.preferences,
        isNewDevice: initResult.status === 'new_device',
        migrationStatus: initResult.status
      });

    } catch (err) {
      console.error('❌ Failed to initialize device:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (newTheme: string) => {
    if (!deviceInfo) return;

    try {
      await EnhancedDevicePreferencesService.updateDeviceTheme(newTheme, deviceInfo.deviceId);
      
      // Refresh preferences
      const updatedPrefs = await EnhancedDevicePreferencesService.getDevicePreferences(deviceInfo.deviceId);
      setDeviceInfo(prev => prev ? { ...prev, preferences: updatedPrefs } : null);
      
      console.log(`✅ Theme updated to: ${newTheme}`);
    } catch (err) {
      console.error('❌ Failed to update theme:', err);
    }
  };

  const refreshDevice = async () => {
    try {
      const newDeviceId = await DeviceIdentityService.refreshDeviceIdentity();
      await initializeDevice();
      console.log(`🔄 Device identity refreshed: ${newDeviceId}`);
    } catch (err) {
      console.error('❌ Failed to refresh device:', err);
    }
  };

  const clearCache = () => {
    DeviceIdentityService.clearDeviceCache();
    console.log('🗑️ Device cache cleared');
    // Optionally refresh
    initializeDevice();
  };

  if (loading) {
    return (
      <div className="device-manager loading">
        <h3>🔄 Initializing Device...</h3>
        <p>Setting up robust device identification...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="device-manager error">
        <h3>❌ Device Initialization Error</h3>
        <p>{error}</p>
        <button onClick={initializeDevice}>Retry</button>
      </div>
    );
  }

  if (!deviceInfo) return null;

  return (
    <div className="device-manager">
      <h3>📱 Device Information</h3>
      
      <div className="device-details">
        <p><strong>Device ID:</strong> {deviceInfo.deviceId}</p>
        <p><strong>Status:</strong> 
          <span className={`status ${deviceInfo.migrationStatus}`}>
            {deviceInfo.isNewDevice ? '🆕 New Device' : '🔄 Existing Device'}
            {deviceInfo.migrationStatus === 'migrated' && ' (Migrated)'}
          </span>
        </p>
      </div>

      {deviceInfo.preferences && (
        <div className="device-preferences">
          <h4>⚙️ Current Preferences</h4>
          <div className="prefs-grid">
            <div className="pref-item">
              <label>Theme:</label>
              <select 
                value={deviceInfo.preferences.theme} 
                onChange={(e) => updateTheme(e.target.value)}
              >
                <option value="light">🌞 Light</option>
                <option value="dark">🌙 Dark</option>
                <option value="auto">🔄 Auto</option>
              </select>
            </div>
            
            <div className="pref-item">
              <label>Language:</label>
              <span>{deviceInfo.preferences.language}</span>
            </div>
            
            <div className="pref-item">
              <label>Items per page:</label>
              <span>{deviceInfo.preferences.items_per_page}</span>
            </div>
            
            <div className="pref-item">
              <label>Default view:</label>
              <span>{deviceInfo.preferences.default_view}</span>
            </div>
          </div>
          
          <div className="device-stats">
            <p><strong>Login count:</strong> {deviceInfo.preferences.login_count}</p>
            <p><strong>Last login:</strong> {new Date(deviceInfo.preferences.last_login).toLocaleString()}</p>
            <p><strong>First login:</strong> {new Date(deviceInfo.preferences.first_login).toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="device-actions">
        <button onClick={refreshDevice} className="action-btn refresh">
          🔄 Refresh Device Identity
        </button>
        
        <button onClick={clearCache} className="action-btn clear">
          🗑️ Clear Cache
        </button>
        
        <button 
          onClick={() => EnhancedDevicePreferencesService.backupDevicePreferences(deviceInfo.deviceId)}
          className="action-btn backup"
        >
          💾 Backup Preferences
        </button>
      </div>

      <div className="migration-info">
        <h4>📋 Migration Information</h4>
        <p>
          {deviceInfo.migrationStatus === 'existing_device' && 
            '✅ Device found in database, no migration needed'
          }
          {deviceInfo.migrationStatus === 'new_device' && 
            '🆕 New device created with default preferences'
          }
          {deviceInfo.migrationStatus === 'migrated' && 
            '🔄 Legacy device ID successfully migrated to new system'
          }
        </p>
      </div>
    </div>
  );
};

// =============================================================================
// INTEGRATION EXAMPLE
// =============================================================================

export const AppWithDeviceManager: React.FC = () => {
  const [deviceReady, setDeviceReady] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');

  useEffect(() => {
    // Initialize device on app startup
    const initApp = async () => {
      try {
        const deviceId = await DeviceIdentityService.getOrCreateDeviceIdentity();
        setCurrentDeviceId(deviceId);
        setDeviceReady(true);
        console.log('🚀 App initialized with device:', deviceId);
      } catch (error) {
        console.error('❌ App initialization failed:', error);
      }
    };

    initApp();
  }, []);

  if (!deviceReady) {
    return (
      <div className="app-loading">
        <h2>🔄 Initializing PRSTOCKS...</h2>
        <p>Setting up device identification...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>PRSTOCKS - Enhanced Device System</h1>
        <p>Device: {currentDeviceId.substring(0, 12)}...</p>
      </header>
      
      <main className="app-main">
        <ExampleDeviceManager />
        
        {/* Your existing app components */}
        <div className="app-content">
          <p>✅ App is ready! Device identity is properly configured.</p>
          <p>💡 Your preferences will persist even if you clear browser data.</p>
          <p>🔄 Device will be recognized across browser sessions through fingerprinting.</p>
        </div>
      </main>
    </div>
  );
};

// =============================================================================
// CSS STYLES (Optional - add to your stylesheet)
// =============================================================================

/*
.device-manager {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.device-manager.loading,
.device-manager.error {
  text-align: center;
  padding: 40px;
}

.device-details {
  background: white;
  padding: 15px;
  border-radius: 4px;
  margin: 15px 0;
}

.prefs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 15px 0;
}

.pref-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #eee;
}

.device-actions {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.action-btn.refresh { background: #007bff; color: white; }
.action-btn.clear { background: #dc3545; color: white; }
.action-btn.backup { background: #28a745; color: white; }

.status.new_device { color: #28a745; }
.status.existing_device { color: #007bff; }
.status.migrated { color: #ffc107; }

.migration-info {
  background: #e9ecef;
  padding: 15px;
  border-radius: 4px;
  margin: 15px 0;
}
*/

export default ExampleDeviceManager;
