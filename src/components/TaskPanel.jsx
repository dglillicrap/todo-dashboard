// src/components/TaskPanel.jsx
import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import useTasks from '../hooks/useTasks';

const TaskPanel = ({ listId, refreshKey, onSelectTask }) => {
  const { instance } = useMsal();
  const { tasks, loading } = useTasks(listId, refreshKey);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = async () => {
    if (!newTask.trim() || !listId) return;
    const account = instance.getActiveAccount();
    if (!account) return;

    let response;
    try {
      response = await instance.acquireTokenSilent({
        scopes: ['Tasks.ReadWrite'],
        account,
      });
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        response = await instance.loginPopup({ scopes: ['Tasks.ReadWrite'] });
        instance.setActiveAccount(response.account);
      } else {
        console.error('Error acquiring token:', error);
        return;
      }
    }

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

      // 🔄 Ask the hook to reload this panel’s tasks
      const event = new CustomEvent('refreshTasks', { detail: listId });
      window.dispatchEvent(event);
    } catch (err) {
      console.error('Error creating new task:', err);
    }
  };

  return (
    <div className="task-panel">
      {loading && <p>Loading...</p>}
      {!loading && tasks.length === 0 && <p>No tasks found.</p>}
      {!loading && tasks.length > 0 && (
        <ul>
          {tasks.map((task) => (
            <li
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="task-item"
            >
              {task.title}
            </li>
          ))}
        </ul>
      )}
      <div className="add-task-container">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task..."
          className="task-input"
        />
        <button onClick={handleAddTask} className="add-task-button">
          Add
        </button>
      </div>
    </div>
  );
};

export default TaskPanel;
