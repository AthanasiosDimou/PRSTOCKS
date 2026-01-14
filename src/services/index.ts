// =============================================================================
// SERVICES - Backend services for the application
// =============================================================================
// These services connect to the Python FastAPI backend

import serverDatabaseService from './server-database-service';
import { apiClient } from './api-client';

// Export types for compatibility
export interface User {
  id?: number;
  user_id?: number;
  username: string;
  role?: string;
  email?: string;
  is_admin?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface InventoryItem {
  // Primary key ID (for IndexedDB)
  id?: number;
  item_id?: number | null;
  item_name?: string;
  description?: string | null;
  quantity: number;
  category?: string | null;
  location?: string | null;
  condition?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  device_id?: string; // Make optional again to avoid mandatory requirement
  
  // Additional fields for compatibility
  part_number?: string; // Make optional to avoid conflicts
  item_type?: string | null;
  systems?: string | null;
  case_code_in?: string | null;
  size?: string | null;
  company?: string | null;
  link?: string | null;
  date_time_added?: string | null;
  
  // Backend database fields
  subteam?: string | null;
  cost?: number | null;
  vendor?: string | null;
  created_by?: string | null;
  last_updated_by?: string | null;
  
  // More compatibility fields
  name?: string | null;
  min_quantity?: number | null;
  supplier?: string | null;
  cost_per_unit?: number | null;
  total_value?: number | null;
  last_updated?: string | null;
  status?: string | null;
}

export interface InventoryStats {
  total_items: number;
  total_quantity: number;
  categories: Record<string, number>;
  recent_additions: InventoryItem[];
  // Additional compatibility fields
  unique_part_numbers?: number;
  item_types?: string[];
  by_category?: { [category: string]: { count: number; quantity: number } };
  by_subteam?: { [subteam: string]: { count: number; quantity: number } };
}

// Export categories for inventory
export const CATEGORIES = {
  ELECTRONICS: 'Electronics',
  MECHANICAL: 'Mechanical',
  SOFTWARE: 'Software',
  CONSUMABLES: 'Consumables',
  TOOLS: 'Tools'
};

// Export item categories for specific components
export const ITEM_CATEGORIES = {
  // Electronics components
  CAPACITORS: 'Capacitors',
  RESISTORS: 'Resistors',
  INDUCTORS: 'Inductors',
  DIODES: 'Diodes',
  TRANSISTORS: 'Transistors',
  INTEGRATED_CIRCUITS: 'Integrated Circuits',
  MICROCONTROLLERS: 'Microcontrollers',
  SENSORS: 'Sensors',
  CONNECTORS: 'Connectors',
  WIRES: 'Wires',
  BATTERIES: 'Batteries',
  SWITCHES: 'Switches',
  RELAYS: 'Relays',
  FUSES: 'Fuses',
  // Mechanical components
  BEARINGS: 'Bearings',
  GEARS: 'Gears',
  SHAFTS: 'Shafts',
  SPRINGS: 'Springs',
  FASTENERS: 'Fasteners',
  // Other
  TOOLS: 'Tools',
  CONSUMABLES: 'Consumables',
  OTHER: 'Other'
};

// Export database types for compatibility
export const DATABASE_TYPE = {
  SQLITE: 'sqlite',
  MEMORY: 'memory'
};

// Export the main database service (connects to Python backend)
export const databaseService = serverDatabaseService;

// Create compatibility auth service that uses API client
export const authService = {
  async getAllUsers() {
    const users = await apiClient.getAllUsers();
    return { success: true, users, message: 'Users retrieved successfully' };
  },
  
  async createUser(userData: any) {
    return await apiClient.createUser(userData);
  },
  
  async deleteUser(userId: number) {
    return await apiClient.deleteUser(userId);
  },
  
  async verifyUserPassword(username: string, password: string) {
    return await apiClient.verifyUserPassword(username, password);
  },
  
  async updateUserPassword(username: string, newPassword: string) {
    return await apiClient.updateUserPassword(username, newPassword);
  },
  
  async verifyAdminPassword(password: string) {
    // For now, return true - implement proper admin verification later
    console.log('🔐 Admin password verification requested');
    void password; // Acknowledge parameter
    return true;
  },
  
  async verifyAdmin(request: any) {
    // Make actual API call to verify admin password
    console.log('🔐 Admin verification requested:', request);
    try {
      return await apiClient.verifyAdmin(request.admin_password);
    } catch (error) {
      console.error('Admin verification error:', error);
      return { success: false, verified: false, message: 'Admin verification failed' };
    }
  },
  
  async simpleLoginUser(request: any) {
    // Use the API client for simple username-based login (no password required)
    console.log('🔐 User login requested:', request);
    try {
      // Get all users and find the matching username
      const users = await apiClient.getAllUsers();
      const user = users.find(u => u.username === request.username);
      
      if (user && user.is_active !== false) {
        return { 
          success: true, 
          message: 'Login successful', 
          user_id: user.user_id || user.id,
          username: user.username,
          subteam: user.subteam
        };
      } else if (user && user.is_active === false) {
        return { success: false, message: 'User account is inactive' };
      } else {
        return { success: false, message: 'User not found' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Failed to connect to server' };
    }
  },
  
  async addUserVerified(userData: any) {
    // Add user with verification (admin function)
    console.log('🔐 Add user verified requested:', userData);
    try {
      const userId = await apiClient.createUser(userData);
      return { success: true, message: 'User created successfully', userId };
    } catch (error) {
      return { success: false, message: 'Failed to create user' };
    }
  }
};

// Create compatibility inventory service  
export const inventoryService = {
  async getAllInventoryItems() {
    return await apiClient.getAllInventoryItems();
  },
  
  async addInventoryItem(item: any) {
    return await apiClient.addInventoryItem(item);
  },
  
  async updateInventoryItem(itemId: number, updates: any) {
    return await apiClient.updateInventoryItem(itemId, updates);
  },
  
  async deleteInventoryItem(itemId: number) {
    return await apiClient.deleteInventoryItem(itemId);
  },
  
  async getInventoryStatistics() {
    return await apiClient.getInventoryStatistics();
  }
};

// Create compatibility file operations service
export const fileOperationsService = {
  async exportData() {
    console.log('🔄 File operations: Export data (using API)');
    // Could implement via API endpoints later
    return { success: true };
  },
  
  async importData() {
    console.log('🔄 File operations: Import data (using API)');
    // Could implement via API endpoints later
    return { success: true };
  }
};

// Initialize backend services function
export async function initializeBackend(): Promise<boolean> {
  try {
    console.log('Initializing TypeScript backend services...');
    await serverDatabaseService.initialize();
    console.log('✅ Backend services initialized successfully');
    return true;
  } catch (error) {
    console.error('🔴 Backend initialization failed:', error);
    return false;
  }
}