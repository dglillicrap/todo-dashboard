import React, { useEffect, useState } from "react";

/**
 * Shows details of the currently selected task.
 * Also displays which task list the task comes from, with a light-blue field.
 */
const PreviewPanel = ({ task, taskLists, selectedListId }) => {
  // track the editable task name and whether it is being edited
  const [editedTitle, setEditedTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);

  // Keep an editable copy of the list name
  const [listName, setListName] = useState("");

  // Update title when the selected task changes
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title || "");
    }
  }, [task]);

  // Update list name whenever lists or selectedListId changes
  useEffect(() => {
    const found = taskLists?.find((l) => l.id === selectedListId);
    setListName(found ? found.displayName : "");
  }, [taskLists, selectedListId]);

  if (!task) {
    // Nothing selected
    return (
      <div className="preview-panel">
        <p>Select a task to preview</p>
      </div>
    );
  }

  // Save edited title back to the task (if you have an API call, do it here)
  const handleTitleBlur = () => {
    setEditingTitle(false);
    // You could call an API to update the task title here
    // e.g. updateTaskTitle(task.id, editedTitle);
  };

  // Save edited list name (optional API call)
  const handleListNameBlur = () => {
    // If you want to rename the list, call the API here
    // e.g. updateTaskListName(selectedListId, listName);
  };

  return (
    <div className="preview-panel">
      {/* Task name with light-blue styling and light-grey border */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {editingTitle ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleBlur}
            style={{
              backgroundColor: "#d6eaff",
              border: "1px solid lightgrey",
              padding: "4px",
              fontSize: "1rem",
              flexGrow: 1,
            }}
          />
        ) : (
          <h4
            onClick={() => setEditingTitle(true)}
            style={{
              backgroundColor: "#d6eaff",
              border: "1px solid lightgrey",
              padding: "4px",
              fontSize: "1rem",
              margin: 0,
              flexGrow: 1,
              cursor: "pointer",
            }}
          >
            {editedTitle}
          </h4>
        )}
        {/* Display the task list name */}
        <span style={{ marginLeft: "8px", fontSize: "0.9rem" }}>from TaskList: </span>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          onBlur={handleListNameBlur}
          style={{
            backgroundColor: "#d6eaff",
            border: "1px solid lightgrey",
            padding: "4px",
            fontSize: "0.9rem",
            width: "200px",
            marginLeft: "4px",
          }}
        />
      </div>

      {/* Task body or other details */}
      <div style={{ marginTop: "8px" }}>
        <p>{task.body?.content || "No description provided."}</p>
        {/* If you want to display steps, uncomment below: */}
        {task.checklistItems && task.checklistItems.length > 0 && (
          <ul style={{ marginTop: "4px" }}>
            {task.checklistItems.map((step) => (
              <li key={step.id}>{step.displayName}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
