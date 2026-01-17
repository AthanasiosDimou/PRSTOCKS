// =============================================================================
// SERVER-BASED DATABASE SERVICE
// =============================================================================
// This replaces the browser SQLite with API calls to your server
// Now your data lives on the Raspberry Pi and is shared across all devices!

import { apiClient, UserData, InventoryItem, InventoryStats } from './api-client';

class ServerDatabaseService {
  private initialized = false;
  private serverUrls: string[] = [];

  constructor() {
    console.log('🌐 ServerDatabaseService: Ready to connect to file-based server');
    
    // Generate server URLs based on current host
    const currentHost = window.location.hostname;
    // Detect protocol (http: or https:)
    const protocol = window.location.protocol;
    
    console.log('🔍 ServerDatabaseService detected host:', currentHost, 'protocol:', protocol);
    
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      // Local development
      this.serverUrls = [
        `${protocol}//localhost:8000/api`,
        `${protocol}//127.0.0.1:8000/api`,
        'http://localhost:8000/api', // Fallback to http if https fails locally
      ];
      console.log('🏠 Using localhost URLs');
    } else {
      // Network access - use the same host AND protocol as frontend
      const networkUrl = `${protocol}//${currentHost}:8000/api`;
      this.serverUrls = [
        networkUrl,
        `${protocol}//localhost:8000/api`,  // Fallback
      ];
      console.log('🌐 Using network URLs, primary:', networkUrl);
    }
    
