// =============================================================================
// DATABASE SERVICE - Universal Frontend API Communication Layer
// =============================================================================
// This service provides a unified interface for frontend components to communicate
// with the TypeScript backend. It automatically handles:
// - TypeScript backend calls (when running in browser)
// - Tauri IPC commands (when running as desktop app - fallback)
// - Error handling and logging
// - Type safety between frontend and backend
//
// IMPORTANT: This service contains NO business logic - all data operations
// are delegated to the TypeScript backend for clean architecture separation.
// =============================================================================

import { invoke } from '@utils/tauri-compat';
import { InventoryItem, InventoryStats } from '@/services';

/**
 * DatabaseService - Frontend API Communication Layer
 * 
 * This class serves as the bridge between React components and the Rust backend.
 * It automatically detects the runtime environment and uses the appropriate
 * communication method (Tauri IPC or HTTP API).
 */
export class DatabaseService {
  
  // =============================================================================
  // ENVIRONMENT DETECTION
  // =============================================================================
  
  /**
   * Check if we're running in a Tauri environment (desktop app)
   * @returns true if running in Tauri, false if running in web browser
   */
  private static isTauriEnvironment(): boolean {
    return typeof window !== 'undefined' && 
           typeof (window as any).__TAURI_INTERNALS__ !== 'undefined';
  }

  // =============================================================================
  // LOCALSTORAGE FALLBACK METHODS
  // =============================================================================

  /**
   * Get inventory items from localStorage
   */
  private static getItemsFromLocalStorage(): InventoryItem[] {
    try {
      const stored = localStorage.getItem('inventory_items');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading inventory items from localStorage:', error);
      return [];
    }
  }

