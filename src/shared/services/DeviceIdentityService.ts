// =============================================================================
// DEVICE IDENTITY SERVICE
// =============================================================================
// Robust device identification service that uses database as primary storage
// with localStorage as cache, and browser fingerprinting as fallback

import { invoke } from '@utils/tauri-compat';

export interface DeviceFingerprint {
  userAgent: string;
  language: string;
  timezone: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  platform: string;
  cookieEnabled: boolean;
  canvas: string;
}

export interface DeviceIdentity {
  device_id: string;
  fingerprint_hash: string;
  created_at: string;
  last_seen: string;
  is_primary: boolean;
}

export class DeviceIdentityService {
  private static readonly CACHE_KEY = 'prstocks_device_cache';
  private static readonly FINGERPRINT_KEY = 'prstocks_fingerprint';
  
  // =============================================================================
  // DEVICE FINGERPRINTING
  // =============================================================================
  
  /**
   * Generate a comprehensive device fingerprint
   */
  private static async generateFingerprint(): Promise<DeviceFingerprint> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint test', 2, 2);
    }
    
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
      },
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      canvas: canvas.toDataURL(),
    };
  }

  /**
   * Create a hash from the device fingerprint
   */
  private static async hashFingerprint(fingerprint: DeviceFingerprint): Promise<string> {
    const fingerprintStr = JSON.stringify(fingerprint);
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintStr);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // =============================================================================
  // DEVICE IDENTITY MANAGEMENT
  // =============================================================================

  /**
   * Get or create device identity using database-first approach
   */
  static async getOrCreateDeviceIdentity(): Promise<string> {
    try {
      // Step 1: Check localStorage cache
      const cachedDeviceId = localStorage.getItem(this.CACHE_KEY);
      
      if (cachedDeviceId) {
        // Verify the cached device ID exists in database
        const exists = await this.verifyDeviceInDatabase(cachedDeviceId);
        if (exists) {
          console.log(`🔍 Using cached device ID: ${cachedDeviceId}`);
          await this.updateLastSeen(cachedDeviceId);
          return cachedDeviceId;
        } else {
          // Cache is stale, remove it
          localStorage.removeItem(this.CACHE_KEY);
        }
      }

      // Step 2: Generate device fingerprint
      const fingerprint = await this.generateFingerprint();
      const fingerprintHash = await this.hashFingerprint(fingerprint);

      // Step 3: Check if device exists by fingerprint
      const existingDevice = await this.findDeviceByFingerprint(fingerprintHash);
      
      if (existingDevice) {
        console.log(`🔄 Found existing device by fingerprint: ${existingDevice}`);
        // Cache the device ID
        localStorage.setItem(this.CACHE_KEY, existingDevice);
        await this.updateLastSeen(existingDevice);
        return existingDevice;
      }

      // Step 4: Create new device identity
      const newDeviceId = await this.createNewDevice(fingerprintHash, fingerprint);
      console.log(`🆕 Created new device identity: ${newDeviceId}`);
      
      // Cache the new device ID
      localStorage.setItem(this.CACHE_KEY, newDeviceId);
      
      return newDeviceId;

    } catch (error) {
      console.error('❌ Failed to get device identity:', error);
      
      // Ultimate fallback: generate temporary ID
      const fallbackId = `temp_device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(this.CACHE_KEY, fallbackId);
      console.warn(`⚠️ Using fallback device ID: ${fallbackId}`);
      
      return fallbackId;
    }
  }

  /**
   * Verify if device ID exists in database
   */
  private static async verifyDeviceInDatabase(deviceId: string): Promise<boolean> {
    try {
      const exists = await invoke('verify_device_exists', { deviceId }) as boolean;
      return exists;
    } catch (error) {
      console.warn('Could not verify device in database:', error);
      return false;
    }
  }

  /**
   * Find device by fingerprint hash
   */
  private static async findDeviceByFingerprint(fingerprintHash: string): Promise<string | null> {
    try {
      const deviceId = await invoke('find_device_by_fingerprint', { fingerprintHash }) as string | null;
      return deviceId;
    } catch (error) {
      console.warn('Could not find device by fingerprint:', error);
      return null;
    }
  }

  /**
   * Create new device in database
   */
  private static async createNewDevice(fingerprintHash: string, fingerprint: DeviceFingerprint): Promise<string> {
    try {
      const deviceId = await invoke('create_device_identity', {
        fingerprintHash,
        fingerprintData: JSON.stringify(fingerprint),
        userAgent: fingerprint.userAgent,
        platform: fingerprint.platform,
        timezone: fingerprint.timezone
      });
      return deviceId;
    } catch (error) {
      console.error('Failed to create device in database:', error);
      throw error;
    }
  }

  /**
   * Update last seen timestamp for device
   */
  private static async updateLastSeen(deviceId: string): Promise<void> {
    try {
      await invoke('update_device_last_seen', { deviceId });
    } catch (error) {
      console.warn('Could not update device last seen:', error);
    }
  }

  // =============================================================================
  // CACHE MANAGEMENT
  // =============================================================================

  /**
   * Clear device cache (useful for testing or manual reset)
   */
  static clearDeviceCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.FINGERPRINT_KEY);
    console.log('🗑️ Cleared device identity cache');
  }

  /**
   * Get cached device ID without database verification
   */
  static getCachedDeviceId(): string | null {
    return localStorage.getItem(this.CACHE_KEY);
  }

  /**
   * Force refresh device identity (re-check database)
   */
  static async refreshDeviceIdentity(): Promise<string> {
    this.clearDeviceCache();
    return await this.getOrCreateDeviceIdentity();
  }

  // =============================================================================
  // MIGRATION UTILITIES
  // =============================================================================

  /**
   * Migrate old localStorage device IDs to new system
   */
  static async migrateOldDeviceId(): Promise<void> {
    const oldDeviceId = localStorage.getItem('device_id') || localStorage.getItem('prstocks-device-id');
    
    if (oldDeviceId && !localStorage.getItem(this.CACHE_KEY)) {
      console.log(`🔄 Migrating old device ID: ${oldDeviceId}`);
      
      try {
        // Check if old device ID exists in database
        const exists = await this.verifyDeviceInDatabase(oldDeviceId);
        
        if (exists) {
          // Use the old device ID
          localStorage.setItem(this.CACHE_KEY, oldDeviceId);
          console.log(`✅ Successfully migrated device ID: ${oldDeviceId}`);
        } else {
          // Old ID doesn't exist in database, create new identity
          console.log(`⚠️ Old device ID not found in database, creating new identity`);
          await this.getOrCreateDeviceIdentity();
        }
        
        // Clean up old keys
        localStorage.removeItem('device_id');
        localStorage.removeItem('prstocks-device-id');
        
      } catch (error) {
        console.error('Migration failed:', error);
      }
    }
  }
}

