import React, { useState } from 'react';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import SignInButton from './components/SignInButton';
import TaskListSelector from './components/TaskListSelector';
import TaskPanel from './components/TaskPanel';
import PreviewPanel from './components/PreviewPanel';
import { useTaskLists } from './hooks/useTaskLists';
import { useTasks } from './hooks/useTasks';

const App = () => {
  const { taskLists, selectedLists, setSelectedLists } = useTaskLists();
  const {
    tasksByList,
    addTask,
    updateTask,
    updateStep,
    selectedTask,
    setSelectedTask,
  } = useTasks(selectedLists);
  const [currentGroup, setCurrentGroup] = useState('1');

  const handleSelectTask = (listId, task) => {
    const listName =
      taskLists.find((list) => list.id === listId)?.displayName || 'Untitled';
    setSelectedTask({ listId, listName, task });
  };

  return (
    <div className="dashboard">
      <AuthenticatedTemplate>
        <div className="top-bar">
          <div className="top-left">
            <SignInButton />
          </div>
          <div className="top-center">
            <button onClick={() => {/* existing save logic */}}>
              Save Current Setup
            </button>
          </div>
          <div className="top-right">
            <select
              value={currentGroup}
              onChange={(e) => setCurrentGroup(e.target.value)}
            >
              <option value="1">Group 1</option>
              <option value="2">Group 2</option>
              {/* …other group choices… */}
            </select>
          </div>
        </div>

        <div className="panel-grid">
          {selectedLists.map((listId) => {
            const listName =
              taskLists.find((l) => l.id === listId)?.displayName || 'Untitled';
            const listTasks = tasksByList[listId] || [];
            return (
              <TaskPanel
                key={listId}
                listId={listId}
                listName={listName}
                tasks={listTasks}
                addTask={(title) => addTask(listId, title)}
                updateTask={(task) => updateTask(listId, task)}
                onSelectTask={(task) => handleSelectTask(listId, task)}
              />
            );
          })}
          <PreviewPanel
            selectedTask={selectedTask}
            updateTask={updateTask}
            updateStep={updateStep}
          />
        </div>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <SignInButton />
      </UnauthenticatedTemplate>
    </div>
  );
};

export default App;
