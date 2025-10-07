// src/components/TaskListSelector.jsx
import React from 'react';

const TaskListSelector = ({ taskLists, selectedListId, onSelect }) => {
  return (
    <select value={selectedListId} onChange={(e) => onSelect(e.target.value)}>
      <option value="">Select a task list</option>
      {taskLists.map((list) => (
        <option key={list.id} value={list.id}>
          {list.displayName}
        </option>
      ))}
    </select>
  );
};

export default TaskListSelector;