    console.log('🔍 Final ServerDatabaseService URLs:', this.serverUrls);
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('✅ Server database service already initialized');
      return;
    }

    console.log('🔗 Connecting to server database...');

    try {
      // Check if API client is already initialized with the correct URL
      const currentApiUrl = (apiClient as any).baseUrl;
      const expectedUrl = this.serverUrls[0];
      
      let connected = false;
      
      if (currentApiUrl === expectedUrl) {
        // API client already has correct URL, just test connection
        console.log('🔗 API client already configured correctly');
        connected = await apiClient.testConnection();
      } else {
        // Try to auto-detect server
        const serverUrl = await apiClient.autoDetectServer(this.serverUrls);
        
        if (!serverUrl) {
          // Fallback to default
          console.log('⚠️ Server auto-detection failed, using default URL');
          apiClient.setServerUrl(this.serverUrls[0]);
        }

        // Test connection
        connected = await apiClient.initialize();
      }
      
      if (connected) {
        this.initialized = true;
        console.log('✅ Connected to server database!');
        console.log('📁 Data is stored in .db files on the server');
        console.log('🌐 Changes sync across all devices');
      } else {
        throw new Error('Failed to connect to server');
      }

    } catch (error) {
      console.error('🔴 Server database initialization failed:', error);
      console.error('💡 Make sure your server is running: npm run dev');
      throw error;
    }
  }

  // Update server URL (useful when switching to Pi)
  setServerUrl(url: string): void {
    apiClient.setServerUrl(url);
    this.initialized = false; // Force re-initialization
  }

  // =============================================================================
  // USER OPERATIONS
  // =============================================================================

  async createUser(userData: UserData): Promise<number> {
    await this.initialize();
    return apiClient.createUser(userData);
  }

  async getAllUsers(): Promise<UserData[]> {
    await this.initialize();
    return apiClient.getAllUsers();
  }

  async deleteUser(userId: number): Promise<boolean> {
    await this.initialize();
    return apiClient.deleteUser(userId);
  }

  async verifyUserPassword(username: string, password: string): Promise<boolean> {
    await this.initialize();
    return apiClient.verifyUserPassword(username, password);
  }

  async updateUserPassword(username: string, newPassword: string): Promise<boolean> {
    await this.initialize();
    return apiClient.updateUserPassword(username, newPassword);
  }

  // =============================================================================
  // INVENTORY OPERATIONS
  // =============================================================================

  async addInventoryItem(item: InventoryItem): Promise<number> {
    await this.initialize();
    return apiClient.addInventoryItem(item);
  }

  async getAllInventoryItems(): Promise<InventoryItem[]> {
    await this.initialize();
    return apiClient.getAllInventoryItems();
  }

  async updateInventoryItem(itemId: number, updates: Partial<InventoryItem>): Promise<boolean> {
    await this.initialize();
    return apiClient.updateInventoryItem(itemId, updates);
  }

  async deleteInventoryItem(itemId: number): Promise<boolean> {
    await this.initialize();
    return apiClient.deleteInventoryItem(itemId);
  }

  async updateInventoryItemField(itemId: number, fieldName: string, newValue: any): Promise<boolean> {
    const updates: Partial<InventoryItem> = {
      [fieldName]: newValue
    };
    return this.updateInventoryItem(itemId, updates);
  }

  async getInventoryStatistics(): Promise<InventoryStats> {
    await this.initialize();
    return apiClient.getInventoryStatistics();
  }

  async getAutocompleteSuggestions(input: string, field: string = 'part_number'): Promise<string[]> {
    try {
      if (!input.trim()) {
        return [];
      }

      // Get all items and filter client-side for suggestions
      const items = await this.getAllInventoryItems();
      const inputLower = input.toLowerCase();

      const suggestions = new Set<string>();
      items.forEach(item => {
        const fieldValue = (item as any)[field];
        if (fieldValue && typeof fieldValue === 'string' &&
            fieldValue.toLowerCase().includes(inputLower)) {
          suggestions.add(fieldValue);
        }
      });

      return Array.from(suggestions).slice(0, 10); // Limit to 10 suggestions
    } catch (error) {
      console.error('❌ Failed to get autocomplete suggestions:', error);
      return []; // Return empty array on error instead of throwing
    }
  }

  // =============================================================================
  // PREFERENCES OPERATIONS
  // =============================================================================

  async getDevicePreferences(deviceId: string): Promise<Record<string, any>> {
    await this.initialize();
    return apiClient.getDevicePreferences(deviceId);
  }

  async saveDevicePreferences(deviceId: string, preferences: Record<string, any>): Promise<void> {
    await this.initialize();
    return apiClient.saveDevicePreferences(deviceId, preferences);
  }

  async getUserPreferences(username: string): Promise<Record<string, any>> {
    await this.initialize();
    return apiClient.getUserPreferences(username);
  }

  async saveUserPreferences(username: string, preferences: Record<string, any>): Promise<void> {
    await this.initialize();
    return apiClient.saveUserPreferences(username, preferences);
  }

  // =============================================================================
  // ADMIN OPERATIONS
  // =============================================================================

  async clearAllData(): Promise<void> {
    await this.initialize();
    return apiClient.clearAllData();
  }

  async getDatabaseInfo(): Promise<any> {
    await this.initialize();
    return apiClient.getDatabaseInfo();
  }

  // =============================================================================
  // EXPORT OPERATIONS
  // =============================================================================

  async exportDatabase(dbType: 'main' | 'users' | 'preferences'): Promise<void> {
    await this.initialize();
    return apiClient.exportDatabase(dbType);
  }

  async exportAllDatabases(): Promise<void> {
    await this.initialize();
    return apiClient.exportAllDatabases();
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  async testConnection(): Promise<boolean> {
    try {
      return await apiClient.testConnection();
    } catch {
      return false;
    }
  }

  async isServerReachable(): Promise<boolean> {
    return apiClient.isServerReachable();
  }

  // Get server status info
  async getServerStatus(): Promise<{
    connected: boolean;
    serverUrl: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const connected = await this.testConnection();
      const responseTime = Date.now() - startTime;
      
      return {
        connected,
        serverUrl: apiClient['baseUrl'], // Access private property
        responseTime: connected ? responseTime : undefined,
      };
    } catch {
      return {
        connected: false,
        serverUrl: apiClient['baseUrl'],
      };
    }
  }
}

// Export singleton instance
export const serverDatabaseService = new ServerDatabaseService();
export default serverDatabaseService;