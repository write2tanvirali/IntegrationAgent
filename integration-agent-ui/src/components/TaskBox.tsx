import React from 'react';

interface TaskBoxProps {
  taskName: string;
  onClick: () => void;
}

const TaskBox: React.FC<TaskBoxProps> = ({ taskName, onClick }) => {
  return (
    <div
      className="p-4 bg-blue-200 rounded cursor-pointer mb-4 text-center hover:shadow-task-hover transition-all"
      onClick={onClick}
    >
      <p className="text-base">{taskName}</p>
    </div>
  );
};

export default TaskBox; 