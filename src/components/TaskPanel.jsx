import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import useTasks from '../hooks/useTasks';

const TaskPanel = ({ listId, refreshKey, onSelectTask }) => {
  const { instance } = useMsal();
  const { tasks, loading } = useTasks(listId, refreshKey);
  const [newTask, setNewTask] = useState('');

  const getToken = async () => {
    const account = instance.getActiveAccount();
    if (!account) return null;
    try {
      return await instance.acquireTokenSilent({
        scopes: ['Tasks.ReadWrite'],
        account,
      });
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        return await instance.loginPopup({ scopes: ['Tasks.ReadWrite'] });
      }
      console.error('Token error:', error);
      return null;
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim() || !listId) return;
    const response = await getToken();
    if (!response) return;

    try {
      await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTask }),
      });
      setNewTask('');
      const event = new CustomEvent('refreshTasks', { detail: listId });
      window.dispatchEvent(event);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleToggleComplete = async (task) => {
    const response = await getToken();
    if (!response) return;
    try {
      await fetch(
        `https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${response.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'completed' }),
        }
      );
      const event = new CustomEvent('refreshTasks', { detail: listId });
      window.dispatchEvent(event);
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  // Show only incomplete tasks
  const visibleTasks = tasks.filter((t) => t.status !== 'completed');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleAddTask();
  };

  return (
    <>
      {visibleTasks.length > 0 ? (
        <ul>
          {visibleTasks.map((task) => (
            <li key={task.id}>
              <input
                type="checkbox"
                checked={false}
                onChange={() => handleToggleComplete(task)}
              />
              <span
                onClick={() => onSelectTask(task)}
                style={{ cursor: 'pointer', marginLeft: '5px' }}
              >
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tasks found.</p>
      )}
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Add new task..."
        className="task-input"
        style={{
          backgroundColor: '#d6eaff',
          border: '1px solid #d3d3d3',
          borderRadius: '4px',
          padding: '6px 8px',
          width: '100%',
        }}
      />
    </>
  );
};

export default TaskPanel;
