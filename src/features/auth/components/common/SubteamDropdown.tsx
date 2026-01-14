import * as React from 'react';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';

interface SubteamDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const subteams = [
  { value: 'electrical', label: 'Electrical' },
  { value: 'composites', label: 'Composites' },
  { value: 'mechanics', label: 'Mechanics' },
  { value: 'aerodynamics', label: 'Aerodynamics' },
  { value: 'powertrain', label: 'Powertrain' },
  { value: 'suspension', label: 'Suspension' },
];

export default function SubteamDropdown({ value, onChange, disabled = false }: SubteamDropdownProps) {
  const [open, setOpen] = React.useState(false);

  const handleOpenChange = React.useCallback(
    (_event: React.SyntheticEvent | null, isOpen: boolean) => {
      if (!disabled) {
        setOpen(isOpen);
      }
    },
    [disabled],
  );

  const handleMenuItemClick = (subteamValue: string) => {
    onChange(subteamValue);
    setOpen(false);
  };

  const selectedSubteam = subteams.find(s => s.value === value);

  return (
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
      <Dropdown open={open} onOpenChange={handleOpenChange}>
        <MenuButton
          disabled={disabled}
          sx={{
            width: '100%',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            color: '#ffffff',
            border: '1px solid #334155',
            borderRadius: '0.375rem',
            padding: '0.75rem',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            '&:hover': {
              backgroundColor: !disabled ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.8)',
              borderColor: !disabled ? '#6366f1' : '#334155',
            },
            '&:focus': {
              borderColor: '#6366f1',
              boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
            },
            '&:disabled': {
              opacity: 0.5,
              cursor: 'not-allowed',
            }
          }}
        >
          {selectedSubteam ? selectedSubteam.label : 'Select a subteam'}
        </MenuButton>
        <Menu
          sx={{
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            border: '1px solid #334155',
            borderRadius: '0.375rem',
            padding: '0.25rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          {subteams.map((subteam) => (
            <MenuItem
              key={subteam.value}
              onClick={() => handleMenuItemClick(subteam.value)}
              sx={{
                color: '#ffffff',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: '#6366f1',
                },
                '&.Mui-selected': {
                  backgroundColor: '#6366f1',
                  '&:hover': {
                    backgroundColor: '#5855f7',
                  },
                },
              }}
            >
              {subteam.label}
            </MenuItem>
          ))}
        </Menu>
      </Dropdown>
    </div>
  );
}
