import React from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import SignInButton from './SignInButton';

const MsalGuard = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    // Render the Sign In button while unauthenticated
    return (
        <SignInButton />
        <div style={{ padding: '16px' }}>
        <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="top-left">
            c
          </div>
          <div className="top-center" />
          <div className="top-right" />
        </div>
        <p>Please sign in to continue...</p>
      </div>
    );
  }

  return children;
};

export default MsalGuard;