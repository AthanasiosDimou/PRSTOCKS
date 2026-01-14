// =============================================================================
// ENHANCED DEVICE PREFERENCES SERVICE
// =============================================================================
// Updated service that uses robust device identification with database-first approach

import { invoke } from '@utils/tauri-compat';
import { DeviceIdentityService } from './DeviceIdentityService';

export interface DevicePreferences {
  device_id: string;
  device_ip?: string;
  device_name?: string;
  device_type?: string;
  theme: string;
  language: string;
  items_per_page: number;
  default_view: string;
  notifications_enabled: boolean;
  auto_backup: boolean;
  backup_frequency?: string;
  last_login: string;
  first_login: string;
  login_count: number;
  created_at: string;
  updated_at: string;
}

export interface DeviceStats {
  device_id: string;
  last_login?: string;
  login_count?: number;
  theme?: string;
  preferences_exist: boolean;
  fingerprint_hash?: string;
  created_at?: string;
  last_seen?: string;
}

export class EnhancedDevicePreferencesService {
  
  // =============================================================================
  // INITIALIZATION
  // =============================================================================
  
  /**
   * Initialize device with robust identification
   */
  static async initializeDevice(): Promise<{ status: string; preferences: DevicePreferences | null; device_id: string }> {
    try {
      // First, migrate any old device IDs
      await DeviceIdentityService.migrateOldDeviceId();
      
      // Get or create robust device identity
      const deviceId = await DeviceIdentityService.getOrCreateDeviceIdentity();
      
      // Get device preferences (create if don't exist)
      const preferences = await this.getDevicePreferences(deviceId);
      
      // Update login information
      await this.updateDeviceLogin(deviceId);
      
      const status = preferences ? 'existing_device' : 'new_device';
      console.log(`🚀 Device initialized: ${status} - ${deviceId}`);
      
      return {
        status,
        preferences: preferences || await this.createDefaultPreferences(deviceId),
        device_id: deviceId
      };
      
    } catch (error) {
      console.error('❌ Failed to initialize device:', error);
      throw new Error(`Failed to initialize device: ${error}`);
    }
  }

  // =============================================================================
  // PREFERENCE MANAGEMENT
  // =============================================================================
  
  /**
   * Gets device preferences from the database
   */
  static async getDevicePreferences(deviceId?: string): Promise<DevicePreferences | null> {
    try {
      const id = deviceId || await DeviceIdentityService.getOrCreateDeviceIdentity();
      const preferences = await invoke('get_device_preferences', { deviceId: id }) as DevicePreferences | null;
      
      if (preferences) {
        console.log(`🎨 Retrieved preferences for device ${id}`);
      } else {
        console.log(`📝 No preferences found for device ${id}`);
      }
      
      return preferences;
    } catch (error) {
      console.error('❌ Failed to get device preferences:', error);
      return null;
    }
  }

  /**
   * Saves device preferences to the database
   */
  static async saveDevicePreferences(
    theme: string,
    language: string = 'en',
    itemsPerPage: number = 25,
    defaultView: string = 'grid',
    notificationsEnabled: boolean = true,
    autoBackup: boolean = false,
    deviceId?: string
  ): Promise<void> {
    try {
      const id = deviceId || await DeviceIdentityService.getOrCreateDeviceIdentity();
      
      await invoke('save_device_preferences', {
        deviceId: id,
        theme,
        language,
        itemsPerPage,
        defaultView,
        notificationsEnabled,
        autoBackup
      });
      
      console.log(`💾 Saved preferences for device ${id}: theme=${theme}`);
    } catch (error) {
      console.error('❌ Failed to save device preferences:', error);
      throw new Error(`Failed to save preferences: ${error}`);
    }
  }

  /**
   * Updates only the theme (quick theme switch)
   */
  static async updateDeviceTheme(theme: string, deviceId?: string): Promise<void> {
    try {
      const id = deviceId || await DeviceIdentityService.getOrCreateDeviceIdentity();
      
      await invoke('update_device_theme', {
        deviceId: id,
        theme
      });
      
      console.log(`🎨 Updated theme for device ${id} to: ${theme}`);
    } catch (error) {
      console.error('❌ Failed to update device theme:', error);
      throw new Error(`Failed to update theme: ${error}`);
    }
  }

  /**
   * Create default preferences for a new device
   */
  private static async createDefaultPreferences(deviceId: string): Promise<DevicePreferences> {
    await this.saveDevicePreferences('light', 'en', 25, 'grid', true, false, deviceId);
    const preferences = await this.getDevicePreferences(deviceId);
    
    if (!preferences) {
      throw new Error('Failed to create default preferences');
    }
    
    return preferences;
  }

  // =============================================================================
  // LOGIN AND SESSION MANAGEMENT
  // =============================================================================

  /**
   * Updates device login time and metadata
   */
  static async updateDeviceLogin(deviceId?: string): Promise<void> {
    try {
      const id = deviceId || await DeviceIdentityService.getOrCreateDeviceIdentity();
      const ipAddress = await this.getDeviceIP();
      
      await invoke('update_device_login', {
        deviceId: id,
        ipAddress,
        userAgent: navigator.userAgent
      });
      
      console.log(`🔐 Updated login for device ${id}`);
    } catch (error) {
      console.error('❌ Failed to update device login:', error);
      // Don't throw error for login updates - it's not critical
    }
  }

