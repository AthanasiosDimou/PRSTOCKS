import React, { useState, useEffect } from 'react';
import { authService } from '@/services';
import type { User } from '@/services';
import './UserManagement.css';

interface UserManagementProps {
  onClose: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add user form state
  const [newUsername, setNewUsername] = useState('');
  const [newCategory, setNewCategory] = useState('Electrical'); // Default to Electrical
  const [addingUser, setAddingUser] = useState(false);

  // Available categories/subteams - Electrical and Admin categories
  const categories = [
    'Electrical',
    'Admin'
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await authService.getAllUsers();
      
      if (response.success) {
        setUsers(response.users);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newCategory.trim()) {
      setError('Username and category are required');
      return;
    }

    try {
      setAddingUser(true);
      setError('');
      setSuccess('');

      const response = await authService.addUserVerified({
        username: newUsername.trim(),
        subteam: newCategory.trim()
      });

      if (response.success) {
        setSuccess(`User "${newUsername}" added successfully!`);
        setNewUsername('');
        setNewCategory('Electrical'); // Reset to default
        setShowAddForm(false);
        await loadUsers(); // Refresh the user list
      } else {
        setError(response.message || 'Failed to add user');
      }
    } catch (err) {
      setError('Failed to add user. Please try again.');
      console.error('Error adding user:', err);
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      // Use our database service to delete the user
      const { databaseService } = await import('@/services');
      await databaseService.deleteUser(parseInt(userId));
      
      setSuccess(`User "${username}" deleted successfully!`);
      await loadUsers(); // Refresh the user list
    } catch (err) {
      setError(`Failed to delete user "${username}". Please try again.`);
      console.error('Error deleting user:', err);
    }
  };

  const handleClearDatabase = async () => {
    const confirmed = confirm(
      'Are you sure you want to clear ALL database data?\n\n' +
      'This will delete:\n' +
      '• All users (including admins)\n' +
      '• All inventory items\n' +
      '• All preferences and settings\n\n' +
      'This action cannot be undone!'
    );

    if (!confirmed) return;

    const doubleConfirm = confirm('This is your final warning! Are you absolutely sure?');
    if (!doubleConfirm) return;

    try {
      setError('');
      setSuccess('');

      const { databaseService } = await import('@/services');
      await databaseService.clearAllData();
      
      setSuccess('All database data cleared successfully! The page will reload.');
      
      // Reload the page after a short delay to reinitialize everything
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      setError('Failed to clear database. Please try again.');
      console.error('Error clearing database:', err);
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="user-management-overlay">
      <div className="user-management-modal">
        <div className="user-management-header">
          <h2>User Management</h2>
          <button onClick={onClose}>Close</button>
        </div>

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="user-management-content">
          <div className="user-management-actions">
            <button 
              className="add-user-btn"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : 'Add New User'}
            </button>
            <button 
              className="clear-db-btn"
              onClick={handleClearDatabase}
              title="Clear all database data (users, inventory, preferences)"
            >
              🗑️ Clear All Data
            </button>
          </div>

          {showAddForm && (
            <div className="add-user-form">
              <h3>Add New User</h3>
              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label htmlFor="username">Username:</label>
                  <input
                    id="username"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category/Subteam:</label>
                  <select
                    id="category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'Electrical' ? 'Electrical (Electrical Components)' : 
                         cat === 'Admin' ? 'Admin (Administrative Access)' : 
                         cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={addingUser}>
                    {addingUser ? 'Adding...' : 'Add User'}
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <h3>Current Users ({users.length})</h3>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.user_id}>
                    <td>{user.username}</td>
                    <td>{user.is_admin ? 'Admin' : 'User'}</td>
                    <td>{user.is_active ? 'Active' : 'Inactive'}</td>
                    <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button 
                        className="delete-user-btn"
                        onClick={() => handleDeleteUser(String(user.user_id), user.username)}
                        title={`Delete user ${user.username}`}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
