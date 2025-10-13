import React, { useState, useEffect } from 'react';

const PreviewPanel = ({
  task,
  taskListName,
  updateTask,
  addStep,
  toggleStepComplete,
}) => {
  // If no task is selected, show a placeholder
  if (!task) {
    return <div className="preview-panel">Select a task to preview</div>;
  }

  // Local state for editing the task title and list name
  const [title, setTitle] = useState(task.title);
  const [listName, setListName] = useState(taskListName);

  // Keep local state in sync when the selected task changes
  useEffect(() => {
    setTitle(task.title);
    setListName(taskListName);
  }, [task, taskListName]);

  // Commit the title change on blur
  const handleTitleBlur = () => {
    if (title.trim() !== task.title) {
      updateTask({ ...task, title: title.trim() });
    }
  };

  // Add a step when Enter is pressed
  const handleAddStep = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      addStep(task, e.target.value.trim());
      e.target.value = '';
    }
  };

  return (
    <div className="preview-panel">
      {/* Header row: Task Pane with list name */}
      <div className="preview-header" style={{ marginBottom: '6px' }}>
        <strong>Task Pane</strong>{' '}
        <span style={{ marginLeft: '6px' }}>from TaskList:</span>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          style={{
            backgroundColor: '#d6eaff',
            border: '1px solid lightgrey',
            marginLeft: '4px',
          }}
        />
      </div>

      {/* Task title with light grey box around it */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        style={{
          width: '100%',
          backgroundColor: '#d6eaff',
          border: '1px solid lightgrey',
          padding: '4px',
          marginBottom: '8px',
        }}
      />

      {/* Checklist steps, if any */}
      {task.checklist &&
        task.checklist.map((step) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={step.state === 'completed'}
              onChange={() => toggleStepComplete(task, step)}
            />
            <span style={{ marginLeft: '6px' }}>{step.title}</span>
          </div>
        ))}

      {/* Input to add a new step */}
      <input
        type="text"
        placeholder="Add step"
        onKeyDown={handleAddStep}
        style={{ marginTop: '8px', width: '100%' }}
      />
    </div>
  );
};

export default PreviewPanel;
