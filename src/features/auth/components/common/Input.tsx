
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ id, label, icon, type = 'text', ...props }) => {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label 
        htmlFor={id} 
        style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#94a3b8',
          marginBottom: '0.5rem'
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '0.75rem'
          }}>
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          style={{
            display: 'block',
            width: '100%',
            borderRadius: '0.375rem',
            border: '1px solid #334155',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            paddingRight: '0.75rem',
            paddingLeft: icon ? '2.5rem' : '0.75rem',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            color: '#ffffff',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#6366f1';
            e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#334155';
            e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
          }}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;
