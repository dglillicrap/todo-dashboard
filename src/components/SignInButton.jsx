// src/components/SignInButton.jsx
import React from 'react';
import { useMsal } from '@azure/msal-react';

const SignInButton = () => {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      await instance.loginRedirect({
        scopes: ['Tasks.Read', 'Tasks.ReadWrite'],
        prompt: 'select_account',
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button onClick={handleLogin}>Sign In</button>
      <button onClick={handleLogout}>Sign Out</button>
    </div>
  );
};

export default SignInButton;
