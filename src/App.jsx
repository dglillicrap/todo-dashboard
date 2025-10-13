import React, { useState, useEffect } from 'react';
import TaskListSelector from './components/TaskListSelector';
import TaskPanel from './components/TaskPanel';
import PreviewPanel from './components/PreviewPanel';
import SignInButton from './components/SignInButton';
import useTaskLists from './hooks/useTaskLists';
import useTasks from './hooks/useTasks';

function App() {
  const { taskLists, selectedTaskList, setSelectedTaskList } = useTaskLists();
  const {
    tasks,
    addTask,
    toggleTaskComplete,
    updateTask,
    addStep,
    toggleStepComplete,
  } = useTasks(selectedTaskList?.id);

  const [selectedTask, setSelectedTask] = useState(null);

  // Reset selected task when the task list changes
  useEffect(() => {
    setSelectedTask(null);
  }, [selectedTaskList]);

  const handleAddTask = (title) => {
    if (selectedTaskList) {
      addTask(selectedTaskList.id, title);
    }
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
  };

  return (
    <div className="App">
      {/* Sign in/out buttons and group selector can go here if needed */}
      <SignInButton />

      <div className="panels-container">
        <div className="list-panel">
          <TaskListSelector
            taskLists={taskLists}
            selectedTaskList={selectedTaskList}
            onSelectTaskList={setSelectedTaskList}
          />
        </div>

        <div className="task-panels">
          {/* Show one TaskPanel per group (or however many columns you need) */}
          {selectedTaskList && (
            <TaskPanel
              selectedTaskList={selectedTaskList}
              tasks={tasks}
              onSelectTask={handleSelectTask}
              onAddTask={handleAddTask}
              onToggleComplete={toggleTaskComplete}
            />
          )}
        </div>

        <div className="preview-panel">
          <PreviewPanel
            task={selectedTask}
            taskListName={selectedTaskList ? selectedTaskList.displayName : ''}
            updateTask={updateTask}
            addStep={addStep}
            toggleStepComplete={toggleStepComplete}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
