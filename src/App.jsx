import React, { useState, useEffect } from 'react';
import useTaskLists from './hooks/useTaskLists';
import useTasks from './hooks/useTasks';
import TaskPanel from './components/TaskPanel';
import TaskListSelector from './components/TaskListSelector';
import PreviewPanel from './components/PreviewPanel';
import SignInButton from './components/SignInButton';
import './styles.css';

const tasksPerPanel = 3;

const App = () => {
  const { taskLists } = useTaskLists();

  // Group selection state
  const [selectedGroup, setSelectedGroup] = useState('Group 1');
  const [savedGroups, setSavedGroups] = useState(() => {
    const saved = localStorage.getItem('savedGroups');
    return saved ? JSON.parse(saved) : {};
  });
  const [panelSelections, setPanelSelections] = useState(
    savedGroups[selectedGroup] || Array(6).fill('')
  );

  // Selected task for preview
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskList, setSelectedTaskList] = useState('');
  const [selectedListName, setSelectedListName] = useState('');

  // Refresh key for tasks reloading
  const [refreshKey, setRefreshKey] = useState(0);

  // Load tasks for all selected list IDs
  const taskListIds = panelSelections.filter((id) => id !== '');
  const { tasks } = useTasks(taskListIds, refreshKey);

  // Reapply saved groups when the group changes
  useEffect(() => {
    if (savedGroups[selectedGroup]) {
      setPanelSelections(savedGroups[selectedGroup]);
    }
  }, [selectedGroup, savedGroups]);

  // Group list IDs into panels
  const panelsGrouped = [];
  for (let i = 0; i < taskListIds.length; i += tasksPerPanel) {
    panelsGrouped.push(taskListIds.slice(i, i + tasksPerPanel));
  }

  // Flatten tasks and list IDs per panel
  const groupTasks = panelsGrouped.map((panel) =>
    panel.flatMap((listId) => tasks[listId] || [])
  );
  const groupTaskLists = panelsGrouped.map((panel) =>
    panel.flatMap((listId) => {
      const listTasks = tasks[listId] || [];
      return listTasks.map(() => listId);
    })
  );

  // User clicked a task → set selected task, its list ID, and list name
  const handleSelectTask = (task, listId) => {
    setSelectedTask(task);
    setSelectedTaskList(listId);
    const listDetails = taskLists.find((list) => list.id === listId);
    setSelectedListName(listDetails ? listDetails.displayName : '');
  };

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
  };

  return (
    <div className="dashboard">
      <div className="top-bar">
        <div className="top-left">
          <SignInButton />
        </div>
        <div className="top-center">
          <button onClick={handleSaveGroup}>Save Current Setup</button>
        </div>
        <div className="top-right">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="Group 1">Group 1</option>
            <option value="Group 2">Group 2</option>
            <option value="Group 3">Group 3</option>
          </select>
        </div>
      </div>

      <div className="panel-grid">
        {[...Array(6)].map((_, index) => {
          // Last panel is the preview
          if (index === 5) {
            return (
              <div key={index} className="panel">
                <PreviewPanel
                  task={selectedTask}
                  tasks={tasks[selectedTaskList] || []}
                  listId={selectedTaskList}
                  listName={selectedListName}
                  refreshKey={refreshKey}
                  // Provide callbacks so PreviewPanel can refresh tasks after edits
                  onRefresh={() => setRefreshKey((prev) => prev + 1)}
                />
              </div>
            );
          }

          // Panels 0–4 show task lists
          const panelListIds = panelsGrouped[index] || [];
          const panelTasks = groupTasks[index] || [];
          const panelListIdsForTasks = groupTaskLists[index] || [];

          return (
            <div key={index} className="panel">
              <TaskListSelector
                taskLists={taskLists}
                selectedListId={panelSelections[index]}
                onSelect={(id) => handlePanelListChange(index, id)}
              />
              {panelListIds.length === 0 ? (
                <p>No tasks found.</p>
              ) : (
                <TaskPanel
                  tasks={panelTasks}
                  taskListId={panelListIdsForTasks}
                  selectedList={selectedTaskList}
                  setSelectedList={setSelectedTaskList}
                  onSelectTask={(task, listId) => handleSelectTask(task, listId)}
                  refreshKey={refreshKey}
                  onRefresh={() => setRefreshKey((prev) => prev + 1)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
