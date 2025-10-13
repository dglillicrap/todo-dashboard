// src/components/MsalGuard.jsx
import React from 'react';
import { useIsAuthenticated } from '@azure/msal-react';

const MsalGuard = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <p>Please sign in to continue...</p>;
  }

  return children;
};

export default MsalGuard;