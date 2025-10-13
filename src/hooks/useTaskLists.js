// src/hooks/useTaskLists.js
import { useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

const useTaskLists = () => {
  const { instance } = useMsal();
  const [taskLists, setTaskLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskLists = async () => {
      try {
        const account = instance.getActiveAccount();
        if (!account) {
          console.warn('No active account. User may not be signed in.');
          setLoading(false);
          return;
        }

        const response = await instance.acquireTokenSilent({
          scopes: ['Tasks.Read'],
          account,
        });

        const res = await fetch('https://graph.microsoft.com/v1.0/me/todo/lists', {
          headers: {
            Authorization: `Bearer ${response.accessToken}`,
          },
        });

        const data = await res.json();
        setTaskLists(data.value || []);
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          console.warn('Interaction required. Please sign in again.');
        } else {
          console.error('Error fetching task lists:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    // Only run if MSAL is initialized
    if (instance && instance.getAllAccounts().length > 0) {
      fetchTaskLists();
    } else {
      console.warn('MSAL instance not ready or no accounts found.');
      setLoading(false);
    }
  }, [instance]);

  return { taskLists, loading };
};

export default useTaskLists;