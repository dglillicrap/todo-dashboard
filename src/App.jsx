// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import TaskListSelector from './components/TaskListSelector';
import TaskPanel from './components/TaskPanel';
import PreviewPanel from './components/PreviewPanel';
import SignInButton from './components/SignInButton';
import useTaskLists from './hooks/useTaskLists';
import './styles.css';

const App = () => {
  const { instance, accounts } = useMsal();
  const { taskLists, loading: listsLoading } = useTaskLists();
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedListId, setSelectedListId] = useState('');
  const [selectedListName, setSelectedListName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [group, setGroup] = useState('1');
  const [groupConfigs, setGroupConfigs] = useState({});

  const activeAccount = accounts[0] || null;

  useEffect(() => {
    const saved = localStorage.getItem('groupConfigs');
    if (saved) setGroupConfigs(JSON.parse(saved));
  }, []);

  const handleSaveGroupSetup = () => {
    const updated = {
      ...groupConfigs,
      [group]: {
        listId: selectedListId,
        listName: selectedListName,
      },
    };
    setGroupConfigs(updated);
    localStorage.setItem('groupConfigs', JSON.stringify(updated));
  };

  const handleSelectTask = (task, listId, listName) => {
    setSelectedTask(task);
    setSelectedListId(listId);
    setSelectedListName(listName);
  };

  const handleTaskTitleUpdate = (taskId, newTitle) => {
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, title: newTitle });
      setRefreshKey((prev) => prev + 1);
    }
  };

  const isAuthenticated = !!activeAccount;

  return (
    <div className="app-container">
      {!isAuthenticated ? (
        <div className="signin-container">
          <p>Please sign in to continue...</p>
          <SignInButton />
        </div>
      ) : (
        <>
          <div className="top-bar">
            <SignInButton />
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="group-dropdown"
            >
              <option value="1">Group 1</option>
              <option value="2">Group 2</option>
              <option value="3">Group 3</option>
            </select>
            <button onClick={handleSaveGroupSetup} className="save-button">
              Save Current Setup
            </button>
          </div>

          <div className="dashboard-grid">
            {[1, 2, 3, 4, 5].map((panelIndex) => (
              <TaskPanel
                key={panelIndex}
                listId={groupConfigs[group]?.[`panel${panelIndex}`]?.listId || ''}
                listName={groupConfigs[group]?.[`panel${panelIndex}`]?.listName || ''}
                refreshKey={refreshKey}
                onSelectTask={handleSelectTask}
              />
            ))}
            <div className="preview-panel">
              <PreviewPanel
                task={selectedTask}
                listId={selectedListId}
                listName={selectedListName}
                onTaskTitleUpdate={handleTaskTitleUpdate}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
