
import React, { useState, useCallback } from 'react';
import Login from './components/Login';
import AdminVerification from './components/AdminVerification';
import UserManagement from '../settings/UserManagement';
import './index.css';

interface LoginAppProps {
  onLoginSuccess?: (userData: any) => void;
  onUserAddSuccess?: (userData: any) => void;
  onRegisterSuccess?: (userData: any) => void;
}

const App: React.FC<LoginAppProps> = ({ onLoginSuccess, onUserAddSuccess: _onUserAddSuccess }) => {
  const [currentView, setCurrentView] = useState<'login' | 'admin-verification' | 'user-management'>('login');

  const goToAdminVerification = useCallback(() => {
    setCurrentView('admin-verification');
  }, []);

  const goToUserManagement = useCallback(() => {
    setCurrentView('user-management');
  }, []);

  const backToLogin = useCallback(() => {
    setCurrentView('login');
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      padding: '1rem',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      position: 'relative'
    }}>
      {/* Background logo - much more subtle */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60%',
        height: '60%',
        opacity: 0.03,
        zIndex: 0,
        color: '#853405ff',
        pointerEvents: 'none'
      }}>
        <svg viewBox="0 0 242.6 248.7" style={{ width: '100%', height: '100%' }}>
          <path fill="currentColor" d="M47.6,42.4l26.3-6.2c0,0-47.1,33.4-13.1,91.5c0,0,14.4,24.4,49.4,29.9l6-71h-6.6L122.3,58l13.6,28.1l-7.1,0.1
            l7.1,71.3c0,0,50.4-7.5,59.7-60.6c0,0,3.4-32-16.9-51.7l-20.5-24.4l46.8,3.4L193,37.6c0,0,35.2,47.3,27.2,81.2l7.4,3.9
            c0,0-3.7,22.5-9,30.4l-11.9-7.5l-6.2,8l11.4,10.7c0,0-12.2,17.8-20.7,23l-11.9-15.9l-7.1,4.3l8.1,19.2c0,0-15.2,10.9-31.3,13.3
            l-5.5-22.1l-4.1,0.6l4.6,41.2H104l3.7-40.7l-4.3-0.4l-5.1,22.5c0,0-24-5-33.3-12.8l9.9-18.7l-11.4-6.5L50.8,187
            c0,0-17-14.6-20.5-22.5l11.8-11.4l-8-10.7l-11.8,7c0,0-7-15.4-7.2-24.1l8.6-2.7C23.8,122.3,19.6,73.7,47.6,42.4z"/>
        </svg>
      </div>
       <div style={{ width: '100%', maxWidth: '28rem', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: '700',
              letterSpacing: '-0.025em',
              color: '#ffffff',
              marginBottom: '1rem'
            }}>
                Welcome to the PRStocks
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: '#94a3b8'
            }}>
                {currentView === 'login' ? 'Sign in to your account' : 
                 currentView === 'admin-verification' ? 'Admin verification required' : 
                 'Manage users'}
            </p>
        </div>
        
        <div style={{ position: 'relative', minHeight: '500px' }}>
            {/* Login View */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transition: 'opacity 300ms ease-in-out',
              opacity: currentView === 'login' ? 1 : 0,
              visibility: currentView === 'login' ? 'visible' : 'hidden'
            }}>
              <Login 
                isActive={currentView === 'login'}
                onToggleView={goToAdminVerification} 
                onLoginSuccess={onLoginSuccess}
              />
            </div>
            
            {/* Admin Verification View */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transition: 'opacity 300ms ease-in-out',
              opacity: currentView === 'admin-verification' ? 1 : 0,
              visibility: currentView === 'admin-verification' ? 'visible' : 'hidden'
            }}>
              <AdminVerification 
                isActive={currentView === 'admin-verification'}
                onVerificationSuccess={goToUserManagement}
                onBackToLogin={backToLogin}
              />
            </div>
            
            {/* User Management View */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transition: 'opacity 300ms ease-in-out',
              opacity: currentView === 'user-management' ? 1 : 0,
              visibility: currentView === 'user-management' ? 'visible' : 'hidden'
            }}>
              <div style={{
                backgroundColor: 'rgba(99, 102, 241, 0.4)',
                backdropFilter: 'blur(12px)',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid rgba(139, 69, 255, 0.3)',
                maxWidth: '900px',
                width: '100%'
              }}>
                <UserManagement onClose={backToLogin} />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
