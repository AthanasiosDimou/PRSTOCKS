
import React, { useState, useEffect } from 'react';
import { authService } from '@/services';
import Input from './common/Input';
import Button from './common/Button';
import UserIcon from './icons/UserIcon';

interface LoginProps {
  isActive?: boolean;
  onToggleView: () => void;
  onLoginSuccess?: (userData: any) => void;
}

interface LoginRequest {
  username: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user_id?: number;
  username?: string;
  subteam?: string;
}

const Login: React.FC<LoginProps> = ({ isActive = true, onToggleView, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear form fields when component becomes inactive
  useEffect(() => {
    if (!isActive) {
      setUsername('');
      setError('');
      setIsLoading(false);
    }
  }, [isActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!username.trim()) {
      setError('Please enter a username');
      setIsLoading(false);
      return;
    }

    try {
      const loginRequest: LoginRequest = {
        username: username.trim()
      };

      const response: LoginResponse = await authService.simpleLoginUser(loginRequest);

      if (response.success && response.user_id) {
        // Store user data in a secure way (not localStorage as requested)
        const userData = {
          user_id: response.user_id,
          username: response.username,
          subteam: response.subteam
        };
        
        // Call the success callback if provided
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        } else {
          console.log('Login successful:', userData);
          // Navigate to main app or emit event
          window.location.href = '/app'; // Simple navigation for now
        }
      } else {
        setError(response.message || 'Login failed - user not found');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
      <form onSubmit={handleSubmit} autoComplete="off">
        <Input
          id="login-username"
          label="Username"
          name="username"
          type="text"
          autoComplete="off"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          icon={<UserIcon />}
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
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </div>
      </form>
      <p style={{
        marginTop: '2rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#94a3b8'
      }}>
        Need to add users?{' '}
        <button 
          onClick={onToggleView} 
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
          Add Users
        </button>
      </p>
    </div>
  );
};

export default Login;

