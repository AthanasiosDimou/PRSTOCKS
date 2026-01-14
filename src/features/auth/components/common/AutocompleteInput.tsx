import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '../../../../utils/tauri-compat';

interface AutocompleteInputProps {
  id: string;
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface GetUsernamesResponse {
  success: boolean;
  usernames: string[];
  message: string;
}

// Check if we're running in Tauri
const isTauri = () => {
  return typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined;
};

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  id, label, name, type, autoComplete, required, value, onChange, placeholder, icon, disabled
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load usernames on component mount
  useEffect(() => {
    const loadUsernames = async () => {
      try {
        if (isTauri()) {
          const response: GetUsernamesResponse = await invoke('get_available_usernames');
          if (response.success) {
            setSuggestions(response.usernames);
          }
        } else {
          // Mock usernames for web mode
          setSuggestions(['Nassos', 'admin', 'user1', 'user2', 'testuser']);
        }
      } catch (error) {
        console.error('Failed to load usernames:', error);
      }
    };

    loadUsernames();
  }, []);

  // Filter suggestions based on input value
  useEffect(() => {
    if (value && suggestions.length > 0) {
      const filtered = suggestions.filter(username =>
        username.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && value.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [value, suggestions]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };

  const handleInputFocus = () => {
    if (value && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (username: string) => {
    const syntheticEvent = {
      target: { value: username }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem', position: 'relative' }} ref={dropdownRef}>
      <label 
        htmlFor={id} 
        style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#e2e8f0',
          marginBottom: '0.5rem'
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#64748b',
          zIndex: 1
        }}>
          {icon}
        </div>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            paddingLeft: '2.5rem',
            paddingRight: '0.75rem',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            backgroundColor: 'rgba(51, 65, 85, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '0.5rem',
            color: '#f1f5f9',
            fontSize: '0.875rem',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
            }
          }}
          onFocus={(e) => {
            handleInputFocus();
            e.currentTarget.style.borderColor = '#6366f1';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
          }}
          onBlur={(e) => {
            // Delay hiding suggestions to allow click
            setTimeout(() => setShowSuggestions(false), 200);
            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'rgba(51, 65, 85, 0.95)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '0.5rem',
            backdropFilter: 'blur(12px)',
            zIndex: 50,
            marginTop: '0.25rem',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {filteredSuggestions.map((username, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(username)}
                style={{
                  padding: '0.75rem',
                  color: '#f1f5f9',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  borderBottom: index < filteredSuggestions.length - 1 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {username}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutocompleteInput;

