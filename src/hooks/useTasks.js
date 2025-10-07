// src/hooks/useTasks.js
import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';

const useTasks = (listId, refreshKey) => {
  const { instance, accounts } = useMsal();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const account = accounts[0];

  const fetchTasksWithRetry = async (retry = 1) => {
    if (!listId || !account) return;
    setLoading(true);
    try {
      const response = await instance.acquireTokenSilent({
        account,
        scopes: ['Tasks.Read', 'Tasks.ReadWrite'],
      });
      const result = await fetch(
        `https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks?$filter=status ne 'completed'&$orderby=title`,
        {
          headers: { Authorization: `Bearer ${response.accessToken}` },
        }
      );
      if (!result.ok) throw new Error(`Graph error: ${result.status}`);
      const data = await result.json();

      // Sort tasks alphabetically and push 🕳️ ones to bottom
      const sorted = data.value.sort((a, b) => {
        const aHole = a.title.startsWith('🕳️');
        const bHole = b.title.startsWith('🕳️');
        if (aHole && !bHole) return 1;
        if (!aHole && bHole) return -1;
        return a.title.localeCompare(b.title);
      });
      setTasks(sorted);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      if (retry > 0) setTimeout(() => fetchTasksWithRetry(retry - 1), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when listId or refreshKey changes
  useEffect(() => {
    fetchTasksWithRetry();
  }, [listId, refreshKey, account]);

  // Listen for refresh events triggered by any TaskPanel
  useEffect(() => {
    const listener = (e) => {
      if (e.detail === listId) fetchTasksWithRetry();
    };
    window.addEventListener('refreshTasks', listener);
    return () => window.removeEventListener('refreshTasks', listener);
  }, [listId, account]);

  return { tasks, loading, fetchTasksWithRetry };
};

export default useTasks;
