import React, { useState, useEffect } from 'react';
import useTaskLists from './hooks/useTaskLists';
import TaskListSelector from './components/TaskListSelector';
import TaskPanel from './components/TaskPanel';
import SignInButton from './components/SignInButton';
import PreviewPanel from './components/PreviewPanel';
import './styles.css';

const App = () => {
const { taskLists } = useTaskLists();
const [selectedGroup, setSelectedGroup] = useState('Group 1');
const [panelSelections, setPanelSelections] = useState(() => {
const saved = localStorage.getItem('savedGroups');
const parsed = saved ? JSON.parse(saved) : {};
return parsed[selectedGroup] || Array(6).fill('');
});
const [savedGroups, setSavedGroups] = useState(() => {
const saved = localStorage.getItem('savedGroups');
return saved ? JSON.parse(saved) : {};
});
const [selectedTask, setSelectedTask] = useState(null);
const [refreshKey, setRefreshKey] = useState(0);

// Tab title
useEffect(() => {
document.title = '✅ DGL ToDo';
}, []);

// Load selections when group changes
useEffect(() => {
if (savedGroups[selectedGroup]) {
setPanelSelections(savedGroups[selectedGroup]);
} else {
setPanelSelections(Array(6).fill(''));
}
}, [selectedGroup, savedGroups]);

const handlePanelListChange = (panelIndex, listId) => {
const updated = [...panelSelections];
updated[panelIndex] = listId;
setPanelSelections(updated);
};

const handleSaveGroup = () => {
const updatedGroups = { ...savedGroups, [selectedGroup]: [...panelSelections] };
setSavedGroups(updatedGroups);
localStorage.setItem('savedGroups', JSON.stringify(updatedGroups));
alert(`Saved current setup to ${selectedGroup}`);
};

const handleTaskTitleUpdate = (taskId, newTitle) => {
if (selectedTask?.id === taskId) {
setSelectedTask(prev => ({ ...prev, title: newTitle }));
}
setRefreshKey(prev => prev + 1); // trigger re-fetch in panels
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
<select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
<option>Group 1</option>
<option>Group 2</option>
<option>Group 3</option>
</select>
</div>
</div>

<div className="panel-grid">
{[...Array(6)].map((_, index) => {
const listId = panelSelections[index];
const panelKey = `${index}-${listId || 'none'}-${refreshKey}`; // remount each panel on refresh

return (
<div className="panel" key={panelKey}>
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
<p style={{ fontSize: '0.8rem' }}>Select a task list</p>
) : (
<TaskPanel
listId={listId}
refreshKey={refreshKey}
onSelectTask={(task) => setSelectedTask({ ...task, parentListId: listId })}
/>
)}
</>
)}
</div>
);
})}
</div>
</div>
);
};

export default App;
