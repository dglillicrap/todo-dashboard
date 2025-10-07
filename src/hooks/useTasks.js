// src/hooks/useTasks.js
import { useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';

const useTasks = (listId, refreshKey = 0) => {
  const { instance } = useMsal();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        const account = instance.getActiveAccount();
        if (!account) {
          setLoading(false);
          return;
        }

        const response = await instance.acquireTokenSilent({
          scopes: ['Tasks.Read'],
          account,
        });

        const res = await fetch(
          `https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks`,
          {
            headers: {
              Authorization: `Bearer ${response.accessToken}`,
            },
          }
        );

        const data = await res.json();
        setTasks(data.value || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [listId, instance, refreshKey]);

  return { tasks, loading };
};

export default useTasks;