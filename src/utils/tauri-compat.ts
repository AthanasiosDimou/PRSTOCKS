// =============================================================================
// SIMPLIFIED SERVICE LAYER - API CLIENT COMPATIBILITY
// =============================================================================
// This module provides compatibility with the old invoke system using the new API client

import { databaseService } from '../services/index';

// =============================================================================
// INVOKE REPLACEMENT FOR API CLIENT
// =============================================================================

export async function invoke(command: string, args?: any): Promise<any> {
    try {
        console.log(`🔧 API invoke: ${command}`, args || {});
        
        switch (command) {
            // User management
            case 'create_user':
                return await databaseService.createUser(args);
                
            case 'get_all_users':
                return await databaseService.getAllUsers();
                
            case 'delete_user':
                return await databaseService.deleteUser(args.userId);
                
            case 'verify_user_password':
                return await databaseService.verifyUserPassword(args.username, args.password);
                
            case 'update_user_password':
                return await databaseService.updateUserPassword(args.username, args.newPassword);
                
            // Inventory management
            case 'get_all_inventory_items':
                return await databaseService.getAllInventoryItems();
                
            case 'add_inventory_item':
                return await databaseService.addInventoryItem(args);
                
            case 'update_inventory_item':
                return await databaseService.updateInventoryItem(args.itemId, args.updates);
                
            case 'delete_inventory_item':
                return await databaseService.deleteInventoryItem(args.itemId);
                
            case 'get_inventory_statistics':
                return await databaseService.getInventoryStatistics();
                
            // Device preferences - now using server database service
            case 'get_device_preferences':
                return await databaseService.getUserPreferences(args.username || args.deviceId);
                
            case 'save_device_preferences':
                return await databaseService.saveUserPreferences(args.username || args.deviceId, args.preferences);
                
            // Admin functions
            case 'verify_admin_password':
                // For now, return true - implement proper admin verification later
                console.log('🔐 Admin verification requested');
                return true;
                
            case 'clear_all_data':
                return await databaseService.clearAllData();
                
            default:
                console.warn(`🔴 Unknown command: ${command}`);
                throw new Error(`Unknown command: ${command}`);
        }
    } catch (error) {
        console.error(`🔴 API invoke error [${command}]:`, error);
        throw error;
    }
}

// Compatibility functions
export async function listen(event: string, handler: (event: any) => void): Promise<void> {
    console.log(`🔔 Listen event: ${event} (compatibility mode - no events)`);
    // No-op for compatibility - prevents unused parameter warning
    void handler;
}

export async function emit(event: string, payload?: any): Promise<void> {
    console.log(`📡 Emit event: ${event}`, payload);
    // No-op for compatibility
}