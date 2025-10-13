// src/components/TaskPanel.jsx
import React, { useState } from 'react';

<<<<<<< HEAD
const TaskPanel = ({
  listId,
  listName,
  tasks,
  addTask,
  updateTask,
  onSelectTask,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  // Only show incomplete tasks
  const activeTasks = tasks.filter((t) => !t.completed);
=======
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
>>>>>>> d7bbb9aa (Describe the change)

  return (
    <div className="panel">
      <div><strong>{listName}</strong></div>
      {activeTasks.length > 0 ? (
        <ul>
          {activeTasks.map((task) => (
            <li key={task.id}>
              {/* only the checkbox toggles completion */}
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() =>
                  updateTask({ ...task, completed: !task.completed })
                }
              />
<<<<<<< HEAD
              {/* clicking text just selects it for preview */}
              <span
                style={{ marginLeft: 5, cursor: 'pointer' }}
                onClick={() => onSelectTask(task)}
=======
              <span
                onClick={() => onSelectTask(task)}
                style={{ cursor: 'pointer' }}
>>>>>>> d7bbb9aa (Describe the change)
              >
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tasks found.</p>
      )}
      <form onSubmit={handleAdd}>
        <input
          type="text"
<<<<<<< HEAD
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add new task…"
          style={{
            background: '#d6eaff',
            border: '1px solid #ccc',
=======
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Add new task..."
          className="task-input"
          style={{
            backgroundColor: '#d6eaff', // light blue
            border: '1px solid #d3d3d3', // light gray border
            borderRadius: '4px',
            padding: '6px 8px',
>>>>>>> d7bbb9aa (Describe the change)
            width: '100%',
          }}
        />
      </form>
    </div>
  );
};

export default TaskPanel;
