// src/hooks/useTaskLists.js
import { useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

const useTaskLists = () => {
  const { instance, accounts } = useMsal();
  const [taskLists, setTaskLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskLists = async () => {
      if (accounts.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const account = accounts[0];

        const response = await instance.acquireTokenSilent({
          scopes: ['Tasks.Read', 'Tasks.ReadWrite'],
          account,
        });

        const res = await fetch('https://graph.microsoft.com/v1.0/me/todo/lists', {
          headers: {
            Authorization: `Bearer ${response.accessToken}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

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

    fetchTaskLists();
  }, [instance, accounts]);

  return { taskLists, loading };
};

export default useTaskLists;
