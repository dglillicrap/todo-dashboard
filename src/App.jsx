import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import TaskPanel from './components/TaskPanel';
import PreviewPanel from './components/PreviewPanel';
import SignInButton from './components/SignInButton';
import './styles.css';

const App = () => {
  const { accounts } = useMsal();

  // Preview selection
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedListId, setSelectedListId] = useState('');
  const [selectedListName, setSelectedListName] = useState('');

  // Persisted panel configs per group: panel1..panel5 -> { listId, listName }
  const [group, setGroup] = useState('1');
  const [groupConfigs, setGroupConfigs] = useState({});

  // Refresh key for panels
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('groupConfigs');
    if (saved) setGroupConfigs(JSON.parse(saved));
  }, []);

  const handleSaveGroupSetup = () => {
    localStorage.setItem('groupConfigs', JSON.stringify(groupConfigs));
  };

  // Minimal change: accept task + listId + listName from TaskPanel
  const handleSelectTask = (task, listId, listName) => {
    setSelectedTask(task);
    setSelectedListId(listId);
    setSelectedListName(listName);
  };

  const isAuthenticated = !!accounts[0];

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
              title="Group"
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
            {[1, 2, 3, 4, 5].map((i) => {
              const cfg = groupConfigs[group]?.[`panel${i}`] || {};
              return (
                <TaskPanel
                  key={i}
                  // Expect these to be set elsewhere in your UI; if empty, panel shows “No tasks found.”
                  listId={cfg.listId || ''}
                  listName={cfg.listName || ''}
                  refreshKey={refreshKey}
                  onSelectTask={handleSelectTask}
                  // If you allow changing lists inside a panel, update groupConfigs here accordingly.
                  onPersistPanelConfig={(newCfg) => {
                    setGroupConfigs((prev) => {
                      const next = { ...prev, [group]: { ...(prev[group] || {}) } };
                      next[group][`panel${i}`] = { ...(next[group][`panel${i}`] || {}), ...newCfg };
                      return next;
                    });
                  }}
                />
              );
            })}

            <div className="preview-panel">
              <PreviewPanel
                task={selectedTask}
                listId={selectedListId}
                listName={selectedListName}
                onTaskTitleUpdate={() => setRefreshKey((k) => k + 1)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
