import React, { useState, useEffect } from 'react';
import { invoke } from '../../../utils/tauri-compat';
import Input from './common/Input';
import Button from './common/Button';
import SubteamDropdown from './common/SubteamDropdown';
import UserIcon from './icons/UserIcon';
import UserManagement from '../../settings/UserManagement';

interface AddUsersProps {
  isActive?: boolean;
  onToggleView: () => void;
  onUserAddSuccess?: (userData: any) => void;
}

interface AddUserRequest {
  username: string;
  subteam: string;
}

interface AddUserResponse {
  success: boolean;
  message: string;
  user_id?: number;
  username?: string;
  subteam?: string;
}

// Simple SVG Icon for management
const ManageUsersIcon = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const AddUsers: React.FC<AddUsersProps> = ({ isActive = true, onToggleView, onUserAddSuccess }) => {
  const [username, setUsername] = useState('');
  const [subteam, setSubteam] = useState('electrical');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUserManagement, setShowUserManagement] = useState(false);

  // Clear form fields when component becomes inactive
  useEffect(() => {
    if (!isActive) {
      setUsername('');
      setSubteam('electrical');
      setError('');
      setSuccess('');
      setIsLoading(false);
      setShowUserManagement(false);
    }
  }, [isActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters long');
      setIsLoading(false);
      return;
    }

    if (!subteam) {
      setError('Please select a subteam');
      setIsLoading(false);
      return;
    }

    try {
      const addUserRequest: AddUserRequest = {
        username: username.trim(),
        subteam
      };

      const response: AddUserResponse = await invoke('add_user_verified', { request: addUserRequest });

      if (response.success && response.user_id) {
        setSuccess(`User "${response.username}" added successfully to ${response.subteam} team!`);
        
        // Clear the form
        setUsername('');
        setSubteam('electrical');
        
        // Store user data in a secure way (not localStorage as requested)
        const userData = {
          user_id: response.user_id,
          username: response.username,
          subteam: response.subteam
        };
        
        // Call the success callback if provided
        if (onUserAddSuccess) {
          onUserAddSuccess(userData);
        }
      } else {
        setError(response.message || 'Failed to add user');
      }
    } catch (err) {
      console.error('Add user error:', err);
      setError('Failed to connect to server. Please try again.');
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
        
        {/* Manage Users button */}
        <button
          onClick={() => setShowUserManagement(true)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0.5rem',
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          title="Manage Users"
        >
          <ManageUsersIcon size={16} color="#ffffff" />
          Manage Users
        </button>
        
        <form onSubmit={handleSubmit}>        
          <Input
            id="add-username"
            label="Username to Add"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username (min. 3 characters)"
            icon={<UserIcon />}
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
              User's Subteam
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
              color: '#10b981',
              fontSize: '0.875rem',
              textAlign: 'center',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              marginBottom: '1.5rem'
            }}>
              {success}
            </div>
          )}
          
          <div style={{ marginBottom: '1.5rem' }}>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding User...' : 'Add User'}
            </Button>
          </div>
        </form>
        
        <p style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#94a3b8'
        }}>
          Already have users?{' '}
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
            Back to Sign In
          </button>
        </p>
      </div>
      
      {/* User Management Modal */}
      {showUserManagement && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}
    </>
  );
};

export default AddUsers;

