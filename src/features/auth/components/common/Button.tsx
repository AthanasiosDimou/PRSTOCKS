
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, disabled, ...props }) => {
  return (
    <button
      style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        borderRadius: '0.375rem',
        padding: '0.75rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        lineHeight: '1.5rem',
        color: '#ffffff',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s ease',
        background: disabled 
          ? '#6b7280' 
          : 'linear-gradient(to right, #6366f1, #a855f7)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transform: 'scale(1)'
      }}
      onMouseOver={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'linear-gradient(to right, #5855f7, #9333ea)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseOut={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'linear-gradient(to right, #6366f1, #a855f7)';
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid #6366f1';
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
