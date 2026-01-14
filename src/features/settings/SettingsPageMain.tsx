// =============================================================================
// SETTINGS PAGE COMPONENT
// =============================================================================
// Component for application settings and configuration

import React from 'react';
import './SettingsPage.css';

interface SettingsPageProps {
  onBackToMain?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBackToMain }) => {
  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure your PRSTOCKS application preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>⚙️ General Settings</h2>
          <div className="setting-item">
            <label className="setting-label">
              Auto-save interval (minutes)
            </label>
            <select className="setting-input">
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
            </select>
          </div>
          
          <div className="setting-item">
            <label className="setting-label">
              Default view on startup
            </label>
            <select className="setting-input">
              <option value="input">Add Items</option>
              <option value="table">View Inventory</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>

          <div className="setting-item">
            <label className="setting-checkbox">
              <input type="checkbox" defaultChecked />
              Enable notifications
            </label>
          </div>

          <div className="setting-item">
            <label className="setting-checkbox">
              <input type="checkbox" defaultChecked />
              Show statistics in header
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>📊 Database Settings</h2>
          <div className="setting-item">
            <label className="setting-label">
              Database backup frequency
            </label>
            <select className="setting-input">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              Records per page
            </label>
            <select className="setting-input">
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>

          <div className="setting-item">
            <label className="setting-checkbox">
              <input type="checkbox" />
              Enable data compression
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>🎨 Appearance</h2>
          <div className="setting-item">
            <label className="setting-label">
              Interface scale
            </label>
            <select className="setting-input">
              <option value="small">Small (90%)</option>
              <option value="normal">Normal (100%)</option>
              <option value="large">Large (110%)</option>
              <option value="xlarge">Extra Large (125%)</option>
            </select>
          </div>

          <div className="setting-item">
            <label className="setting-checkbox">
              <input type="checkbox" defaultChecked />
              Enable animations
            </label>
          </div>

          <div className="setting-item">
            <label className="setting-checkbox">
              <input type="checkbox" />
              Reduce visual effects
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>🔧 Advanced</h2>
          <div className="setting-item">
            <label className="setting-label">
              Debug logging level
            </label>
            <select className="setting-input">
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>

          <div className="setting-item">
            <label className="setting-checkbox">
              <input type="checkbox" />
              Enable developer mode
            </label>
          </div>

          <div className="actions-container">
            <button className="action-button primary">
              Save Settings
            </button>
            <button className="action-button secondary">
              Reset to Defaults
            </button>
            <button className="action-button secondary">
              Export Settings
            </button>
            {onBackToMain && (
              <button className="action-button tertiary" onClick={onBackToMain}>
                Back to Main
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
