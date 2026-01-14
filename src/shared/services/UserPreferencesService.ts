// Placeholder service for dual database preferences
// This provides compatibility with the existing SettingsPage

import { serverDatabaseService } from '../../services/server-database-service';

export interface DevicePreferences {
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

export class UserPreferencesService {
  static getOrCreateDeviceId(): string {
    // Get or generate a device ID
    let deviceId = localStorage.getItem('device-id');
    if (!deviceId) {
      deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('device-id', deviceId);
    }
    return deviceId;
  }

  static async initializeDevice(): Promise<void> {
    // Initialize server database service
    await serverDatabaseService.initialize();
  }

  static async updateDeviceLogin(_deviceId: string): Promise<void> {
    // Not needed for username-based preferences
  }

  static async updateDeviceTheme(theme: string, username: string): Promise<void> {
    // Update theme preference for user
    const currentPrefs = await this.getUserPreferences(username);
    const updatedPrefs = {
      ...currentPrefs,
      theme: theme,
      selected_theme: theme,
      last_active: new Date().toISOString()
    };
    await this.saveUserPreferences(username, updatedPrefs);
  }

  static async backupDevicePreferences(_username: string): Promise<void> {
    // Not needed for server-based preferences
  }

  static async getDevicePreferences(deviceId: string): Promise<DevicePreferences | null> {
    // Legacy method - kept for compatibility
    return {
      device_id: deviceId,
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

  static async getUserPreferences(username: string): Promise<DevicePreferences | null> {
    try {
      const prefs = await serverDatabaseService.getUserPreferences(username);
      return {
        device_id: username, // Use username as device_id for compatibility
        theme: prefs.theme || 'dark',
        language: prefs.language || 'en',
        items_per_page: prefs.items_per_page || 25,
        default_view: prefs.default_view || 'grid',
        notifications_enabled: prefs.notifications_enabled ?? true,
        auto_backup: prefs.auto_backup ?? false,
        preferences: {
          selected_theme: prefs.theme || 'dark',
          last_active: new Date().toISOString(),
          created_at: prefs.created_at || new Date().toISOString(),
          settings: JSON.stringify(prefs)
        }
      };
    } catch (error) {
      console.warn('Failed to load user preferences, using defaults:', error);
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

  static async saveDevicePreferences(
    theme: string,
    language: string,
    items_per_page: number,
    default_view: string,
    notifications_enabled: boolean,
    auto_backup: boolean,
    deviceId: string
  ): Promise<void>;
  static async saveDevicePreferences(deviceId: string, preferences: any): Promise<void>;
  static async saveDevicePreferences(...args: any[]): Promise<void> {
    if (args.length === 7) {
      // New signature: (theme, language, items_per_page, default_view, notifications_enabled, auto_backup, username)
      const [theme, language, items_per_page, default_view, notifications_enabled, auto_backup, username] = args;
      console.log('Saving preferences for user:', username, { 
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
      // Legacy signature: (username, preferences)
      const [username, preferences] = args;
      console.log('Saving preferences for user:', username, preferences);
      await serverDatabaseService.saveUserPreferences(username, preferences);
    }
  }

  static async saveUserPreferences(username: string, preferences: any): Promise<void> {
    await serverDatabaseService.saveUserPreferences(username, preferences);
  }

  static async getDeviceStats(_deviceId: string): Promise<any> {
    // Not used for username-based preferences
    return {
      total_items: 0,
      last_sync: new Date().toISOString()
    };
  }
}