  /**
   * Save inventory items to localStorage
   */
  private static saveItemsToLocalStorage(items: InventoryItem[]): void {
    try {
      localStorage.setItem('inventory_items', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving inventory items to localStorage:', error);
    }
  }

  // =============================================================================
  // HTTP API COMMUNICATION (for web server mode)
  // =============================================================================

  /**
   * Safely invoke Tauri commands with localStorage fallback
   */
  private static async safeInvoke<T>(command: string, args?: any): Promise<T> {
    // Try Tauri first if available
    if (this.isTauriEnvironment()) {
      try {
        console.log(`🔧 Attempting Tauri command: ${command}`);
        return await invoke(command, args) as T;
      } catch (error) {
        console.error(`❌ Tauri command failed: ${command}`, error);
        console.log('📱 Falling back to localStorage...');
      }
    }

    // Fall back to localStorage instead of HTTP API
    console.log(`📱 Using localStorage for: ${command}`);
    switch (command) {
      case 'get_all_inventory_items':
        return this.getItemsFromLocalStorage() as T;
      
      case 'add_inventory_item': {
        const items = this.getItemsFromLocalStorage();
        const maxId = items.length > 0 ? Math.max(...items.map(i => i.item_id || 0)) : 0;
        const newItem = { ...args.item, item_id: maxId + 1, device_id: 'web-demo' };
        
        if (args.replace_duplicates) {
          const existingIndex = items.findIndex(i => i.part_number === args.item.part_number);
          if (existingIndex >= 0) {
            items[existingIndex] = newItem;
          } else {
            items.push(newItem);
          }
        } else {
          items.push(newItem);
        }
        
        this.saveItemsToLocalStorage(items);
        return newItem.item_id as T;
      }
      
      case 'update_inventory_item': {
        const items = this.getItemsFromLocalStorage();
        const itemIndex = items.findIndex(i => i.item_id === args.item.item_id);
        if (itemIndex >= 0) {
          items[itemIndex] = { ...args.item };
          this.saveItemsToLocalStorage(items);
        }
        return true as T;
      }
      
      case 'delete_inventory_item': {
        const items = this.getItemsFromLocalStorage();
        const filteredItems = items.filter(i => i.item_id !== args.item_id);
        this.saveItemsToLocalStorage(filteredItems);
        return true as T;
      }
      
      case 'get_inventory_statistics': {
        const items = this.getItemsFromLocalStorage();
        const stats = {
          total_items: items.length,
          total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
          unique_part_numbers: new Set(items.map(item => item.part_number)).size,
          item_types: Array.from(new Set(
            items
              .map(item => item.item_type)
              .filter(type => type !== null && type !== undefined) as string[]
          ))
        };
        return stats as T;
      }
      
      case 'initialize_database_with_demo_data':
        // For localStorage mode, just return success
        return 'Database initialized in localStorage mode' as T;
      
      default:
        throw new Error(`LocalStorage fallback not implemented for command: ${command}`);
    }
  }

  /**
   * Initialize the database with demo data if empty
   */
  static async initializeDatabase(): Promise<void> {
    try {
      console.log('🔧 Initializing database...');
      await this.safeInvoke<string>('initialize_database_with_demo_data');
      console.log('🎯 Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Get all inventory items
   */
  static async getAllInventoryItems(): Promise<InventoryItem[]> {
    try {
      console.log('🔧 Loading inventory items...');
      const items = await this.safeInvoke<InventoryItem[]>('get_all_inventory_items');
      console.log(`📦 Loaded ${items.length} items`);
      return items;
    } catch (error) {
      console.error('❌ Failed to get inventory items:', error);
      throw new Error(`Failed to get inventory items: ${error}`);
    }
  }

  /**
   * Add a new inventory item
   */
  static async addInventoryItem(item: InventoryItem, replaceDuplicates = false): Promise<number> {
    try {
      console.log('🔧 Attempting to add item via Tauri...');
      const itemId = await this.safeInvoke<number>('add_inventory_item', { 
        item, 
        replace_duplicates: replaceDuplicates 
      });
      console.log(`✅ Added inventory item: ${item.part_number} (ID: ${itemId}) via Tauri`);
      return itemId;
    } catch (error) {
      console.error('❌ Failed to add inventory item via Tauri:', error);
      
      // Only fall back to localStorage if Tauri is completely unavailable
      if (!this.isTauriEnvironment()) {
        console.log('📱 Falling back to localStorage...');
        const stored = localStorage.getItem('inventory_items');
        const items: InventoryItem[] = stored ? JSON.parse(stored) : [];
        
        // Generate new ID
        const maxId = items.length > 0 ? Math.max(...items.map(i => i.item_id || 0)) : 0;
        const newItem = { ...item, item_id: maxId + 1, device_id: 'web-demo' };
        
        if (replaceDuplicates) {
          const existingIndex = items.findIndex(i => i.part_number === item.part_number);
          if (existingIndex >= 0) {
            items[existingIndex] = newItem;
          } else {
            items.push(newItem);
          }
        } else {
          items.push(newItem);
        }
        
        localStorage.setItem('inventory_items', JSON.stringify(items));
        console.log(`✅ Added inventory item: ${item.part_number} (ID: ${newItem.item_id}) - localStorage fallback`);
        return newItem.item_id!;
      } else {
        console.error('🚨 Tauri is available but failed to add item');
        throw new Error(`Failed to add item: ${error}`);
      }
    }
  }

  /**
   * Update an existing inventory item
   */
  static async updateInventoryItem(item: InventoryItem): Promise<void> {
    try {
      if (!this.isTauriEnvironment()) {
        // Web environment - use localStorage
        const stored = localStorage.getItem('inventory_items');
        const items: InventoryItem[] = stored ? JSON.parse(stored) : [];
        
        const index = items.findIndex(i => i.item_id === item.item_id);
        if (index >= 0) {
          items[index] = { ...item, device_id: 'web-demo' };
          localStorage.setItem('inventory_items', JSON.stringify(items));
          console.log(`✅ Updated inventory item: ${item.part_number} - web storage`);
        } else {
          throw new Error(`Item with ID ${item.item_id} not found`);
        }
        return;
      }
      
      await this.safeInvoke('update_inventory_item', { item });
      console.log(`✅ Updated inventory item: ${item.part_number}`);
    } catch (error) {
      console.error('❌ Failed to update inventory item:', error);
      throw new Error(`Failed to update item: ${error}`);
    }
  }

  /**
   * Delete an inventory item
   */
  static async deleteInventoryItem(itemId: number): Promise<boolean> {
    try {
      console.log('🔧 Attempting to delete item via Tauri...');
      await this.safeInvoke('delete_inventory_item', { item_id: itemId });
      console.log(`🗑️ Deleted inventory item with ID: ${itemId} via Tauri`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete inventory item via Tauri:', error);
      
      // Only fall back to localStorage if Tauri is completely unavailable
      if (!this.isTauriEnvironment()) {
        console.log('📱 Falling back to localStorage...');
        const stored = localStorage.getItem('inventory_items');
        const items: InventoryItem[] = stored ? JSON.parse(stored) : [];
        
        const index = items.findIndex(i => i.item_id === itemId);
        if (index >= 0) {
          items.splice(index, 1);
          localStorage.setItem('inventory_items', JSON.stringify(items));
          console.log(`🗑️ Deleted inventory item with ID: ${itemId} - localStorage fallback`);
          return true;
        } else {
          throw new Error(`Item with ID ${itemId} not found`);
        }
      } else {
        console.error('� Tauri is available but failed to delete item');
        throw new Error(`Failed to delete item: ${error}`);
      }
    }
  }

  /**
   * Update a single field of an inventory item
   */
  static async updateInventoryItemField(
    itemId: number, 
    fieldName: string, 
    newValue: string
  ): Promise<boolean> {
    try {
      // Get the current item first
      const items = await this.getAllInventoryItems();
      const item = items.find(i => i.item_id === itemId);
      
      if (!item) {
        throw new Error(`Item with ID ${itemId} not found`);
      }

      // Update the specific field
      const updatedItem = { ...item, [fieldName]: newValue };
      await this.updateInventoryItem(updatedItem);
      
      console.log(`✏️ Updated ${fieldName} for item ID ${itemId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to update inventory item field:', error);
      throw new Error(`Failed to update item field: ${error}`);
    }
  }

  /**
   * Get inventory statistics
   */
  static async getInventoryStatistics(): Promise<InventoryStats> {
    try {
      if (!this.isTauriEnvironment()) {
        // Web environment - calculate from localStorage
        const items = await this.getAllInventoryItems();
        const uniqueTypes = [...new Set(items.map(i => i.item_type).filter((type): type is string => Boolean(type)))];
        
        const stats = {
          total_items: items.length,
          total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
          unique_part_numbers: new Set(items.map(i => i.part_number)).size,
          item_types: uniqueTypes,
          categories: {},
          recent_additions: []
        };
        console.log(`📊 Retrieved inventory statistics: ${stats.total_items} items - web storage`);
        return stats;
      }
      
      const stats = await this.safeInvoke<any>('get_inventory_statistics');
      console.log(`📊 Retrieved inventory statistics: ${stats.total_items} items`);
      return {
        total_items: stats.total_items,
        total_quantity: stats.total_quantity,
        unique_part_numbers: stats.unique_part_numbers,
        item_types: stats.item_types,
        categories: {},
        recent_additions: []
      };
    } catch (error) {
      console.error('❌ Failed to get inventory statistics:', error);
      throw new Error(`Failed to get statistics: ${error}`);
    }
  }

  /**
   * Search inventory items
   */
  static async searchInventoryItems(searchTerm: string): Promise<InventoryItem[]> {
    try {
      if (!searchTerm.trim()) {
        return await this.getAllInventoryItems();
      }
      
      // For now, we'll do client-side filtering since the Rust backend doesn't have a search command
      // In the future, we could add a search command to the Rust backend for better performance
      const allItems = await this.getAllInventoryItems();
      const searchLower = searchTerm.trim().toLowerCase();
      
      const matchingItems = allItems.filter(item => 
        item.part_number?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.item_type?.toLowerCase().includes(searchLower) ||
        item.company?.toLowerCase().includes(searchLower) ||
        item.systems?.toLowerCase().includes(searchLower)
      );
      
      console.log(`🔍 Found ${matchingItems.length} items matching "${searchTerm}"`);
      return matchingItems;
    } catch (error) {
      console.error('❌ Failed to search inventory items:', error);
      throw new Error(`Failed to search items: ${error}`);
    }
  }

  /**
   * Get autocomplete suggestions
   */
  static async getAutocompleteSuggestions(input: string, field: string = 'part_number'): Promise<string[]> {
    try {
      if (!input.trim()) {
        return [];
      }
      
      if (!this.isTauriEnvironment()) {
        // Web environment - simple client-side suggestions
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
      }
      
      const suggestions = await this.safeInvoke<string[]>('get_autocomplete_suggestions', {
        input: input.trim(),
        field: field
      });
      
      return suggestions;
    } catch (error) {
      console.error('❌ Failed to get autocomplete suggestions:', error);
      return []; // Return empty array on error instead of throwing
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get database status (for debugging)
   */
  static async getDatabaseStatus(): Promise<any> {
    try {
      if (!this.isTauriEnvironment()) {
        const items = await this.getAllInventoryItems();
        return {
          platform: 'web',
          storage: 'localStorage',
          status: 'connected',
          item_count: items.length
        };
      }
      
      const result = await this.safeInvoke<any>('get_database_status');
      return {
        platform: 'native',
        storage: 'SQLite',
        ...result
      };
    } catch (error) {
      throw new Error(`Failed to get database status: ${error}`);
    }
  }

  /**
   * Formats a date string for display
   */
  static formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }

  /**
   * Formats a number with thousands separators
   */
  static formatNumber(number: number): string {
    return number.toLocaleString();
  }

  /**
   * Creates a display name for an inventory item
   */
  static createDisplayName(item: InventoryItem): string {
    if (item.item_type && item.description) {
      return `${item.item_type} - ${item.description}`;
    } else if (item.item_type) {
      return item.item_type;
    } else if (item.description) {
      return item.description;
    } else {
      return item.part_number || 'Unknown Part';
    }
  }

  /**
   * Checks if an item is low on stock
   */
  static isLowStock(item: InventoryItem, threshold: number = 5): boolean {
    return item.quantity <= threshold && item.quantity >= 0;
  }

  /**
   * Checks if an item is out of stock
   */
  static isOutOfStock(item: InventoryItem): boolean {
    return item.quantity <= 0;
  }

  /**
   * Filters items by item type
   */
  static filterByType(items: InventoryItem[], itemType: string): InventoryItem[] {
    return items.filter(item => 
      item.item_type?.toLowerCase().includes(itemType.toLowerCase())
    );
  }

  /**
   * Sorts items by a specific field
   */
  static sortItems(
    items: InventoryItem[], 
    field: keyof InventoryItem, 
    ascending: boolean = true
  ): InventoryItem[] {
    return [...items].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === null && bVal === null) return 0;
      if (aVal === undefined || aVal === null) return ascending ? 1 : -1;
      if (bVal === undefined || bVal === null) return ascending ? -1 : 1;
      
      if (aVal < bVal) return ascending ? -1 : 1;
      if (aVal > bVal) return ascending ? 1 : -1;
      return 0;
    });
  }
}

