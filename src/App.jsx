import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import SignInButton from './SignInButton';
import TaskListSelector from './TaskListSelector';
import TaskPanel from './TaskPanel';
import PreviewPanel from './PreviewPanel';
import useTaskLists from './useTaskLists';
import useTasks from './useTasks';
import './styles.css';

const MAX_PANELS = 4;

function App() {
  const { instance } = useMsal();
  const { taskLists, fetchTaskLists } = useTaskLists();
  const { tasks, fetchTasks } = useTasks();

  // which list each of the four panels should display; load from localStorage if present
  const [panelSelections, setPanelSelections] = useState(() => {
    const saved = localStorage.getItem('panelSelections');
    return saved ? JSON.parse(saved) : new Array(MAX_PANELS).fill('');
  });
  // currently selected task and its list id for the preview pane
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  // refresh key to force re-fetching tasks after editing
  const [refreshKey, setRefreshKey] = useState(0);
  // current group name; also persisted in localStorage
  const [groupName, setGroupName] = useState(() => localStorage.getItem('groupName') || 'Group 1');

  // fetch task lists after login
  useEffect(() => {
    if (instance.getActiveAccount()) {
      fetchTaskLists();
    }
  }, [instance, fetchTaskLists]);

  // fetch tasks for each selected list whenever selections or refreshKey change
  useEffect(() => {
    panelSelections.forEach(listId => {
      if (listId) {
        fetchTasks(listId);
      }
    });
  }, [panelSelections, fetchTasks, refreshKey]);

  // select a list for a specific panel column
  const handleListSelect = (listId, index) => {
    const newSelections = [...panelSelections];
    newSelections[index] = listId;
    setPanelSelections(newSelections);
    localStorage.setItem('panelSelections', JSON.stringify(newSelections));
    setSelectedTask(null);
    setSelectedListId(null);
  };

  // select a task to preview
  const handleTaskSelect = (task, listId) => {
    setSelectedTask(task);
    setSelectedListId(listId);
  };

  // force reload of tasks after editing
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // persist current setup (panels + group name)
  const saveSetup = () => {
    localStorage.setItem('panelSelections', JSON.stringify(panelSelections));
    localStorage.setItem('groupName', groupName);
    alert('Current setup saved');
  };

  return (
    <div>
      <SignInButton />
      {instance.getActiveAccount() && (
        <>
          <div className="app-header">
            <button onClick={saveSetup}>Save Current Setup</button>
            <select value={groupName} onChange={e => setGroupName(e.target.value)}>
              {['Group 1', 'Group 2', 'Group 3', 'Group 4', 'Group 5'].map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="app-container">
            {panelSelections.map((listId, index) => (
              <div className="panel-column" key={index}>
                <TaskListSelector
                  taskLists={taskLists}
                  selectedListId={listId}
                  onSelect={id => handleListSelect(id, index)}
                />
                <TaskPanel
                  listId={listId}
                  tasks={tasks[listId] || []}
                  selectedTask={selectedTask}
                  onTaskSelect={task => handleTaskSelect(task, listId)}
                  onRefresh={handleRefresh}
                />
              </div>
            ))}
            <PreviewPanel
              task={selectedTask}
              tasks={selectedListId ? tasks[selectedListId] || [] : []}
              listId={selectedListId}
              listName={taskLists.find(l => l.id === selectedListId)?.displayName}
              refreshKey={refreshKey}
              onRefresh={handleRefresh}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
