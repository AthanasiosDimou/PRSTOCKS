import React, { useState } from 'react';
import { databaseService } from '@/services';
import './DatabaseMigration.css';

interface ExportedData {
  users: any[];
  inventory: any[];
  preferences: any[];
  exportedAt: string;
}

const DatabaseMigration: React.FC = () => {
  const [exportData, setExportData] = useState<ExportedData | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [migrationStep, setMigrationStep] = useState(0);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Export data from current database
      const users = await databaseService.getAllUsers();
      const inventory = await databaseService.getAllInventoryItems();
      const data: ExportedData = {
        users,
        inventory,
        preferences: [],
        exportedAt: new Date().toISOString()
      };
      
      setExportData(data);
      setMigrationStep(1);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = (dataType: string, data: any[]) => {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      alert(`${dataType} data copied to clipboard!`);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard. Data is shown in console.');
      console.log(`${dataType} data:`, jsonString);
    });
  };

  const handleClearIndexedDB = async () => {
    const confirmed = confirm('⚠️ This will permanently delete all data from database. Are you sure?');
    if (confirmed) {
      try {
        await databaseService.clearAllData();
        setMigrationStep(2);
        alert('✅ Database cleared successfully!');
      } catch (error) {
        console.error('Failed to clear database:', error);
        alert('Failed to clear database. Check console for details.');
      }
    }
  };

  return (
    <div className="migration-container">
      <h2>🔄 Database Migration Tool</h2>
      <p>Migrate your data from IndexedDB to portable JSON files</p>

      {migrationStep === 0 && (
        <div className="step">
          <h3>Step 1: Export Data from IndexedDB</h3>
          <p>Click the button below to export all your data from IndexedDB to viewable format.</p>
          <button 
            onClick={handleExportData} 
            disabled={isExporting}
            className="primary-btn"
          >
            {isExporting ? '🔄 Exporting...' : '📤 Export IndexedDB Data'}
          </button>
        </div>
      )}

      {migrationStep === 1 && exportData && (
        <div className="step">
          <h3>Step 2: Copy Data to JSON Files</h3>
          <p>Your data has been exported! Copy each dataset to its respective JSON file in your project:</p>
          <div className="data-export">
            <div className="data-section">
              <h4>👥 Users ({exportData.users.length} records)</h4>
              <p>Copy to: <code>src/backend/database/data/users.json</code></p>
              <button onClick={() => handleCopyToClipboard('Users', exportData.users)}>
                📋 Copy Users Data
              </button>
            </div>

            <div className="data-section">
              <h4>📦 Inventory ({exportData.inventory.length} records)</h4>
              <p>Copy to: <code>src/backend/database/data/inventory.json</code></p>
              <button onClick={() => handleCopyToClipboard('Inventory', exportData.inventory)}>
                📋 Copy Inventory Data
              </button>
            </div>

            <div className="data-section">
              <h4>⚙️ Preferences ({exportData.preferences.length} records)</h4>
              <p>Copy to: <code>src/backend/database/data/preferences.json</code></p>
              <button onClick={() => handleCopyToClipboard('Preferences', exportData.preferences)}>
                📋 Copy Preferences Data
              </button>
            </div>

            <div className="migration-controls">
              <h4>Step 3: Clear IndexedDB (Optional)</h4>
              <p>After copying your data to JSON files, you can clear the IndexedDB data:</p>
              <button onClick={handleClearIndexedDB} className="danger-btn">
                🗑️ Clear IndexedDB Data
              </button>
            </div>
          </div>
        </div>
      )}

      {migrationStep === 2 && (
        <div className="step">
          <h3>✅ Migration Complete!</h3>
          <p>Your data has been successfully migrated to file-based storage.</p>
          <p>Your database files are now located in:</p>
          <ul>
            <li><code>src/backend/database/data/users.json</code></li>
            <li><code>src/backend/database/data/inventory.json</code></li>
            <li><code>src/backend/database/data/preferences.json</code></li>
          </ul>
          <p>You can now copy these files between devices to sync your data!</p>
        </div>
      )}

      <div className="console-note">
        <h4>💡 Console Commands</h4>
        <p>You can also use these commands in the browser console:</p>
        <ul>
          <li><code>databaseService.getAllUsers()</code> - Export user data</li>
          <li><code>databaseService.clearAllData()</code> - Clear database</li>
        </ul>
      </div>
    </div>
  );
};

export default DatabaseMigration;