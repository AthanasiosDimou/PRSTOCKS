import React, { useState, useEffect } from 'react';
import LoginApp from './features/auth/App';
import StockManagementApp from './app/StockManagementApp';

interface UserData {
  user_id: number;
  username: string;
  subteam: string;
}

interface AuthWrapperProps {
  onUsername?: (uname: string) => void;
  children?: (userData: UserData) => React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ onUsername, children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Accept onUsername and children render prop
  // @ts-ignore
    // const { onUsername, children } = (typeof arguments[0] === 'object' ? arguments[0] : {}) || {};

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (user: UserData) => {
    setUserData(user);
    setIsAuthenticated(true);
    if (onUsername) onUsername(user.username);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    return (
      <LoginApp 
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleLoginSuccess}
      />
    );
  }

  // If children is a function, render it with userData
  if (typeof children === 'function') {
    return children(userData);
  }

  return (
    <StockManagementApp 
      currentUser={userData}
    />
  );
};

export default AuthWrapper;
