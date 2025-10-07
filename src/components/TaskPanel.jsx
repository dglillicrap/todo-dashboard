// src/components/TaskPanel.jsx
import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import useTasks from '../hooks/useTasks';

const TaskPanel = ({ listId, refreshKey = 0, onSelectTask }) => {
const { instance } = useMsal();
const [newTask, setNewTask] = useState('');
const { tasks, loading: loadingTasks } = useTasks(listId, refreshKey);

const handleAddTask = async () => {
if (!newTask.trim() || !listId) return;
const account = instance.getActiveAccount();
if (!account) return;
let response;
try {
response = await instance.acquireTokenSilent({
scopes: ['Tasks.ReadWrite'],
account,
});
} catch (error) {
if (error instanceof InteractionRequiredAuthError) {
response = await instance.loginPopup({ scopes: ['Tasks.ReadWrite'] });
instance.setActiveAccount(response.account);
} else {
console.error('Error acquiring token:', error);
return;
}
}
await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks`, {
method: 'POST',
headers: {
Authorization: `Bearer ${response.accessToken}`,
'Content-Type': 'application/json',
},
body: JSON.stringify({ title: newTask }),
});
setNewTask('');
// Panels will re-fetch when refreshKey changes from parent if needed
};

const handleCompleteTask = async (taskId) => {
const account = instance.getActiveAccount();
if (!account) return;
let response;
try {
response = await instance.acquireTokenSilent({
scopes: ['Tasks.ReadWrite'],
account,
});
} catch (error) {
if (error instanceof InteractionRequiredAuthError) {
response = await instance.loginPopup({ scopes: ['Tasks.ReadWrite'] });
instance.setActiveAccount(response.account);
} else {
console.error('Error acquiring token:', error);
return;
}
}
await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks/${taskId}`, {
method: 'PATCH',
headers: {
Authorization: `Bearer ${response.accessToken}`,
'Content-Type': 'application/json',
},
body: JSON.stringify({ status: 'completed' }),
});
};

// Filter + sort (incomplete only, 🕳️/~ to bottom)
const incompleteTasks = (tasks || [])
.filter((task) => task.status !== 'completed')
.sort((a, b) => {
const aTitle = a.title || '';
const bTitle = b.title || '';
const aIsBottom = aTitle.startsWith('🕳️') || aTitle.startsWith('~');
const bIsBottom = bTitle.startsWith('🕳️') || bTitle.startsWith('~');
if (aIsBottom && !bIsBottom) return 1;
if (!aIsBottom && bIsBottom) return -1;
return aTitle.localeCompare(bTitle);
});

return (
<div>
{loadingTasks ? (
<p style={{ fontSize: '0.8rem' }}>Loading tasks...</p>
) : incompleteTasks.length === 0 ? (
<p style={{ fontSize: '0.8rem' }}>No tasks found.</p>
) : (
<ul style={{ fontSize: '0.8rem' }}>
{incompleteTasks.map((task) => (
<li key={task.id}>
<input
type="checkbox"
onChange={() => handleCompleteTask(task.id)}
style={{ marginRight: '6px' }}
/>
<span onClick={() => onSelectTask(task)}>{task.title}</span>
</li>
))}
</ul>
)}

<input
type="text"
value={newTask}
onChange={(e) => setNewTask(e.target.value)}
onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
placeholder="Add new task"
/* ✅ Light blue background, light grey border, keep text color */
style={{
width: '100%',
marginTop: '8px',
fontSize: '0.8rem',
backgroundColor: '#d6eaff', // same as page background
border: '1px solid #d0d0d0', // light grey border
color: 'inherit' // keep current text color
}}
/>
</div>
);
};

export default TaskPanel;
