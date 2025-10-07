// src/components/SignInButton.jsx
import React from 'react';
import { useMsal } from '@azure/msal-react';

const SignInButton = () => {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      const response = await instance.loginPopup({
        scopes: ['Tasks.Read', 'Tasks.ReadWrite'],
        prompt: 'select_account',
      });
      instance.setActiveAccount(response.account);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    instance.logoutPopup();
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button onClick={handleLogin}>Sign In</button>
      <button onClick={handleLogout}>Sign Out</button>
    </div>
  );
};

export default SignInButton;