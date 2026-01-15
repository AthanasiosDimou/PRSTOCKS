# PRSTOCKS Inventory Management - Architecture Documentation

## 📊 System Architecture Overview

```mermaid
graph TB
    subgraph "🖥️ Frontend (React/TypeScript)"
        A[App.tsx] --> B[AuthWrapper.tsx]
        B --> C[StockManagementApp.tsx]
        
        subgraph "🎨 Theme System"
            T1[DualThemeProvider] --> T2[Theme Definitions]
            T1 --> T3[Theme Components]
        end
        
        subgraph "📱 Core Features"
            F1[Inventory Management]
            F2[User Authentication]
            F3[File Operations]
            F4[Settings & Preferences]
            F5[Database Inspection]
        end
        
        subgraph "🔧 Services Layer"
            S1[API Client] --> S2[Server Database Service]
            S3[Dual Database Preferences] --> S2
            S4[Theme Services] --> S3
        end
        
        C --> F1
        C --> F2
        C --> F3
        C --> F4
        C --> F5
        
        F1 --> S1
        F2 --> S1
        F3 --> S1
        F4 --> S3
        T1 --> S4
    end
    
    subgraph "🌐 Backend (Python FastAPI)"
        API[FastAPI Server] --> DB1[(SQLite - Inventory)]
        API --> DB2[(SQLite - Users)]
        API --> DB3[(SQLite - Preferences)]
        
        API --> R1[Inventory Router]
        API --> R2[Users Router]
        API --> R3[Preferences Router]
        
        R1 --> M1[Inventory Models]
        R2 --> M2[User Models]
        R3 --> M3[Preferences Models]
    end
    
    S1 -.->|HTTP/REST| API
    S2 -.->|HTTP/REST| API
```

## 🏗️ Directory Structure Analysis

```mermaid
graph LR
    subgraph "📁 Current Structure Issues"
        A[src/shared/themes/] --> A1[DualThemeProvider ❌]
        A --> A2[theme_definitions.ts]
        A --> A3[theme_utils/ ❌ Duplicate]
        
        B[src/shared/services/] --> B1[DualDatabasePreferencesService ❌]
        
        C[src/features/settings/] --> C1[DualSettingsPage ❌]
        
        D[Problems:]
        D --> D1["'Dual' prefix unclear"]
        D --> D2[Duplicate theme files]
        D --> D3[Mixed responsibilities]
    end
```

## 🔄 Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant TP as ThemeProvider
    participant PS as PreferencesService
    participant API as API Client
    participant BE as Backend
    participant DB as Database
    
    Note over U,DB: Theme Sync Flow
    U->>C: Change Theme
    C->>TP: Update Theme
    TP->>PS: Save Preference
    PS->>API: HTTP Request
    API->>BE: POST /preferences
    BE->>DB: Store Preference
    DB-->>BE: Confirm Save
    BE-->>API: Success Response
    API-->>PS: Theme Saved
    PS-->>TP: Sync Complete
    TP-->>C: UI Updated
    
    Note over U,DB: Inventory Operations
    U->>C: Add/Edit Item
    C->>API: CRUD Request
    API->>BE: HTTP Request
    BE->>DB: SQL Operation
    DB-->>BE: Result
    BE-->>API: Response
    API-->>C: Update UI
```

## 🎯 Component Responsibilities

```mermaid
graph TD
    subgraph "🎨 Theme Management"
        TM1[ThemeProvider] --> TM2[Theme Persistence]
        TM1 --> TM3[CSS Application]
        TM1 --> TM4[User Preferences]
    end
    
    subgraph "📦 Inventory Features"
        I1[InventoryTable] --> I2[CRUD Operations]
        I1 --> I3[Column Management]
        I1 --> I4[Drag & Drop]
        
        I5[InventoryForm] --> I6[Data Validation]
        I5 --> I7[Category Selection]
    end
    
    subgraph "👤 User Management"
        U1[Authentication] --> U2[Login/Logout]
        U1 --> U3[Admin Verification]
        U1 --> U4[User Preferences]
    end
    
    subgraph "📄 File Operations"
        F1[Export Functions] --> F2[CSV Export]
        F1 --> F3[Excel Export]
        F1 --> F4[Database Export]
        
        F5[Import Functions ❌] --> F6[Disabled as requested]
    end
```

## 🔧 Service Architecture

```mermaid
graph TB
    subgraph "🌐 API Layer"
        API[ApiClient] --> HTTP[HTTP Methods]
        HTTP --> AUTH[Authentication]
        HTTP --> CRUD[CRUD Operations]
        HTTP --> EXPORT[Export Functions]
    end
    
    subgraph "🗃️ Database Services"
        DBS[ServerDatabaseService] --> LOCAL[Local Operations]
        DBS --> REMOTE[Remote Sync]
        
        PREFS[PreferencesService] --> THEME[Theme Storage]
        PREFS --> USER[User Settings]
        PREFS --> DEVICE[Device Specific]
    end
    
    subgraph "🎨 Theme Services"
        TS[ThemeService] --> APPLY[CSS Application]
        TS --> PERSIST[Persistence]
        TS --> SYNC[Cross-Device Sync]
    end
    
    API --> DBS
    DBS --> PREFS
    PREFS --> TS
```

## 🚨 Current Issues & Proposed Fixes

### Issue 1: Confusing "Dual" Naming
**Problem:** Files with "Dual" prefix are unclear
- `DualThemeProvider` → What makes it "dual"?
- `DualDatabasePreferencesService` → Confusing purpose
- `DualSettingsPage` → Redundant naming

**Solution:** Rename to be more descriptive:
- `DualThemeProvider` → `MultiDeviceThemeProvider`
- `DualDatabasePreferencesService` → `CrossDevicePreferencesService`
- `DualSettingsPage` → `DeviceSettingsPage`

### Issue 2: Duplicate Theme Files
**Problem:** 
- `/themes/theme_definitions.ts`
- `/themes/theme_utils/theme_definitions.ts`

**Solution:** Consolidate into single source of truth

### Issue 3: Mixed Service Responsibilities
**Problem:** Services mixing theme, preferences, and database concerns

**Solution:** Clear separation:
```
src/shared/
├── services/
│   ├── preferences/
│   │   ├── CrossDevicePreferencesService.ts
│   │   └── ThemePreferencesService.ts
│   ├── database/
│   │   └── ServerDatabaseService.ts
│   └── api/
│       └── ApiClient.ts
```

## 📱 Mobile Responsiveness Architecture

```mermaid
graph LR
    subgraph "📱 Responsive Design"
        MD[Media Queries] --> M1[@media max-width: 480px]
        MD --> M2[@media max-width: 768px]
        MD --> M3[@media max-width: 1024px]
        
        RD[Responsive Components] --> RD1[Fixed Header]
        RD --> RD2[Collapsible Navigation]
        RD --> RD3[Touch-Friendly Forms]
        RD --> RD4[Optimized Tables]
    end
```

## 🔮 Future Architecture Improvements

1. **Service Layer Refactoring**
   - Split monolithic services
   - Implement dependency injection
   - Add proper error boundaries

2. **State Management**
   - Consider Redux/Zustand for complex state
   - Implement proper data caching
   - Add optimistic updates

3. **Performance Optimization**
   - Implement code splitting
   - Add lazy loading for routes
   - Optimize bundle size

4. **Testing Strategy**
   - Unit tests for services
   - Integration tests for APIs
   - E2E tests for critical flows

---

*Generated: October 2, 2025*
*Last Updated: After mobile responsiveness and export/import fixes*