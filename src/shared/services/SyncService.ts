// =============================================================================
// SYNC SERVICE - Real-time database synchronization
// =============================================================================
// Handles real-time sync between multiple devices and browser tabs

import { invoke, listen } from '@utils/tauri-compat';
import { InventoryItem } from '../types/database';

type SyncEventType = 'inventory_updated' | 'inventory_added' | 'inventory_deleted' | 'database_changed';

interface SyncEvent {
  type: SyncEventType;
  timestamp: number;
  data?: any;
  source?: 'native' | 'web' | 'external';
}

type SyncListener = (event: SyncEvent) => void;

export class SyncService {
  private static instance: SyncService | null = null;
  private listeners: Map<string, SyncListener[]> = new Map();
  private lastSyncTime: number = 0;
  private syncInterval: NodeJS.Timeout | null = null;
  private isNativeApp: boolean;
  private fileWatcher: any = null;

  private constructor() {
    this.isNativeApp = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
    this.setupSync();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Setup synchronization based on environment
   */
  private async setupSync() {
    if (this.isNativeApp) {
      await this.setupNativeSync();
    } else {
      await this.setupWebSync();
    }
  }

  /**
   * Setup native app synchronization using Tauri events
   */
  private async setupNativeSync() {
    try {
      // Listen for file system events from Rust backend
      await listen('database_file_changed', (event) => {
        this.handleDatabaseChange('external', event.payload);
      });

      // Listen for inventory events from other app instances
      await listen('inventory_sync_event', (event) => {
        this.handleSyncEvent(event.payload as SyncEvent);
      });

      console.log('🔄 Native sync initialized');
    } catch (error) {
      console.warn('⚠️ Native sync setup failed:', error);
    }
  }

  /**
   * Setup web synchronization using polling and storage events
   */
  private async setupWebSync() {
    // Listen for storage events (cross-tab communication)
    window.addEventListener('storage', (event) => {
      if (event.key === 'inventory_sync_event' && event.newValue) {
        const syncEvent = JSON.parse(event.newValue) as SyncEvent;
        this.handleSyncEvent(syncEvent);
      }
    });

    // Poll for database file changes
    this.syncInterval = setInterval(() => {
      this.checkForDatabaseChanges();
    }, 2000); // Check every 2 seconds

    console.log('🔄 Web sync initialized');
  }

  /**
   * Check for database file changes (web polling)
   */
  private async checkForDatabaseChanges() {
    try {
      const response = await fetch('/database/main_dbs/electrical_inventory.db', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const lastModified = response.headers.get('last-modified');
      if (lastModified) {
        const fileTime = new Date(lastModified).getTime();
        if (fileTime > this.lastSyncTime) {
          this.lastSyncTime = fileTime;
          this.handleDatabaseChange('external');
        }
      }
    } catch (error) {
      // Silently handle errors (file might not exist yet)
    }
  }

  /**
   * Handle database file changes
   */
  private handleDatabaseChange(source: 'native' | 'web' | 'external', data?: any) {
    const event: SyncEvent = {
      type: 'database_changed',
      timestamp: Date.now(),
      source,
      data
    };

    this.emitSync(event);
  }

  /**
   * Handle incoming sync events
   */
  private handleSyncEvent(event: SyncEvent) {
    // Don't process our own events
    if (event.source === (this.isNativeApp ? 'native' : 'web')) {
      return;
    }

    this.emit(event.type, event);
  }

  /**
   * Emit sync event to all connected clients
   */
  private async emitSync(event: SyncEvent) {
    // Local emission
    this.emit(event.type, event);

    // Cross-device/tab emission
    if (this.isNativeApp) {
      try {
        await invoke('emit_sync_event', { event });
      } catch (error) {
        console.warn('Failed to emit native sync event:', error);
      }
    } else {
      // Use localStorage for cross-tab communication
      localStorage.setItem('inventory_sync_event', JSON.stringify(event));
      // Clear after a short delay to allow other tabs to read it
      setTimeout(() => {
        localStorage.removeItem('inventory_sync_event');
      }, 100);
    }
  }

  /**
   * Register a listener for sync events
   */
  on(eventType: SyncEventType, listener: SyncListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Convenience method to listen for database changes
   */
  onDatabaseChanged(callback: () => void): () => void {
    return this.on('database_changed', () => callback());
  }

  /**
   * Convenience method to listen for inventory updates
   */
  onInventoryChanged(callback: (event: SyncEvent) => void): () => void {
    const unsubscribeUpdated = this.on('inventory_updated', callback);
    const unsubscribeAdded = this.on('inventory_added', callback);
    const unsubscribeDeleted = this.on('inventory_deleted', callback);

    return () => {
      unsubscribeUpdated();
      unsubscribeAdded();
      unsubscribeDeleted();
    };
  }

  /**
   * Emit event to local listeners
   */
  private emit(eventType: SyncEventType, event: SyncEvent) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Sync listener error:', error);
        }
      });
    }
  }

  /**
   * Notify about inventory item updates
   */
  async notifyInventoryUpdate(item: InventoryItem, action: 'added' | 'updated' | 'deleted') {
    const eventType: SyncEventType = `inventory_${action}` as SyncEventType;
    const event: SyncEvent = {
      type: eventType,
      timestamp: Date.now(),
      source: this.isNativeApp ? 'native' : 'web',
      data: item
    };

    await this.emitSync(event);
  }

  /**
   * Force refresh all connected clients
   */
  async triggerFullRefresh() {
    const event: SyncEvent = {
      type: 'database_changed',
      timestamp: Date.now(),
      source: this.isNativeApp ? 'native' : 'web',
      data: { fullRefresh: true }
    };

    await this.emitSync(event);
  }

  /**
   * Cleanup sync service
   */
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.fileWatcher) {
      this.fileWatcher.close();
      this.fileWatcher = null;
    }

    this.listeners.clear();
    console.log('🔄 Sync service destroyed');
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();
