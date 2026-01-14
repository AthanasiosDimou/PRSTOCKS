// =============================================================================
// CROSS-DEVICE PREFERENCES SERVICE
// =============================================================================
// Manages user preferences that sync across multiple devices
// Handles both local storage (device-specific) and server storage (cross-device)

import { serverDatabaseService } from '../../../services/server-database-service';

export interface UserPreferences {
  device_id: string;
  theme: string;
  language: string;
  items_per_page: number;
  default_view: string;
  notifications_enabled: boolean;
  auto_backup: boolean;
  preferences: {
    selected_theme: string;
    last_active: string;
    created_at: string;
    settings: string;
  };
}

export class CrossDevicePreferencesService {
  static getOrCreateDeviceId(): string {
    // Get or generate a device ID for local device identification
    let deviceId = localStorage.getItem('device-id');
    if (!deviceId) {
      deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('device-id', deviceId);
    }
    return deviceId;
  }

  static async initializeDevice(): Promise<void> {
    // Initialize server database service for cross-device sync
    await serverDatabaseService.initialize();
  }

  static async updateUserTheme(theme: string, username: string): Promise<void> {
    console.log(`🎨 CrossDevicePreferencesService: Updating theme for ${username} to ${theme}`);
    try {
      // Get current preferences to preserve existing settings
      const currentPrefs = await this.getUserPreferences(username);
      console.log(`🎨 Current preferences for ${username}:`, currentPrefs);
      
      // Get existing preferences or use defaults
      const existingPrefs = currentPrefs?.preferences || {};
      const existingSettings = (existingPrefs as any).settings ? JSON.parse((existingPrefs as any).settings) : {};
      
      // Create the updated preferences object with NEW theme taking priority
      const updatedPrefs = {
        // Preserve any existing settings first
        ...existingSettings,
        // Then override with the new theme (this ensures theme takes priority)
        theme: theme,
        selected_theme: theme,
        last_active: new Date().toISOString()
      };
      
      console.log(`🎨 Saving updated preferences for ${username}:`, updatedPrefs);
      await serverDatabaseService.saveUserPreferences(username, updatedPrefs);
      console.log(`🎨 Theme ${theme} saved successfully for user ${username}`);
    } catch (error) {
      console.error(`🎨 Failed to save theme for ${username}:`, error);
      throw error;
    }
  }

  static async getUserPreferences(username: string): Promise<UserPreferences | null> {
    try {
      console.log(`🎨 Loading preferences for user: ${username}`);
      const prefs = await serverDatabaseService.getUserPreferences(username);
      console.log(`🎨 Raw backend response for ${username}:`, prefs);
      
      // Extract preferences from the correct path in the API response
      const userPreferences = prefs.data?.preferences || prefs.preferences || {};
      console.log(`🎨 Extracted preferences for ${username}:`, userPreferences);
      
      return {
        device_id: username, // Use username as device_id for compatibility
        theme: userPreferences.theme || userPreferences.selected_theme || 'dark',
        language: userPreferences.language || 'en',
        items_per_page: userPreferences.items_per_page || 25,
        default_view: userPreferences.default_view || 'grid',
        notifications_enabled: userPreferences.notifications_enabled ?? true,
        auto_backup: userPreferences.auto_backup ?? false,
        preferences: {
          selected_theme: userPreferences.theme || userPreferences.selected_theme || 'dark',
          last_active: new Date().toISOString(),
          created_at: prefs.data?.updated_at || prefs.updated_at || new Date().toISOString(),
          settings: JSON.stringify(userPreferences)
        }
      };
    } catch (error) {
      console.warn('🎨 Failed to load user preferences, using defaults:', error);
      return {
        device_id: username,
        theme: 'dark',
        language: 'en',
        items_per_page: 25,
        default_view: 'grid',
        notifications_enabled: true,
        auto_backup: false,
        preferences: {
          selected_theme: 'dark',
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString(),
          settings: '{}'
        }
      };
    }
  }

  static async saveUserPreferences(
    theme: string,
    language: string,
    items_per_page: number,
    default_view: string,
    notifications_enabled: boolean,
    auto_backup: boolean,
    username: string
  ): Promise<void>;
  static async saveUserPreferences(username: string, preferences: any): Promise<void>;
  static async saveUserPreferences(...args: any[]): Promise<void> {
    if (args.length === 7) {
      // Structured signature: (theme, language, items_per_page, default_view, notifications_enabled, auto_backup, username)
      const [theme, language, items_per_page, default_view, notifications_enabled, auto_backup, username] = args;
      console.log('Saving structured preferences for user:', username, { 
        theme, language, items_per_page, default_view, notifications_enabled, auto_backup 
      });
      
      const prefs = {
        theme,
        language,
        items_per_page,
        default_view,
        notifications_enabled,
        auto_backup,
        last_active: new Date().toISOString()
      };
      
      await serverDatabaseService.saveUserPreferences(username, prefs);
    } else {
      // Object signature: (username, preferences)
      const [username, preferences] = args;
      console.log('Saving object preferences for user:', username, preferences);
      await serverDatabaseService.saveUserPreferences(username, preferences);
    }
  }

  static async getDeviceStats(_deviceId: string): Promise<any> {
    // Device statistics (currently not implemented for username-based system)
    return {
      total_items: 0,
      last_sync: new Date().toISOString()
    };
  }

  // =============================================================================
  // BACKWARD COMPATIBILITY METHODS
  // =============================================================================

  static async updateDeviceTheme(theme: string, username: string): Promise<void> {
    // Redirect to the new method name
    return this.updateUserTheme(theme, username);
  }

  static async saveDevicePreferences(
    theme: string,
    language: string,
    items_per_page: number,
    default_view: string,
    notifications_enabled: boolean,
    auto_backup: boolean,
    username: string
  ): Promise<void>;
  static async saveDevicePreferences(username: string, preferences: any): Promise<void>;
  static async saveDevicePreferences(...args: any[]): Promise<void> {
    // Redirect to the new method name with proper type handling
    if (args.length === 7) {
      // Structured parameters
      const [theme, language, items_per_page, default_view, notifications_enabled, auto_backup, username] = args;
      return this.saveUserPreferences(theme, language, items_per_page, default_view, notifications_enabled, auto_backup, username);
    } else {
      // Object parameters  
      const [username, preferences] = args;
      return this.saveUserPreferences(username, preferences);
    }
  }

  static async backupDevicePreferences(_username: string): Promise<void> {
    // Not needed for server-based preferences - this was a legacy method
    console.log('🎨 Backup not needed for server-based preferences');
  }

  static async getDevicePreferences(deviceId: string): Promise<UserPreferences | null> {
    // Legacy method - redirect to getUserPreferences using deviceId as username
    return this.getUserPreferences(deviceId);
  }
}

// Export both old and new names for backward compatibility during transition
export const DualDatabasePreferencesService = CrossDevicePreferencesService;