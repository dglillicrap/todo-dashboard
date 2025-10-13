// src/components/PreviewPanel.jsx
import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

export default function PreviewPanel({ task, listId, listName, onTaskTitleUpdate }) {
  const { instance } = useMsal();
  const [steps, setSteps] = useState([]);
  const [newStep, setNewStep] = useState('');
  const [notes, setNotes] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedListName, setEditedListName] = useState(listName || '');

  useEffect(() => {
    setEditedListName(listName || '');
  }, [listName]);

  const getToken = async () => {
    const account = instance.getActiveAccount();
    if (!account) return null;
    try {
      return await instance.acquireTokenSilent({
        scopes: ['Tasks.ReadWrite'],
        account,
      });
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        const response = await instance.loginPopup({ scopes: ['Tasks.ReadWrite'] });
        instance.setActiveAccount(response.account);
        return response;
      }
      console.error('Token acquisition failed:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchStepsAndNotes = async () => {
      if (!task || !listId) return;
      const account = instance.getActiveAccount();
      if (!account) return;

      const response = await instance.acquireTokenSilent({
        scopes: ['Tasks.Read'],
        account,
      });

      const stepsRes = await fetch(
        `https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks/${task.id}/checklistItems`,
        { headers: { Authorization: `Bearer ${response.accessToken}` } }
      );
      const stepsData = await stepsRes.json();
      const sortedSteps = (stepsData.value || [])
        .filter((step) => !step.isChecked)
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
      setSteps(sortedSteps);

      const taskRes = await fetch(
        `https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks/${task.id}`,
        { headers: { Authorization: `Bearer ${response.accessToken}` } }
      );
      const taskData = await taskRes.json();
      setNotes(taskData.body?.content || '');
      setEditedTitle(taskData.title || '');
    };
    fetchStepsAndNotes();
  }, [task, listId, instance]);

  const handleAddStep = async () => {
    if (!newStep.trim() || !task || !listId) return;
    const response = await getToken();
    if (!response) return;

    await fetch(
      `https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks/${task.id}/checklistItems`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName: newStep }),
      }
    );
    setNewStep('');
    window.dispatchEvent(new CustomEvent('refreshTasks', { detail: listId }));
  };

  const updateTaskTitle = async () => {
    const response = await getToken();
    if (!response) return;
    await fetch(
      `https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks/${task.id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editedTitle }),
      }
    );
    setEditingTitle(false);
    if (typeof onTaskTitleUpdate === 'function') onTaskTitleUpdate(task.id, editedTitle);
  };

  const updateTaskNotes = async () => {
    const response = await getToken();
    if (!response) return;
    await fetch(
      `https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks/${task.id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: { contentType: 'text', content: notes },
        }),
      }
    );
  };

  if (!task) return <p>Select a task to preview</p>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h3 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Task Pane</h3>
        <span style={{ fontSize: '0.8rem', color: '#555' }}>from TaskList:</span>
        <input
          type="text"
          value={editedListName}
          onChange={(e) => setEditedListName(e.target.value)}
          style={{
            backgroundColor: '#d6eaff',
            border: '1px solid #d0d0d0',
            borderRadius: '4px',
            fontSize: '0.8rem',
            padding: '2px 6px',
            flex: '1',
          }}
        />
      </div>

      {editingTitle ? (
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={updateTaskTitle}
          style={{
            fontSize: '0.8rem',
            width: '100%',
            backgroundColor: '#d6eaff',
            border: '1px solid #d0d0d0',
            borderRadius: '4px',
            padding: '4px',
            marginTop: '6px',
            marginBottom: '6px',
          }}
        />
      ) : (
        <h4
          style={{
            fontSize: '0.8rem',
            cursor: 'pointer',
            margin: '6px 0',
            padding: '4px',
            border: '1px solid #d0d0d0',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
          }}
          onClick={() => setEditingTitle(true)}
        >
          {editedTitle}
        </h4>
      )}

      <ul style={{ fontSize: '0.8rem' }}>
        {steps.map((step) => (
          <li key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input type="checkbox" checked={false} readOnly />
            <span>{step.displayName}</span>
          </li>
        ))}
      </ul>

      <input
        type="text"
        value={newStep}
        onChange={(e) => setNewStep(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
        placeholder="Add step"
        style={{
          width: '100%',
          marginTop: '8px',
          fontSize: '0.8rem',
          backgroundColor: '#d6eaff',
          border: '1px solid #d0d0d0',
        }}
      />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={updateTaskNotes}
        placeholder="Task notes"
        style={{
          width: '100%',
          marginTop: '8px',
          fontSize: '0.8rem',
          height: '60px',
        }}
      />
    </div>
  );
}
