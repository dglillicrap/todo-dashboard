import React, { useState, useEffect } from 'react';

const PreviewPanel = ({
  task,
  tasks,
  listId,
  listName,
  refreshKey,
  onRefresh,
}) => {
  const [title, setTitle] = useState(task?.title || '');
  const [notes, setNotes] = useState(task?.notes || '');
  const [steps, setSteps] = useState(task?.steps || []);

  useEffect(() => {
    setTitle(task?.title || '');
    setNotes(task?.notes || '');
    setSteps(task?.steps || []);
  }, [task]);

  const handleSave = () => {
    // When saving, call the onRefresh prop to let App re-fetch tasks.
    // In a real app you would call updateTask or addStepToTask here.
    onRefresh();
  };

  if (!task) {
    return <p>Select a task to preview</p>;
  }

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <strong>Task Pane</strong>{' '}
        {listName && (
          <span style={{ marginLeft: 8, color: '#666' }}>
            from TaskList: {listName}
          </span>
        )}
      </div>

      <div className="preview-content">
        <input
          className="preview-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="preview-steps">
          {steps.map((step, idx) => (
            <div key={idx} className="step-item">
              <span>{step}</span>
            </div>
          ))}
        </div>

        <textarea
          className="preview-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default PreviewPanel;
