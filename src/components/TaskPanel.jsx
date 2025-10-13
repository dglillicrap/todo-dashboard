import React, { useState } from 'react';

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
              {/* clicking text just selects it for preview */}
              <span
                style={{ marginLeft: 5, cursor: 'pointer' }}
                onClick={() => onSelectTask(task)}
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
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add new task…"
          style={{
            background: '#d6eaff',
            border: '1px solid #ccc',
            width: '100%',
          }}
        />
      </form>
    </div>
  );
};

export default TaskPanel;
