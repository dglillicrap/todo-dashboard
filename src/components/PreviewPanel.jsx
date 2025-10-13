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
    // call onRefresh so the parent can re-fetch tasks
    onRefresh();
  };

  if (!task) {
    return (
      <div className="preview-panel">
        <p>Select a task to preview</p>
      </div>
    );
  }

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <strong>Task Pane</strong>
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
          onChange={e => setTitle(e.target.value)}
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
          onChange={e => setNotes(e.target.value)}
        />
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default PreviewPanel;
