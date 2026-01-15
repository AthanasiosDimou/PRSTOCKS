// =============================================================================
// POSEIDON RACING STOCK MANAGEMENT APP
// =============================================================================
// Main application component that combines all features from the Python implementation

import React, { useState, useEffect } from 'react';
import { MultiDeviceThemeProvider as DualThemeProvider, useMultiDeviceTheme as useTheme } from '../shared/providers/MultiDeviceThemeProvider';
import { BottomThemeDrawer } from '../shared/themes/components/BottomThemeDrawer';
import { InventoryForm, InventoryTable } from '../features/inventory';
import { FileManager } from '../features/file-management';
import { databaseService } from '../services/index';
import { InventoryItem, InventoryStats } from '../shared/types/database';
import './StockManagementApp.css';

// =============================================================================
// VIEW TYPES
// =============================================================================
type ViewType = 'input' | 'table' | 'files';

interface UserData {
  user_id: number;
  username: string;
  subteam: string;
}

interface StockManagementAppProps {
  currentUser: UserData;
}

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================
const StockManagementApp: React.FC<StockManagementAppProps> = ({ currentUser }) => {
  return (
    <DualThemeProvider username={currentUser.username}>
      <StockManagementAppInner currentUser={currentUser} />
    </DualThemeProvider>
  );
};

