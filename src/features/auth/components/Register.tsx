
import React, { useState } from 'react';
import { invoke } from '../../../utils/tauri-compat';
import Input from './common/Input';
import Button from './common/Button';
import SubteamDropdown from './common/SubteamDropdown';
import UserIcon from './icons/UserIcon';
import LockIcon from './icons/LockIcon';

interface RegisterProps {
  onToggleView: () => void;
  onRegisterSuccess?: (userData: any) => void;
}

interface RegisterRequest {
  username: string;
  password: string;
  subteam: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  user_id?: number;
  username?: string;
  subteam?: string;
}

const Register: React.FC<RegisterProps> = ({ onToggleView, onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [subteam, setSubteam] = useState('electrical'); // Default to electrical
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (!subteam) {
      setError('Please select a subteam');
      setIsLoading(false);
      return;
    }

    try {
      const registerRequest: RegisterRequest = {
        username,
        password,
        subteam
      };

      const response: RegisterResponse = await invoke('register_user', { request: registerRequest });

      if (response.success && response.user_id) {
        setSuccess(response.message || 'Registration successful!');
        
        // Store user data in a secure way (not localStorage as requested)
        const userData = {
          user_id: response.user_id,
          username: response.username,
          subteam: response.subteam
        };
        
        // Call the success callback if provided, otherwise switch to login view
        if (onRegisterSuccess) {
          onRegisterSuccess(userData);
        } else {
          // Auto-switch to login view after successful registration
          setTimeout(() => {
            onToggleView();
          }, 2000);
        }
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
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
      <form onSubmit={handleSubmit}>
        <Input
          id="register-username"
          label="Username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username (min. 3 characters)"
          icon={<UserIcon />}
          disabled={isLoading}
        />
        <Input
          id="register-password"
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password (min. 6 characters)"
          icon={<LockIcon />}
          disabled={isLoading}
        />
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#94a3b8',
            marginBottom: '0.5rem'
          }}>
            Subteam
          </label>
          <SubteamDropdown
            value={subteam}
            onChange={setSubteam}
            disabled={isLoading}
          />
        </div>
        
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
        
        {success && (
          <div style={{
            color: '#4ade80',
            fontSize: '0.875rem',
            textAlign: 'center',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid rgba(74, 222, 128, 0.2)',
            marginBottom: '1.5rem'
          }}>
            {success}
          </div>
        )}
        <div style={{ marginBottom: '1.5rem' }}>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </form>
      <p style={{
        marginTop: '2rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#94a3b8'
      }}>
        Already a member?{' '}
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
          Sign in
        </button>
      </p>
    </div>
  );
};

export default Register;

