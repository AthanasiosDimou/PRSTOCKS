// =============================================================================
// MAIN APPLICATION COMPONENT
// =============================================================================
// This is the root component of our PRSTOCKS inventory management application

import React from "react";
import AuthWrapper from "./AuthWrapper";
import "./App.css";

// =============================================================================
// ERROR BOUNDARY FOR BETTER ERROR HANDLING
// =============================================================================
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#1a1a1a', 
          color: 'white', 
          minHeight: '100vh',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1>PRSTOCKS - Error</h1>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#ff4444', 
            borderRadius: '5px',
            margin: '20px 0'
          }}>
            <h2>Something went wrong:</h2>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#666', 
                color: 'white', 
                border: 'none', 
                borderRadius: '3px', 
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// MAIN APP COMPONENT (with error handling)
// =============================================================================
function App() {
  // Debug mode - show SQLite demo directly for testing
  const isDebugMode = window.location.search.includes('debug=sqlite');
  
  if (isDebugMode) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>🔧 Debug Mode: SQLite Testing</h2>
          <p>URL parameter detected: <code>?debug=sqlite</code></p>
          <p>This bypasses the normal app flow to test SQLite directly.</p>
          <p>Debug component removed - check browser console for database logs.</p>
          <a href="/" style={{ color: '#007bff' }}>← Back to normal app</a>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <AuthWrapper />
    </ErrorBoundary>
  );
}

export default App;
