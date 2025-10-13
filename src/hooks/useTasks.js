// src/hooks/useTasks.js
import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';

/**
 * Custom React hook to fetch and manage Microsoft To Do tasks for a given list.
 * - Fetches all tasks (incomplete + completed if you want)
 * - Supports silent token refresh
 * - Automatically reloads when:
 *    • listId or refreshKey changes
 *    • a "refreshTasks" event is dispatched (after new task creation)
 */
const useTasks = (listId, refreshKey) => {
  const { instance, accounts } = useMsal();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const account = accounts[0];

  const fetchTasksWithRetry = async (retry = 1) => {
    if (!listId || !account) return;
    setLoading(true);

    try {
      // Acquire token with read/write permissions
      const response = await instance.acquireTokenSilent({
        account,
        scopes: ['Tasks.Read', 'Tasks.ReadWrite'],
      });

      // Fetch all tasks for the selected list
      const result = await fetch(
        `https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks?$orderby=createdDateTime desc`,
        {
          headers: { Authorization: `Bearer ${response.accessToken}` },
        }
      );

      if (!result.ok) throw new Error(`Graph error: ${result.status}`);
      const data = await result.json();

      // Sort alphabetically, pushing 🔻 tasks to bottom
      const sorted = data.value.sort((a, b) => {
        const aHole = a.title.startsWith('🔻');
        const bHole = b.title.startsWith('🔻');
        if (aHole && !bHole) return 1;
        if (!aHole && bHole) return -1;
        return a.title.localeCompare(b.title);
      });

      setTasks(sorted);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      // Try again once if transient failure
      if (retry > 0) setTimeout(() => fetchTasksWithRetry(retry - 1), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Initial + dependency-based fetch
  useEffect(() => {
    fetchTasksWithRetry();
  }, [listId, refreshKey, account]);

  // Listen for custom event fired by TaskPanel after a new task is added
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
