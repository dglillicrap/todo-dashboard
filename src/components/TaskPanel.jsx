import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

const TaskPanel = ({ tasks, onSelectTask, listId, refreshKey }) => {
  const { instance, accounts } = useMsal();
  const [newTask, setNewTask] = useState('');

  const getToken = async () => {
    const account = accounts[0];
    if (!account) return null;
    try {
      return await instance.acquireTokenSilent({
        scopes: ['Tasks.ReadWrite'],
        account,
      });
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        return await instance.loginRedirect({ scopes: ['Tasks.ReadWrite'] });
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
      const result = await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTask }),
      });
      
      if (result.ok) {
        setNewTask('');
        // Trigger refresh
        const event = new CustomEvent('refreshTasks', { detail: listId });
        window.dispatchEvent(event);
        console.log('Task added successfully');
      } else {
        console.error('Failed to add task:', result.status);
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleToggleComplete = async (task) => {
    const response = await getToken();
    if (!response) return;
    
    try {
      const result = await fetch(
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
      
      if (result.ok) {
        // Trigger refresh
        const event = new CustomEvent('refreshTasks', { detail: listId });
        window.dispatchEvent(event);
        console.log('Task completed successfully');
      } else {
        console.error('Failed to complete task:', result.status);
      }
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  // Show only incomplete tasks
  const visibleTasks = tasks.filter((t) => t.status !== 'completed');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };

  return (
    <>
      {visibleTasks.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 8px 0' }}>
          {visibleTasks.map((task) => (
            <li key={task.id} style={{ marginBottom: '4px' }}>
              <input
                type="checkbox"
                checked={false}
                onChange={(e) => {
                  e.stopPropagation();
                  handleToggleComplete(task);
                }}
                style={{ cursor: 'pointer' }}
              />
              <span
                onClick={() => {
                  console.log('Task clicked:', task);
                  onSelectTask(task);
                }}
                style={{ cursor: 'pointer', marginLeft: '5px' }}
              >
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: '0 0 8px 0' }}>No tasks found.</p>
      )}
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Add new task..."
        style={{
          backgroundColor: '#d6eaff',
          border: '1px solid #d3d3d3',
          borderRadius: '4px',
          padding: '6px 8px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </>
  );
};

export default TaskPanel;