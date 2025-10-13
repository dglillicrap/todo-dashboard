import React, { useState, useEffect } from 'react';
import useTasks from '../hooks/useTasks';

const PreviewPanel = ({ task, listId, onTaskTitleUpdate }) => {
  const { fetchTasks } = useTasks();
  const [editingTitle, setEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
    }
  }, [task]);

  useEffect(() => {
    if (listId) {
      fetchTasks(listId);
    }
  }, [listId, fetchTasks]);

  if (!task) {
    return <div className="preview-panel">Select a task to preview</div>;
  }

  const handleTitleClick = () => {
    setEditingTitle(true);
  };

  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (editedTitle !== task.title) {
      onTaskTitleUpdate(task.id, editedTitle);
    }
  };

  return (
    <div className="preview-panel">
      <h3>Task Pane</h3>
      {editingTitle ? (
        <input
          type="text"
          value={editedTitle}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          autoFocus
        />
      ) : (
        <h4 onClick={handleTitleClick}>{task.title}</h4>
      )}
      <h5>Steps:</h5>
      <ul>
        {task.steps?.map((step) => (
          <li key={step.id}>{step.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default PreviewPanel;