// =============================================================================
// INNER APP COMPONENT (with theme access)
// =============================================================================
const StockManagementAppInner: React.FC<StockManagementAppProps> = ({ currentUser }) => {
  const { currentTheme } = useTheme();
  
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  const [currentView, setCurrentView] = useState<ViewType>('input');
  const [isThemeDrawerOpen, setIsThemeDrawerOpen] = useState(false);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // =============================================================================
  // DATA LOADING
  // =============================================================================
  const loadStats = async () => {
    try {
      const inventoryStats = await databaseService.getInventoryStatistics();
      console.log('📊 Raw inventory stats from backend:', inventoryStats);
      
      // Cast to any to handle backend response format differences
      const backendStats = inventoryStats as any;
      
      // Convert the database format to InventoryStats format
      const convertedStats: InventoryStats = {
        total_items: backendStats.totalItems || backendStats.total_items || 0,
        total_quantity: backendStats.totalQuantity || backendStats.total_quantity || 0,
        categories: backendStats.categories || {},
        recent_additions: [],
        unique_part_numbers: backendStats.uniquePartNumbers || Object.keys(backendStats.categories || {}).length,
        item_types: Object.keys(backendStats.categories || {}),
        by_category: Object.fromEntries(
          Object.entries(backendStats.categories || {}).map(([category, count]) => [
            category, 
            { count: count as number, quantity: 0 }
          ])
        ),
        by_subteam: Object.fromEntries(
          Object.entries(backendStats.subteams || backendStats.companies || {}).map(([company, count]) => [
            company, 
            { count: count as number, quantity: 0 }
          ])
        )
      };
      
      console.log('📊 Converted stats for UI:', convertedStats);
      setStats(convertedStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats(null);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      // Initialize database with demo data if needed (works for both web and native)
      await databaseService.initialize();
      // Load stats
      await loadStats();
    };
    
    initialize();
  }, [refreshTrigger]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  const handleItemAdded = (_item: InventoryItem) => {
    // Refresh stats and trigger table refresh
    setRefreshTrigger(prev => prev + 1);
    loadStats();
  };

  const handleViewSwitch = (view: ViewType) => {
    setCurrentView(view);
    // Refresh data when switching to table view
    if (view === 'table') {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleThemeDrawerOpen = () => {
    setIsThemeDrawerOpen(true);
  };

  const handleThemeDrawerClose = () => {
    setIsThemeDrawerOpen(false);
  };

  // =============================================================================
  // HORIZONTAL DRAWER HANDLERS - REMOVED (redundant with navigation buttons)
  // =============================================================================

  // =============================================================================
  // RENDER
  // =============================================================================
  return (
    <div 
      className="stock-management-app"
      style={{
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.onBackground,
        minHeight: '100vh'
      }}
    >
      {/* Header */}
      <header 
        className="app-header"
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderBottomColor: currentTheme.colors.border,
          boxShadow: `0 2px 8px ${currentTheme.colors.shadow}`
        }}
      >
        <div className="header-content">
          {/* Logo Section */}
          <div className="logo-section">
            {/* Poseidon Racing Logo SVG */}
            <div 
              className="logo-container"
              style={{ 
                color: currentTheme.colors.primary,
                filter: currentTheme.isDark ? 'brightness(1.2)' : 'brightness(1)'
              }}
            >
              <svg 
                width="48" 
                height="48" 
                viewBox="0 0 242.6 248.7" 
                fill="currentColor"
                className="poseidon-logo"
              >
                <path d="M47.6,42.4l26.3-6.2c0,0-47.1,33.4-13.1,91.5c0,0,14.4,24.4,49.4,29.9l6-71h-6.6L122.3,58l13.6,28.1l-7.1,0.1
                  l7.1,71.3c0,0,50.4-7.5,59.7-60.6c0,0,3.4-32-16.9-51.7l-20.5-24.4l46.8,3.4L193,37.6c0,0,35.2,47.3,27.2,81.2l7.4,3.9
                  c0,0-3.7,22.5-9,30.4l-11.9-7.5l-6.2,8l11.4,10.7c0,0-12.2,17.8-20.7,23l-11.9-15.9l-7.1,4.3l8.1,19.2c0,0-15.2,10.9-31.3,13.3
                  l-5.5-22.1l-4.1,0.6l4.6,41.2H104l3.7-40.7l-4.3-0.4l-5.1,22.5c0,0-24-5-33.3-12.8l9.9-18.7l-11.4-6.5L50.8,187
                  c0,0-17-14.6-20.5-22.5l11.8-11.4l-8-10.7l-11.8,7c0,0-7-15.4-7.2-24.1l8.6-2.7C23.8,122.3,19.6,73.7,47.6,42.4z"/>
              </svg>
            </div>
            
            <div className="title-section">
              <h1 style={{ color: currentTheme.colors.primary }}>
                Poseidon Racing
              </h1>
              <p style={{ color: currentTheme.colors.disabled }}>
                Stock Management (Beta Version)
              </p>
            </div>
          </div>

          {/* User Section */}
          <div className="user-section" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            padding: '8px 0' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center'
            }}>
              <span style={{ 
                color: currentTheme.colors.primary, 
                fontSize: '16px', 
                fontWeight: '500' 
              }}>
                {currentUser.username}
              </span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="stat-item">
              <span 
                className="stat-label" 
                style={{ color: currentTheme.colors.disabled }}
              >
                Total Items:
              </span>
              <span 
                className="stat-value" 
                style={{ color: currentTheme.colors.info }}
              >
                {stats?.total_items ?? '...'}
              </span>
            </div>
            <div className="stat-item">
              <span 
                className="stat-label" 
                style={{ color: currentTheme.colors.disabled }}
              >
                Total Quantity:
              </span>
              <span 
                className="stat-value" 
                style={{ color: currentTheme.colors.success }}
              >
                {stats?.total_quantity ?? '...'}
              </span>
            </div>
          </div>

          {/* Theme Button - Bottom positioned */}
          <button
            onClick={handleThemeDrawerOpen}
            className="theme-toggle-button"
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.onPrimary
            }}
            title="Change Theme"
          >
            🎨 Theme
          </button>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav 
        className="app-navigation"
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderBottomColor: currentTheme.colors.border
        }}
      >
        <div className="nav-content">
          <button
            onClick={() => handleViewSwitch('input')}
            className={`nav-button ${currentView === 'input' ? 'active' : ''}`}
            style={{
              backgroundColor: currentView === 'input' 
                ? currentTheme.colors.primary 
                : 'transparent',
              color: currentView === 'input' 
                ? currentTheme.colors.onPrimary 
                : currentTheme.colors.onSurface,
              borderColor: currentTheme.colors.border
            }}
          >
            <img src="/src/assets/icons/radix icons/plus.svg" alt="" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Add Items
          </button>
          
          <button
            onClick={() => handleViewSwitch('table')}
            className={`nav-button ${currentView === 'table' ? 'active' : ''}`}
            style={{
              backgroundColor: currentView === 'table' 
                ? currentTheme.colors.primary 
                : 'transparent',
              color: currentView === 'table' 
                ? currentTheme.colors.onPrimary 
                : currentTheme.colors.onSurface,
              borderColor: currentTheme.colors.border
            }}
          >
            <img src="/src/assets/icons/radix icons/table.svg" alt="" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            View & Edit Database
          </button>
          
          <button
            onClick={() => handleViewSwitch('files')}
            className={`nav-button ${currentView === 'files' ? 'active' : ''}`}
            style={{
              backgroundColor: currentView === 'files' 
                ? currentTheme.colors.primary 
                : 'transparent',
              color: currentView === 'files' 
                ? currentTheme.colors.onPrimary 
                : currentTheme.colors.onSurface,
              borderColor: currentTheme.colors.border
            }}
          >
            <img src="/src/assets/icons/radix icons/upload.svg" alt="" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Import/Export/Backup
          </button>
          
          <button
            onClick={async () => {
              console.log('🔍 Testing API connection...');
              try {
                const { apiClient } = await import('../services/api-client');
                const users = await apiClient.getAllUsers();
                console.log('✅ API Connection Test - Users found:', users.length);
                alert(`✅ API Test Passed! Found ${users.length} users`);
              } catch (error) {
                console.error('API Test error:', error);
                alert(`❌ API Test Error: ${error}`);
              }
            }}
            className="nav-button"
            style={{
              backgroundColor: 'transparent',
              color: currentTheme.colors.onSurface,
              borderColor: currentTheme.colors.border,
              fontSize: '12px'
            }}
          >
            🔧 Test SQL.js
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main 
        className="main-content"
        style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: currentTheme.colors.background
        }}
      >
        {currentView === 'input' ? (
          <InventoryForm
            onItemAdded={handleItemAdded}
            onViewInventory={() => handleViewSwitch('table')}
            currentUser={currentUser}
          />
        ) : currentView === 'table' ? (
          <InventoryTable
            onBackToInput={() => handleViewSwitch('input')}
            refreshTrigger={refreshTrigger}
          />
        ) : (
          <FileManager
            onExportComplete={(filePath) => {
              console.log(`Exported to ${filePath}`);
            }}
          />
        )}
      </main>

      {/* Bottom Theme Drawer */}
      <BottomThemeDrawer
        isOpen={isThemeDrawerOpen}
        onClose={handleThemeDrawerClose}
        onThemeChange={(theme) => {
          console.log(`🎨 Theme changed to: ${theme.name}`);
          // Stats will automatically update due to theme context
        }}
      />

      {/* 
      <footer 
        className="app-footer"
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderTopColor: currentTheme.colors.border,
          color: currentTheme.colors.disabled
        }}
      >
        <div className="footer-content">
          <p>
            Built with ❤️ for Poseidon Racing Electrical Team • 
            Season 2024-2025 • 
            Click the theme button for customization
          </p>
          <div className="footer-info">
            <span>TypeScript + React + Tauri + Rust</span>
            <span>•</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>
      */}
    </div>
  );
};

export default StockManagementApp;
