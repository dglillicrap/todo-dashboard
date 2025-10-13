import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import TaskPanel from "./TaskPanel";
import PreviewPanel from "./PreviewPanel";
import useTaskLists from "./useTaskLists";
import useTasks from "./useTasks";

const App = () => {
  const { instance } = useMsal();
  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch all task lists and their loading state.
  const { taskLists, loading: listsLoading } = useTaskLists();
  // Fetch tasks for the currently selected list.
  const { tasks, loading: tasksLoading } = useTasks(selectedListId);

  // Sign in/out handlers
  const handleSignIn = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignOut = () => {
    instance.logoutPopup();
  };

  // Called when a list selector is changed
  const handleListChange = (event) => {
    const listId = event.target.value;
    setSelectedListId(listId);
    setSelectedTask(null);
  };

  // Called when a task is clicked in a panel
  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  // Render 5 panels for selecting and displaying tasks.
  const panels = Array.from({ length: 5 });

  return (
    <div className="app">
      <header>
      {/* Sign-in buttons */}
        <button onClick={handleSignIn}>Sign In</button>
        <button onClick={handleSignOut}>Sign Out</button>
      </header>
      <div className="panels">
        {/* Show five panels that all use the same current list and tasks */}
        {panels.map((_, index) => (
          <TaskPanel
            key={index}
            index={index}
            taskLists={taskLists}
            tasks={tasks}
            loading={listsLoading || tasksLoading}
            selectedListId={selectedListId}
            onListChange={handleListChange}
            onSelectTask={handleTaskClick}
          />
        ))}
        {/* Preview panel shows the selected task details */}
        <PreviewPanel
          task={selectedTask}
          taskLists={taskLists}
          selectedListId={selectedListId}
        />
      </div>
    </div>
  );
};

export default App;
