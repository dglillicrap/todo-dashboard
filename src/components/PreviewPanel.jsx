// src/components/PreviewPanel.jsx
import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

export default function PreviewPanel({ task, listId, onTaskTitleUpdate }) {
  const { instance } = useMsal();
  const [steps, setSteps] = useState([]);
  const [newStep, setNewStep] = useState('');
  const [notes, setNotes] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

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
        const response = await instance.loginPopup({
          scopes: ['Tasks.ReadWrite'],
        });
        instance.setActiveAccount(response.account);
        return response;
      } else {
        console.error('Token acquisition failed:', error);
        return null;
      }
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
        {
          headers: {
            Authorization: `Bearer ${response.accessToken}`,
          },
        }
      );
      const stepsData = await stepsRes.json();
      const sortedSteps = (stepsData.value || [])
        .filter((step) => !step.isChecked)
        .sort((a, b) => {
          const aTitle = a.displayName || '';
          const bTitle = b.displayName || '';
          const aIsBottom = aTitle.startsWith('🕳️');
          const bIsBottom = bTitle.startsWith('🕳️');
          if (aIsBottom && !bIsBottom) return 1;
          if (!aIsBottom && bIsBottom) return -1;
          return aTitle.localeCompare(bTitle);
        });
      setSteps(sortedSteps);

      const taskRes = await fetch(
        `https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks/${task.id}`,
        {
          headers: {
            Authorization: `Bearer ${response.accessToken}`,
          },
        }
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

    const res = await fetch(
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

    const newItem = await res.json();
    const updatedSteps = [...steps, newItem].sort((a, b) => {
      const aTitle = a.displayName || '';
      const bTitle = b.displayName || '';
      const aIsBottom = aTitle.startsWith('🕳️');
      const bIsBottom = bTitle.startsWith('🕳️');
      if (aIsBottom && !bIsBottom) return 1;
      if (!aIsBottom && bIsBottom) return -1;
      return aTitle.localeCompare(bTitle);
    });
    setSteps(updatedSteps);
    setNewStep('');
  };

  const updateStepName = async (stepId, newName) => {
    const response = await getToken();
    if (!response) return;

    await fetch(
      `https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks/${task.id}/checklistItems/${stepId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName: newName }),
      }
    );

    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, displayName: newName } : step
      )
    );
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
    if (typeof onTaskTitleUpdate === 'function') {
      onTaskTitleUpdate(task.id, editedTitle);
    }
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
          body: {
            contentType: 'text',
            content: notes,
          },
        }),
      }
    );
  };

  if (!task) return <p>Select a task to preview</p>;

  return (
    <div>
      <h3 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Task Pane</h3>
      {editingTitle ? (
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={updateTaskTitle}
          style={{ fontSize: '0.8rem', width: '100%', marginBottom: '6px' }}
        />
      ) : (
        <h4
          style={{ fontSize: '0.8rem', cursor: 'pointer', marginBottom: '6px' }}
          onClick={() => setEditingTitle(true)}
        >
          {editedTitle}
        </h4>
      )}
      <ul style={{ fontSize: '0.8rem' }}>
        {steps.map((step) => (
          <li key={step.id}>
            <input
              type="text"
              value={step.displayName}
              onChange={(e) => updateStepName(step.id, e.target.value)}
              style={{ fontSize: '0.8rem', width: '90%' }}
            />
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newStep}
        onChange={(e) => setNewStep(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
        placeholder="Add step"
        style={{ width: '100%', marginTop: '8px', fontSize: '0.8rem' }}
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={updateTaskNotes}
        placeholder="Task notes"
        style={{ width: '100%', marginTop: '8px', fontSize: '0.8rem', height: '60px' }}
      />
    </div>
  );
}