  /**
   * Get device IP address (if available)
   */
  private static async getDeviceIP(): Promise<string | null> {
    try {
      // This would typically be filled by the backend from the request
      // For now, we'll let the backend handle IP detection
      return null;
    } catch (error) {
      console.warn('Could not determine device IP:', error);
      return null;
    }
  }

  // =============================================================================
  // STATISTICS AND MONITORING
  // =============================================================================

  /**
   * Gets comprehensive device statistics
   */
  static async getDeviceStats(deviceId?: string): Promise<DeviceStats> {
    try {
      const id = deviceId || await DeviceIdentityService.getOrCreateDeviceIdentity();
      const stats = await invoke('get_enhanced_device_stats', { deviceId: id }) as DeviceStats;
      
      console.log(`📊 Retrieved enhanced stats for device ${id}`);
      return stats;
    } catch (error) {
      console.error('❌ Failed to get device stats:', error);
      const fallbackId = deviceId || 'unknown';
      return {
        device_id: fallbackId,
        preferences_exist: false
      };
    }
  }

  /**
   * Get system-wide device statistics
   */
  static async getSystemStats(): Promise<Record<string, number>> {
    try {
      const stats = await invoke('get_device_statistics') as Record<string, number>;
      console.log('📈 Retrieved system device statistics');
      return stats;
    } catch (error) {
      console.error('❌ Failed to get system stats:', error);
      return {};
    }
  }

  // =============================================================================
  // BACKUP OPERATIONS
  // =============================================================================

  /**
   * Backup device preferences to DuckDB
   */
  static async backupDevicePreferences(deviceId?: string): Promise<void> {
    try {
      const id = deviceId || await DeviceIdentityService.getOrCreateDeviceIdentity();
      
      await invoke('backup_device_preferences', { deviceId: id });
      console.log(`💾 Backed up preferences for device ${id}`);
    } catch (error) {
      console.error('❌ Failed to backup device preferences:', error);
      throw new Error(`Failed to backup preferences: ${error}`);
    }
  }

  // =============================================================================
  // DEVICE MANAGEMENT
  // =============================================================================

  /**
   * Get current device ID
   */
  static async getCurrentDeviceId(): Promise<string> {
    return await DeviceIdentityService.getOrCreateDeviceIdentity();
  }

  /**
   * Refresh device identity (useful for testing or manual refresh)
   */
  static async refreshDeviceIdentity(): Promise<string> {
    return await DeviceIdentityService.refreshDeviceIdentity();
  }

  /**
   * Clear device cache (useful for testing)
   */
  static clearDeviceCache(): void {
    DeviceIdentityService.clearDeviceCache();
  }

  /**
   * Set device name
   */
  static async setDeviceName(deviceName: string, deviceId?: string): Promise<void> {
    try {
      const id = deviceId || await DeviceIdentityService.getOrCreateDeviceIdentity();
      
      await invoke('set_device_name', {
        deviceId: id,
        deviceName
      });
      
      console.log(`📱 Set device name for ${id}: ${deviceName}`);
    } catch (error) {
      console.error('❌ Failed to set device name:', error);
      throw new Error(`Failed to set device name: ${error}`);
    }
  }

  // =============================================================================
  // LEGACY COMPATIBILITY
  // =============================================================================

  /**
   * Legacy compatibility method for getOrCreateUser
   */
  static async getOrCreateUser(userId: string): Promise<DevicePreferences> {
    // Map old user ID calls to device preferences
    const deviceId = userId.startsWith('device') ? userId : await DeviceIdentityService.getOrCreateDeviceIdentity();
    
    const preferences = await this.getDevicePreferences(deviceId);
    
    if (!preferences) {
      // Create default preferences
      await this.saveDevicePreferences('light', 'en', 25, 'grid', true, false, deviceId);
      return await this.getDevicePreferences(deviceId) as DevicePreferences;
    }
    
    return preferences;
  }

  /**
   * Legacy compatibility method for updateUserTheme
   */
  static async updateUserTheme(userId: string, theme: string): Promise<void> {
    const deviceId = userId.startsWith('device') ? userId : await DeviceIdentityService.getOrCreateDeviceIdentity();
    await this.updateDeviceTheme(theme, deviceId);
  }

  /**
   * Legacy compatibility method for getUserTheme
   */
  static async getUserTheme(userId: string): Promise<string> {
    const deviceId = userId.startsWith('device') ? userId : await DeviceIdentityService.getOrCreateDeviceIdentity();
    const preferences = await this.getDevicePreferences(deviceId);
    return preferences?.theme || 'light';
  }

  /**
   * Legacy compatibility method for getOrCreateLocalUserId
   */
  static async getOrCreateLocalUserId(): Promise<string> {
    return await DeviceIdentityService.getOrCreateDeviceIdentity();
  }
}

