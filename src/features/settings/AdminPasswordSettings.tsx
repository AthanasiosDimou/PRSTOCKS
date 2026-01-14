import React, { useState } from 'react';
import { invoke } from '../../utils/tauri-compat';
import './AdminPasswordSettings.css';

interface AdminPasswordSettingsProps {
  onClose: () => void;
}

interface UpdateAdminPasswordResponse {
  success: boolean;
  message: string;
}

// Simple SVG Icons
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <circle cx="12" cy="16" r="1" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4" />
    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
  </svg>
);

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const AdminPasswordSettings: React.FC<AdminPasswordSettingsProps> = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword.trim()) {
      setMessage('Please enter your current password');
      setMessageType('error');
      return;
    }

    if (!newPassword.trim()) {
      setMessage('Please enter a new password');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 8) {
      setMessage('New password must be at least 8 characters long');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      return;
    }

    if (newPassword === currentPassword) {
      setMessage('New password must be different from current password');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response: UpdateAdminPasswordResponse = await invoke('update_admin_password', {
        request: {
          current_password: currentPassword,
          new_password: newPassword,
        },
      });

      if (response.success) {
        setMessage(response.message);
        setMessageType('success');
        
        // Clear form after successful update
        setTimeout(() => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setMessage('');
          setMessageType('');
        }, 2000);
      } else {
        setMessage(response.message);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Failed to update admin password:', error);
      setMessage('Failed to update admin password. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-password-settings">
      <div className="settings-overlay" onClick={onClose}></div>
      
      <div className="settings-modal">
        <div className="settings-header">
          <div className="settings-title">
            <SettingsIcon className="icon" />
            <h2>Admin Settings</h2>
          </div>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="settings-content">
          <div className="password-section">
            <h3>
              <LockIcon className="section-icon" />
              Change Admin Password
            </h3>
            
            <form onSubmit={handleUpdatePassword} className="password-form">
              <div className="form-group">
                <label htmlFor="current-password">Current Password</label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your current password"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter new password (min 8 characters)"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
              </div>

              {message && (
                <div className={`message ${messageType}`}>
                  {messageType === 'success' ? (
                    <CheckCircleIcon className="message-icon" />
                  ) : (
                    <AlertCircleIcon className="message-icon" />
                  )}
                  <span>{message}</span>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>

            <div className="password-info">
              <h4>Password Requirements:</h4>
              <ul>
                <li>Minimum 8 characters</li>
                <li>Must be different from current password</li>
                <li>Consider using a mix of letters, numbers, and symbols</li>
              </ul>
              
              <div className="security-note">
                <AlertCircleIcon className="note-icon" />
                <p>
                  <strong>Important:</strong> Changing the admin password will require 
                  you to use the new password for all admin verification steps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPasswordSettings;

