// =============================================================================
// PREFERENCES SERVICES INDEX
// =============================================================================
// Centralized exports for all preference-related services

export { 
  CrossDevicePreferencesService, 
  DualDatabasePreferencesService // Backward compatibility alias
} from './CrossDevicePreferencesService';

export type { UserPreferences } from './CrossDevicePreferencesService';