<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from 'react';
import useTaskLists from './hooks/useTaskLists';
import useTasks from './hooks/useTasks';
import TaskListSelector from './components/TaskListSelector';
import TaskPanel from './components/TaskPanel';
import SignInButton from './components/SignInButton';
import PreviewPanel from './components/PreviewPanel';
import './styles.css';

const App = () => {
  const { taskLists, loading: loadingLists } = useTaskLists();
  const [selectedGroup, setSelectedGroup] = useState('Group 1');
  const [panelSelections, setPanelSelections] = useState(Array(6).fill(''));
  const [savedGroups, setSavedGroups] = useState(() => {
    const saved = localStorage.getItem('savedGroups');
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (savedGroups[selectedGroup]) {
      setPanelSelections(savedGroups[selectedGroup]);
    }
  }, [selectedGroup, savedGroups]);

  const handlePanelListChange = (panelIndex, listId) => {
    const updated = [...panelSelections];
    updated[panelIndex] = listId;
    setPanelSelections(updated);
  };

  const handleSaveGroup = () => {
    const updatedGroups = {
      ...savedGroups,
      [selectedGroup]: [...panelSelections],
    };
    setSavedGroups(updatedGroups);
    localStorage.setItem('savedGroups', JSON.stringify(updatedGroups));
    alert(`Saved current setup to ${selectedGroup}`);
>>>>>>> d7bbb9aa (Describe the change)
  };

  const handleTaskTitleUpdate = (taskId, newTitle) => {
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => ({ ...prev, title: newTitle }));
    }
    setRefreshKey((prev) => prev + 1);
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
<<<<<<< HEAD

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
=======
        <div className="top-center">
          <button onClick={handleSaveGroup}>Save Current Setup</button>
        </div>
        <div className="top-right">
          <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
            <option value="Group 1">Group 1</option>
            <option value="Group 2">Group 2</option>
            <option value="Group 3">Group 3</option>
          </select>
        </div>
      </div>

      <div className="panel-grid">
        {[...Array(6)].map((_, index) => {
          const listId = panelSelections[index];
          const { tasks, loading: loadingTasks } = useTasks(listId, refreshKey);

          return (
            <div key={index} className="panel">
              {index === 5 ? (
                <PreviewPanel
                  task={selectedTask}
                  listId={selectedTask?.parentListId}
                  onTaskTitleUpdate={handleTaskTitleUpdate}
                />
              ) : (
                <>
                  <TaskListSelector
                    taskLists={taskLists}
                    selectedListId={listId}
                    onSelect={(id) => handlePanelListChange(index, id)}
                  />
                  {!listId ? (
                    <p>Loading list...</p>
                  ) : loadingTasks ? (
                    <p>Loading tasks...</p>
                  ) : (
                    <TaskPanel
                      tasks={tasks}
                      onSelectTask={(task) =>
                        setSelectedTask({ ...task, parentListId: listId })
                      }
                      listId={listId}
                    />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
>>>>>>> d7bbb9aa (Describe the change)
    </div>
  );
};

export default App;