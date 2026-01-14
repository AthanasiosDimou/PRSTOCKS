# Themes Directory Structure

This directory contains all theme-related functionality for the PRSTOCKS application. The structure is organized for maintainability and ease of use.

## 📁 Directory Structure

```
src/themes/
├── index.ts                    # Main export file - import everything from here
├── components/                 # React components for theme functionality
│   ├── index.ts               # Components export file
│   ├── ThemeProvider.tsx      # Theme context provider
│   ├── ThemeDrawer.tsx        # Theme selection drawer
│   ├── ThemeDrawer.css        # Styles for theme drawer
│   ├── ThemeButton.tsx        # Theme toggle button
│   └── ThemeButton.css        # Styles for theme button
└── theme_utils/               # Utility functions and definitions
    ├── index.ts               # Utils export file
    ├── theme_definitions.ts   # Theme definitions and core utilities
    └── theme_helpers.ts       # Additional helper functions
```

## 🎨 Available Themes

The application comes with these predefined themes:

- **Light Mode** ☀️ - Clean and bright theme for daytime use
- **Dark Mode** 🌙 - Easy on the eyes for nighttime coding
- **Ocean Blue** 🌊 - Calming blue tones like deep ocean waters
- **Forest Green** 🌲 - Natural green tones like a peaceful forest
- **Sunset Orange** 🌅 - Warm sunset colors for a cozy feeling
- **Royal Purple** 👑 - Rich purple tones for creative minds

## 🚀 Quick Start

### Basic Usage

```tsx
import { ThemeProvider, useTheme, ThemeDrawer, ThemeButton } from './themes';

// Wrap your app with ThemeProvider
function App() {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
}

// Use themes in components
function MainContent() {
  const { currentTheme, setTheme, isDark } = useTheme();
  
  return (
    <div>
      <h1>Current theme: {currentTheme.name}</h1>
      <ThemeButton onClick={() => {/* open drawer */}} />
    </div>
  );
}
```

### Theme Drawer

```tsx
function MyComponent() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  return (
    <>
      <ThemeButton onClick={() => setIsDrawerOpen(true)} />
      
      <ThemeDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onThemeChange={(theme) => console.log('Theme changed:', theme.name)}
      />
    </>
  );
}
```

## 🛠️ Theme Utilities

### Core Functions

```tsx
import { 
  getThemeById, 
  applyThemeToCSS, 
  detectSystemTheme,
  createCustomTheme 
} from './themes';

// Get a specific theme
const darkTheme = getThemeById('dark');

// Apply theme to CSS variables
applyThemeToCSS(darkTheme);

// Detect user's system preference
const systemPreference = detectSystemTheme(); // 'dark' | 'light'

// Create a custom theme
const myTheme = createCustomTheme(
  darkTheme, 
  { primary: '#FF6B6B' },
  'My Custom Theme'
);
```

### Color Manipulation

```tsx
import { 
  lightenColor, 
  darkenColor, 
  adjustColorOpacity,
  getContrastColor 
} from './themes';

// Lighten a color by 20%
const lightBlue = lightenColor('#007ACC', 20);

// Darken a color by 15%
const darkBlue = darkenColor('#007ACC', 15);

// Add transparency
const transparentBlue = adjustColorOpacity('#007ACC', 0.5);

// Get contrasting text color
const textColor = getContrastColor('#007ACC'); // '#FFFFFF' or '#000000'
```

### Theme Validation

```tsx
import { validateTheme, analyzeThemeAccessibility } from './themes';

// Validate theme structure
const errors = validateTheme(myCustomTheme);
if (errors.length > 0) {
  console.error('Theme validation failed:', errors);
}

// Check accessibility compliance
const accessibility = analyzeThemeAccessibility(myTheme);
console.log('WCAG AA compliant:', accessibility.wcagAA);
console.log('Issues:', accessibility.issues);
```

## 🎯 CSS Custom Properties

Themes automatically set CSS custom properties that you can use in your stylesheets:

```css
.my-component {
  background: var(--theme-surface);
  color: var(--theme-onSurface);
  border: 1px solid var(--theme-border);
  
  /* Hover effects */
  transition: all 0.2s ease;
}

.my-component:hover {
  background: var(--theme-hover);
  border-color: var(--theme-primary);
}

/* Primary button */
.primary-button {
  background: var(--theme-primary);
  color: var(--theme-onPrimary);
}

/* Status colors */
.success { color: var(--theme-success); }
.warning { color: var(--theme-warning); }
.error { color: var(--theme-error); }
.info { color: var(--theme-info); }
```

## 📱 Component API Reference

### ThemeProvider

```tsx
interface ThemeProviderProps {
  children: ReactNode;
}
```

### useTheme Hook

```tsx
interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleTheme: () => void;
}
```

### ThemeDrawer

```tsx
interface ThemeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange?: (theme: Theme) => void;
}
```

### ThemeButton

```tsx
interface ThemeButtonProps {
  onClick: () => void;
  className?: string;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}
```

## 🔧 Creating Custom Themes

```tsx
import { Theme, createValidatedTheme } from './themes';

const myCustomTheme: Theme = createValidatedTheme({
  id: 'cyberpunk',
  name: 'Cyberpunk',
  description: 'Neon colors for a futuristic feel',
  isDark: true,
  colors: {
    primary: '#00FFFF',
    secondary: '#FF00FF',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    // ... other required colors
  }
});

// Add to available themes
availableThemes.push(myCustomTheme);
```

## 🎨 Color Palette Guidelines

When creating custom themes, follow these guidelines:

1. **Contrast Ratio**: Ensure text meets WCAG AA standards (4.5:1 minimum)
2. **Semantic Colors**: Use meaningful names for your color variables
3. **State Colors**: Include hover, active, and disabled states
4. **Status Colors**: Provide consistent success, warning, error, and info colors

## 🚦 Best Practices

1. **Import from Index**: Always import from `./themes` for consistency
2. **Use CSS Variables**: Prefer CSS custom properties over hardcoded colors
3. **Theme Validation**: Validate custom themes before using them
4. **Accessibility**: Test themes with accessibility tools
5. **Performance**: Use `React.memo` for theme-dependent components

## 🔍 Debugging

```tsx
import { generateThemeSummary } from './themes';

// Generate a detailed theme summary
console.log(generateThemeSummary(currentTheme));
```

## 📦 Dependencies

- **React**: Context API for theme state management
- **CSS Custom Properties**: For dynamic styling
- **TypeScript**: Type safety for theme definitions

## 🤝 Contributing

When adding new themes or utilities:

1. Follow the existing naming conventions
2. Add comprehensive TypeScript types
3. Include accessibility validation
4. Add documentation and examples
5. Test with all existing components
