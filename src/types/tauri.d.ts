// =============================================================================
// TAURI TYPE DECLARATIONS
// =============================================================================
// TypeScript declarations for Tauri-specific global properties

interface Window {
  __TAURI__: {
    // Add Tauri-specific properties here as needed
    [key: string]: any;
  };
  __TAURI_INTERNALS__: {
    // Add Tauri internal properties here as needed  
    [key: string]: any;
  };
}

declare global {
  interface Window {
    __TAURI__: {
      [key: string]: any;
    };
    __TAURI_INTERNALS__: {
      [key: string]: any;
    };
  }
}

export {};
