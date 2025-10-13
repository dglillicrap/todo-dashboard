import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import useTasks from '../hooks/useTasks';

const TaskPanel = ({ listId, listName, refreshKey, onSelectTask }) => {
  const { instance } = useMsal();
  const { tasks, loading } = useTasks(listId, refreshKey);
  const [newTask, setNewTask] = useState('');

  const getToken = async () => {
    const account = instance.getActiveAccount();
    if (!account) return null;
    try {
      return await instance.acquireTokenSilent({
        scopes: ['Tasks.Read', 'Tasks.ReadWrite'],
        account,
      });
    } catch (e) {
      if (e instanceof InteractionRequiredAuthError) {
        return await instance.loginPopup({ scopes: ['Tasks.Read', 'Tasks.ReadWrite'] });
      }
      console.error('Token error:', e);
      return null;
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim() || !listId) return;
    const resp = await getToken();
    if (!resp) return;
    try {
      await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resp.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTask }),
      });
      setNewTask('');
      window.dispatchEvent(new CustomEvent('refreshTasks', { detail: listId }));
    } catch (err) {
      console.error('Create task failed:', err);
    }
  };

  const handleToggleComplete = async (task) => {
    const resp = await getToken();
    if (!resp) return;
    try {
      await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${resp.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });
      window.dispatchEvent(new CustomEvent('refreshTasks', { detail: listId }));
    } catch (err) {
      console.error('Complete task failed:', err);
    }
  };

  const visibleTasks = tasks.filter((t) => t.status !== 'completed');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTask();
  };

  return (
    <div className="task-panel">
      {loading && <p>Loading...</p>}
      {!loading && visibleTasks.length === 0 && <p>No tasks found.</p>}
      {!loading && visibleTasks.length > 0 && (
        <ul>
          {visibleTasks.map((task) => (
            <li key={task.id} className="task-item">
              <input
                type="checkbox"
                onChange={() => handleToggleComplete(task)}
                style={{ marginRight: '8px' }}
              />
              {/* Minimal change: pass task + listId + listName */}
              <span onClick={() => onSelectTask(task, listId, listName)} style={{ cursor: 'pointer' }}>
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="add-task-container">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add new task..."
          className="task-input"
          style={{
            backgroundColor: '#d6eaff',
            border: '1px solid #d3d3d3',
            borderRadius: '4px',
            padding: '6px 8px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
};

export default TaskPanel;
