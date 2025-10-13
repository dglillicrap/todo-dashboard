import React from 'react';

const PreviewPanel = ({ selectedTask, updateTask, updateStep }) => {
  if (!selectedTask) {
    return <div className="panel">Select a task to preview</div>;
  }

  const { listName, task } = selectedTask;

  const handleTitleChange = (e) => {
    // update the task title
    updateTask(selectedTask.listId, { ...task, title: e.target.value });
  };

  const handleListNameChange = (e) => {
    // here you could implement renaming the list if desired
  };

  return (
    <div className="panel">
      <div style={{ marginBottom: 5 }}>
        <strong>Task Pane</strong>{' '}
        <span style={{ marginLeft: 8 }}>from TaskList:</span>
        <input
          type="text"
          value={listName}
          onChange={handleListNameChange}
          style={{
            background: '#d6eaff',
            border: '1px solid #ccc',
            padding: '2px',
            marginLeft: 4,
          }}
        />
      </div>
      <input
        type="text"
        value={task.title}
        onChange={handleTitleChange}
        style={{
          background: '#d6eaff',
          border: '1px solid #ccc',
          width: '100%',
          marginBottom: 5,
        }}
      />
      {task.steps?.map((step, index) => (
        <div key={index}>
          <input
            type="checkbox"
            checked={step.completed}
            onChange={() =>
              updateStep(selectedTask.listId, index, {
                ...step,
                completed: !step.completed,
              })
            }
          />
          <input
            type="text"
            value={step.title}
            onChange={(e) =>
              updateStep(selectedTask.listId, index, {
                ...step,
                title: e.target.value,
              })
            }
            style={{ marginLeft: 5 }}
          />
        </div>
      ))}
      <textarea
        rows={4}
        value={task.notes || ''}
        onChange={(e) =>
          updateTask(selectedTask.listId, { ...task, notes: e.target.value })
        }
        placeholder="Task notes"
        style={{
          width: '100%',
          marginTop: 8,
          background: '#d6eaff',
          border: '1px solid #ccc',
        }}
      />
    </div>
  );
};

export default PreviewPanel;
