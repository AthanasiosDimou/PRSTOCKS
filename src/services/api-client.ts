// =============================================================================
// API CLIENT - Replacement for localStorage
// =============================================================================
// This replaces browser localStorage with API calls to your server
// Works across all devices connected to your Raspberry Pi

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserData {
  id?: number;
  user_id?: number;
  username: string;
  password?: string;
  subteam?: string;
  category?: string; // User role category (e.g., "admin", "member") - for access control
  role?: 'admin' | 'user';
  is_active?: boolean;
  is_admin?: boolean;
  created_at?: string;
  email?: string;
}

export interface InventoryItem {
  id?: number;
  item_id?: number;
  part_number: string;
  quantity: number;
  item_type?: string;
  description?: string;
  category?: string; // Item category (e.g., "Electronics", "Admin") - for inventory classification
  company?: string;
  location?: string;
  created_by?: string;
  device_id?: string;
  notes?: string;
  last_updated?: string;
  systems?: string;
  case_code_in?: string;
  size?: string;
  link?: string;
  subteam?: string;
  cost?: number;
  vendor?: string;
  last_updated_by?: string;
}

export interface InventoryStats {
  totalItems: number;
  totalQuantity: number;
  categories: { [key: string]: number };
  companies: { [key: string]: number };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // Auto-detect server URL based on current host
    if (!baseUrl) {
      const currentHost = window.location.hostname;
      const protocol = window.location.protocol; 
      console.log(`🔍 Current hostname detected: ${currentHost} with protocol: ${protocol}`);
      
      // If accessing from localhost, use localhost for backend
      // Otherwise, use the same host as the frontend (assumes backend runs on same machine)
      if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        this.baseUrl = `${protocol}//localhost:8000/api`;
        console.log(`🏠 Using localhost backend`);
      } else {
        // Use the current host with backend port, MATCHING THE PROTOCOL (http or https)
        this.baseUrl = `${protocol}//${currentHost}:8000/api`;
        console.log(`🌐 Using network backend with protocol match`);
      }
    } else {
      this.baseUrl = baseUrl;
    }
    console.log(`🔗 API Client initialized with base URL: ${this.baseUrl}`);
  }

  // Update server URL (useful when switching between dev and Pi)
  setServerUrl(url: string) {
    this.baseUrl = url;
    console.log(`🔗 API Client connected to: ${url}`);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      const data = await response.json();
      console.log(`📦 Response data:`, data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ API Error [${endpoint}]:`, error);
      console.error(`🔍 Full URL was: ${this.baseUrl}${endpoint}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // =============================================================================
  // INITIALIZATION & HEALTH
  // =============================================================================

  async initialize(): Promise<boolean> {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 API Client initialization attempt ${attempt}/${maxRetries}`);
        const response = await this.request<any>('/health');
        console.log('✅ Health check response:', response);
        // Health endpoint returns {status: "healthy", ...} directly
        if ((response as any).status === 'healthy') {
          console.log('✅ API Client initialized successfully');
          console.log('🌐 Connected to server:', this.baseUrl);
          return true;
        } else {
          console.error('❌ Unexpected health response:', response);
          if (attempt === maxRetries) {
            console.error('🔴 API Client initialization failed - unexpected response');
            return false;
          }
        }
      } catch (error) {
        console.error(`❌ API Client initialization attempt ${attempt}/${maxRetries} failed:`, error);
        if (attempt === maxRetries) {
          console.error('🔴 API Client initialization failed after', maxRetries, 'attempts:', error);
          return false;
        } else {
          console.log(`⏳ API Client connection attempt ${attempt}/${maxRetries} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    return false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.request<any>('/health');
      // Health endpoint returns {status: "healthy", ...} directly
      return (response as any).status === 'healthy';
    } catch {
      return false;
    }
  }

  // =============================================================================
  // USER OPERATIONS
  // =============================================================================

  async createUser(userData: UserData): Promise<number> {
    const response = await this.request<{ userId: number }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      return response.data.userId;
    } else {
      throw new Error(response.error || 'Failed to create user');
    }
  }

  async getAllUsers(): Promise<UserData[]> {
    const response = await this.request<UserData[]>('/users');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to fetch users');
    }
  }

  async deleteUser(userId: number): Promise<boolean> {
    const response = await this.request(`/users/${userId}`, {
      method: 'DELETE',
    });

    return response.success;
  }

  async verifyUserPassword(username: string, password: string): Promise<boolean> {
    const response = await this.request<{ valid: boolean }>('/users/verify', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.data) {
      return response.data.valid;
    } else {
      throw new Error(response.error || 'Failed to verify password');
    }
  }

  async updateUserPassword(username: string, newPassword: string): Promise<boolean> {
    const response = await this.request(`/users/${username}/password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });

    return response.success;
  }

  // =============================================================================
  // INVENTORY OPERATIONS
  // =============================================================================

  async addInventoryItem(item: InventoryItem): Promise<number> {
    const response = await this.request<{ itemId: number }>('/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });

    if (response.success && response.data) {
      return response.data.itemId;
    } else {
      throw new Error(response.error || 'Failed to add inventory item');
    }
  }

  async getAllInventoryItems(): Promise<InventoryItem[]> {
    const response = await this.request<InventoryItem[]>('/inventory');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to fetch inventory items');
    }
  }

  async updateInventoryItem(itemId: number, updates: Partial<InventoryItem>): Promise<boolean> {
    const response = await this.request(`/inventory/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    return response.success;
  }

  async deleteInventoryItem(itemId: number): Promise<boolean> {
    const response = await this.request(`/inventory/${itemId}`, {
      method: 'DELETE',
    });

    return response.success;
  }

  async getInventoryStatistics(): Promise<InventoryStats> {
    const response = await this.request<InventoryStats>('/inventory/statistics');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to fetch inventory statistics');
    }
  }

  // =============================================================================
  // PREFERENCES OPERATIONS
  // =============================================================================

  async getDevicePreferences(deviceId: string): Promise<Record<string, any>> {
    const response = await this.request<Record<string, any>>(`/preferences/${deviceId}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to fetch preferences');
    }
  }

  async saveDevicePreferences(deviceId: string, preferences: Record<string, any>): Promise<void> {
    const response = await this.request(`/preferences/${deviceId}`, {
      method: 'POST',
      body: JSON.stringify(preferences),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to save preferences');
    }
  }

  async getUserPreferences(username: string): Promise<Record<string, any>> {
    const response = await this.request<Record<string, any>>(`/preferences/user/${username}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to fetch user preferences');
    }
  }

  async saveUserPreferences(username: string, preferences: Record<string, any>): Promise<void> {
    // Format the data to match PreferenceUpdate schema
    const preferenceUpdate = {
      device_id: `device_${username}_${Date.now()}`, // Generate a unique device ID
      preferences: preferences
    };

    const response = await this.request(`/preferences/user/${username}`, {
      method: 'POST',
      body: JSON.stringify(preferenceUpdate),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to save user preferences');
    }
  }

  // =============================================================================
  // ADMIN OPERATIONS
  // =============================================================================

  async verifyAdmin(adminPassword: string): Promise<{ success: boolean; verified: boolean; message: string }> {
    const response = await this.request<{ verified: boolean; message: string }>('/users/admin/verify', {
      method: 'POST',
      body: JSON.stringify({ admin_password: adminPassword }),
    });

    // The backend returns data directly, not nested under 'data'
    // Extract the verified and message values properly
    let verified = false;
    let message = 'Unknown error';
    
    if (response.data) {
      // Data is nested under 'data' property
      verified = response.data.verified || false;
      message = response.data.message || 'Unknown error';
    } else if ('verified' in response) {
      // Data is returned directly (our case)
      verified = (response as any).verified || false;
      message = (response as any).message || 'Unknown error';
    }

    return {
      success: response.success || false,
      verified: verified,
      message: message || response.error || 'Unknown error'
    };
  }

  async clearAllData(): Promise<void> {
    const response = await this.request('/admin/clear-data', {
      method: 'POST',
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to clear data');
    }
  }

  async getDatabaseInfo(): Promise<any> {
    const response = await this.request<any>('/admin/database-info');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to fetch database info');
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  // Export databases (downloads to the requesting device)
  async exportDatabase(dbType: 'main' | 'users' | 'preferences'): Promise<void> {
    try {
      // Make API request to get the database file as blob
      const response = await fetch(`${this.baseUrl}/admin/export/${dbType}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to export ${dbType} database: ${response.statusText}`);
      }

      // Get the file as a blob
      const blob = await response.blob();
      
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dbType}_${new Date().toISOString().split('T')[0]}.db`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Export failed for ${dbType}:`, error);
      throw error;
    }
  }

  async exportAllDatabases(): Promise<void> {
    await this.exportDatabase('main');
    await this.exportDatabase('users');
    await this.exportDatabase('preferences');
  }

  // Check if server is reachable
  async isServerReachable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseUrl}/health`, { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Auto-detect server (useful for switching between dev and Pi)
  async autoDetectServer(possibleUrls: string[]): Promise<string | null> {
    for (const url of possibleUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${url}/health`, { 
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          this.setServerUrl(url);
          return url;
        }
      } catch {
        // Continue to next URL
      }
    }
    return null;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export for direct use
export default apiClient;