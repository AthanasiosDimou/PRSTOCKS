import React, { useState, useEffect } from 'react';
import { authService } from '@/services';
import Input from './common/Input';
import Button from './common/Button';
import LockIcon from './icons/LockIcon';
// import AdminPasswordSettings from '../../pages/settings/AdminPasswordSettings';

interface AdminVerificationProps {
  isActive?: boolean;
  onVerificationSuccess: () => void;
  onBackToLogin: () => void;
}

interface VerifyAdminRequest {
  admin_password: string;
}

interface VerifyAdminResponse {
  success: boolean;
  message: string;
}

// Admin verification now uses authService directly

const AdminVerification: React.FC<AdminVerificationProps> = ({ isActive = true, onVerificationSuccess, onBackToLogin }) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // const [showSettings, setShowSettings] = useState(false);

  // Clear form fields when component becomes inactive
  useEffect(() => {
    if (!isActive) {
      setAdminPassword('');
      setError('');
      setIsLoading(false);
      // setShowSettings(false);
    }
  }, [isActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔐 AdminVerification: Form submitted');
    console.log('🔐 AdminVerification: isActive:', isActive);
    console.log('🔐 AdminVerification: adminPassword:', adminPassword);
    
    // Prevent submission when component is not active
    if (!isActive) {
      console.log('🔐 AdminVerification: Component not active, preventing submission');
      return;
    }
    
    setIsLoading(true);
    setError('');

    if (!adminPassword.trim()) {
      setError('Please enter the admin password');
      setIsLoading(false);
      return;
    }

    try {
      const verifyRequest: VerifyAdminRequest = {
        admin_password: adminPassword.trim()
      };

      // Use authService directly - no need for Tauri compatibility
      console.log('🔐 AdminVerification: About to verify password');
      console.log('🔐 AdminVerification: Password length:', adminPassword.trim().length);
      console.log('🔐 AdminVerification: Password starts with:', adminPassword.trim().substring(0, 2) + '...');
      console.log('🔐 AdminVerification: Full password (for debug):', adminPassword);
      console.log('🔐 AdminVerification: Trimmed password:', adminPassword.trim());
      console.log('🔐 AdminVerification: Character codes:', [...adminPassword.trim()].map(c => c.charCodeAt(0)));
      console.log('🔐 AdminVerification: Request payload:', verifyRequest);
      
      const response: VerifyAdminResponse = await authService.verifyAdmin(verifyRequest);
      
      console.log('🔐 AdminVerification: Response received:', response);

      if (response.success) {
        console.log('✅ AdminVerification: Success!');
        onVerificationSuccess();
      } else {
        console.log('❌ AdminVerification: Failed:', response.message);
        setError(response.message || 'Invalid admin password');
      }
    } catch (err) {
      console.error('Admin verification error:', err);
      setError('Failed to verify password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={{
        backgroundColor: 'rgba(99, 102, 241, 0.4)',
        backdropFilter: 'blur(12px)',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.3)',
        borderRadius: '1rem',
        border: '1px solid rgba(139, 69, 255, 0.3)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 69, 255, 0.3) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Additional blur overlay for better transparency effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          backdropFilter: 'blur(8px)',
          zIndex: -1,
          borderRadius: '1rem'
        }}></div>
        
        {/* Settings button - Commented out since password can be changed through code
        <button
          onClick={() => setShowSettings(true)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 1
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          title="Admin Settings"
        >
          <SettingsIcon size={20} color="#ffffff" />
        </button>
        */}
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '0.5rem'
          }}>
            Admin Verification Required
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#94a3b8'
          }}>
            Enter the admin password to manage users
          </p>
        </div>
        
        <form 
          onSubmit={handleSubmit}
          autoComplete="off"
          style={{
            pointerEvents: isActive ? 'auto' : 'none',
            opacity: isActive ? 1 : 0.7
          }}
        >
          <Input
            id="admin-verification-password"
            label="Admin Password"
            name="admin-password"
            type="password"
            autoComplete="current-password"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={adminPassword}
            onChange={(e) => {
              setAdminPassword(e.target.value);
            }}
            placeholder="Enter admin password"
            icon={<LockIcon />}
            disabled={isLoading}
          />
          
          {error && (
            <div style={{
              color: '#f87171',
              fontSize: '0.875rem',
              textAlign: 'center',
              backgroundColor: 'rgba(248, 113, 113, 0.1)',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}
          
          <div style={{ marginBottom: '1.5rem' }}>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Access'}
            </Button>
          </div>
        </form>
        
        <p style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#94a3b8'
        }}>
          <button 
            onClick={onBackToLogin} 
            style={{
              fontWeight: '600',
              lineHeight: '1.5rem',
              color: '#818cf8',
              background: 'none',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textDecoration: 'none',
              padding: '0'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.color = '#a5b4fc';
                e.currentTarget.style.textDecoration = 'underline';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#818cf8';
              e.currentTarget.style.textDecoration = 'none';
            }}
            disabled={isLoading}
          >
            ← Back to Sign In
          </button>
        </p>
      </div>
      
      {/* Admin Password Settings Modal
      {showSettings && (
        <AdminPasswordSettings onClose={() => setShowSettings(false)} />
      )}
      */}
    </>
  );
};

export default AdminVerification;

