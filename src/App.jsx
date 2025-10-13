import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';

import SignInButton from './components/SignInButton';
import useTasks from './hooks/useTasks';
import useTaskLists from './hooks/useTaskLists';
import TaskListSelector from './components/TaskListSelector';
import TaskPanel from './components/TaskPanel';
import PreviewPanel from './components/PreviewPanel';

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: '19f19e6c-8ddc-44c0-b1fd-7b0e8a549d7b',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'http://localhost:3000'
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  }
});

function App() {
  const { instance } = useMsal();
  const { taskLists, groupName, fetchTaskLists, setGroupName } = useTaskLists();
  const { tasks, fetchTasks } = useTasks();

  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (instance.getActiveAccount()) {
      fetchTaskLists();
    }
  }, [instance, fetchTaskLists]);

  useEffect(() => {
    if (selectedListId) {
      fetchTasks(selectedListId, groupName);
    }
  }, [selectedListId, groupName, fetchTasks]);

  return (
    <div>
      <SignInButton />
      {instance.getActiveAccount() && (
        <>
          <button onClick={() => instance.logoutRedirect()}>Sign Out</button>
          <TaskListSelector
            lists={taskLists.filter(list => list.groupName === groupName)}
            selectedListId={selectedListId}
            onChange={setSelectedListId}
          />
          <TaskPanel
            listId={selectedListId}
            tasks={tasks}
            onSelectTask={setSelectedTask}
            groupName={groupName}
          />
          <PreviewPanel
            task={selectedTask}
            listId={selectedListId}
            onTaskTitleUpdate={(taskId, newTitle) => {
              setSelectedTask((prev) =>
                prev && prev.id === taskId ? { ...prev, title: newTitle } : prev
              );
            }}
          />
        </>
      )}
    </div>
  );
}

export default App;
