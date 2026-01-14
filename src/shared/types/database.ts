import { InventoryItem as ServiceInventoryItem, InventoryStats as ServiceInventoryStats } from '@/services';

// =============================================================================
// DATABASE TYPES - Re-export service types for compatibility
// =============================================================================

// Re-export the service types for compatibility
export type InventoryItem = ServiceInventoryItem;
export type InventoryStats = ServiceInventoryStats;

// =============================================================================
// USER DATA INTERFACE
// =============================================================================
export interface UserData {
  user_id: number;
  username: string;
  subteam: string;
  role?: 'admin' | 'user';
  password?: string;
  is_active?: boolean;
}

// =============================================================================
// USER PREFERENCES INTERFACE
// =============================================================================
// This describes user preferences including themes
export interface UserPreferences {
  user_id: string;
  username?: string;
  selected_theme: string;
  last_active: string;
  created_at: string;
  settings?: string;
}

// =============================================================================
// USER SESSION INTERFACE
// =============================================================================
// This describes user session data
export interface UserSession {
  user_id: string;
  session_token: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

// =============================================================================
// FORM DATA INTERFACE
// =============================================================================
// This describes the data from our input form
// All fields are strings initially (we convert numbers later)
export interface InventoryFormData {
  part_number: string;
  quantity: string;        // String because it comes from an input field
  item_type: string;
  description: string;
  systems: string;
  case_code_in: string;
  size: string;
  link: string;
  company: string;
  notes: string;
  category: string;        // Category field for Electronics/Admin classification
}

// =============================================================================
// SEARCH AND FILTER OPTIONS
// =============================================================================
// Options for searching and filtering the inventory
export interface SearchOptions {
  // What text to search for
  search_term: string;
  
  // Maximum number of results to return
  max_results?: number;
}

// =============================================================================
// TABLE COLUMN CONFIGURATION
// =============================================================================
// Configuration for displaying inventory in a table
export interface TableColumn {
  // Which field this column shows
  id: keyof InventoryItem;
  
  // Display name for the column header
  label: string;
  
  // Width of the column in pixels
  width?: number;
  
  // Whether users can sort by this column
  sortable?: boolean;
  
  // Whether users can edit this column directly
  editable?: boolean;
  
  // Whether this column is visible by default
  visible?: boolean;
}

// =============================================================================
// THEME CONFIGURATION
// =============================================================================
// Types for theme management
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  mode: ThemeMode;
  name: string;
  primary_color: string;
  background_color: string;
  text_color: string;
}

// =============================================================================
// STATUS MESSAGES
// =============================================================================
// For showing success/error messages to users
export interface StatusMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;        // How long to show the message (milliseconds)
  timestamp: number;        // When the message was created
}

// =============================================================================
// FILE IMPORT/EXPORT TYPES
// =============================================================================
export type FileType = 'csv' | 'xlsx' | 'json';

export interface ImportResult {
  success: boolean;
  items_imported: number;
  errors: string[];
}

export interface ExportOptions {
  file_type: FileType;
  include_all_fields: boolean;
  file_name?: string;
}

// =============================================================================
// APPLICATION STATE TYPES
// =============================================================================
// These describe the overall state of our application
export interface AppState {
  // Current inventory items
  inventory: InventoryItem[];
  
  // Statistics about the inventory
  stats: InventoryStats | null;
  
  // Current search/filter settings
  search_options: SearchOptions;
  
  // Loading states
  loading: {
    inventory: boolean;
    stats: boolean;
    search: boolean;
  };
  
  // Error states
  errors: {
    inventory: string | null;
    stats: string | null;
    search: string | null;
  };
  
  // Status messages to show user
  status_messages: StatusMessage[];
  
  // Current theme
  theme: ThemeConfig;
  
  // UI state
  ui: {
    drawer_open: boolean;
    selected_items: number[];
    sort_column: keyof InventoryItem | null;
    sort_direction: 'asc' | 'desc';
  };
}

// =============================================================================
// HELPER TYPE FUNCTIONS
// =============================================================================

// Helper function to get device ID using the robust DeviceIdentityService
// This is now a placeholder that will be replaced by proper async calls
function getDeviceId(): string {
  // This is a synchronous fallback - the proper way is to use DeviceIdentityService
  // For new code, use DeviceIdentityService.getOrCreateDeviceIdentity() instead
  if (typeof window !== 'undefined' && window.localStorage) {
    const cachedId = localStorage.getItem('prstocks_device_cache');
    if (cachedId) {
      return cachedId;
    }
    
    // Legacy fallback
    const legacyId = localStorage.getItem('device_id') || localStorage.getItem('prstocks-device-id');
    if (legacyId) {
      return legacyId;
    }
    
    // Ultimate fallback for synchronous contexts
    const fallbackId = 'temp_device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('prstocks_device_cache', fallbackId);
    console.warn('⚠️ Using synchronous fallback device ID. Use DeviceIdentityService for proper device identification.');
    return fallbackId;
  }
  // Fallback for server-side or when localStorage is not available
  return 'unknown_device';
}

// Creates an empty inventory item with default values
export function createEmptyInventoryItem(): InventoryItem {
  return {
    part_number: '',
    quantity: 0,
    item_type: '',
    description: '',
    systems: '',
    case_code_in: '',
    notes: '',
    size: '',
    link: '',
    company: '',
    device_id: getDeviceId(),
  };
}

// Creates empty form data
export function createEmptyFormData(): InventoryFormData {
  return {
    part_number: '',
    quantity: '1',
    item_type: '',
    description: '',
    systems: '',
    case_code_in: '',
    size: '',
    link: '',
    company: '',
    notes: '',
    category: '', // Start empty for manual entry
  };
}

// Converts form data to inventory item
export function formDataToInventoryItem(formData: InventoryFormData): InventoryItem {
  return {
    part_number: formData.part_number.trim(),
    quantity: parseInt(formData.quantity) || 0,
    item_type: formData.item_type.trim() || undefined,
    description: formData.description.trim() || undefined,
    systems: formData.systems.trim() || undefined,
    case_code_in: formData.case_code_in.trim() || undefined,
    size: formData.size.trim() || undefined,
    link: formData.link.trim() || undefined,
    company: formData.company.trim() || undefined,
    notes: formData.notes.trim() || undefined,
    category: formData.category.trim() || 'Uncategorized', // Default to Uncategorized if empty
    device_id: getDeviceId(),
  };
}

// Validates inventory item data
export function validateInventoryItem(item: InventoryItem): string[] {
  const errors: string[] = [];
  
  if (!item.part_number?.trim()) {
    errors.push('Part number is required');
  }
  
  if (typeof item.quantity !== 'number' || isNaN(item.quantity)) {
    errors.push('Quantity must be a valid number');
  }
  
  if (item.quantity < -9999 || item.quantity > 999999) {
    errors.push('Quantity must be between -9999 and 999999');
  }
  
  return errors;
}
