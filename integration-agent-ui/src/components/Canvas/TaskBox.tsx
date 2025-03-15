import React, { useState } from 'react';
import { MoreVert, Delete, Edit, DragIndicator, CheckCircle } from '@mui/icons-material';
import TaskForm from './TaskForm';
import { Task } from '../../types';

interface TaskBoxProps {
  task: Task;
  onDragStart: () => void;
  onUpdate: (task: Task) => void;
  onDelete: () => void;
}

const TaskBox: React.FC<TaskBoxProps> = ({ task, onDragStart, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete();
    setShowMenu(false);
  };

  // Task type colors
  const getTypeColor = () => {
    switch(task.type) {
      case 'Action': return 'bg-blue-50 border-blue-200';
      case 'Input': return 'bg-green-50 border-green-200';
      case 'Output': return 'bg-purple-50 border-purple-200';
      case 'Logic': return 'bg-amber-50 border-amber-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeTextColor = () => {
    switch(task.type) {
      case 'Action': return 'text-blue-700';
      case 'Input': return 'text-green-700';
      case 'Output': return 'text-purple-700';
      case 'Logic': return 'text-amber-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        style={{
          position: 'absolute',
          left: task.position.x,
          top: task.position.y,
        }}
        className="w-48 bg-white rounded-lg shadow-task hover:shadow-task-hover cursor-move transition-all duration-300 z-10 border border-gray-200 group"
      >
        {/* Drag handle indicator */}
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DragIndicator fontSize="small" className="text-gray-500" />
        </div>
        
        <div className={`flex justify-between items-center ${getTypeColor()} p-2 rounded-t-lg border-b ${getTypeTextColor()}`}>
          <span className="text-xs font-medium flex items-center">
            {task.type}
          </span>
          <button 
            className="text-gray-500 hover:text-gray-700 rounded-full hover:bg-white p-1 transition-colors"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVert fontSize="small" />
          </button>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium flex items-center">
            {task.name}
            {task.response && 
              <CheckCircle className="ml-1 text-green-500" style={{ fontSize: '14px' }} />
            }
          </h3>
          {task.input && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              Input: {task.input}
            </p>
          )}
        </div>
        
        {/* Context Menu */}
        {showMenu && (
          <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-xl overflow-hidden z-20 border border-gray-100 backdrop-blur-sm bg-white/90">
            <div className="py-1">
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                onClick={handleEdit}
              >
                <Edit fontSize="small" className="mr-2 text-blue-500" />
                Edit Task
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                onClick={handleDelete}
              >
                <Delete fontSize="small" className="mr-2" />
                Delete Task
              </button>
            </div>
          </div>
        )}
        
        {/* Quick action buttons that appear on hover */}
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col space-y-1">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-md transition-colors" 
            onClick={handleEdit}
          >
            <Edit fontSize="small" />
          </button>
          <button 
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors" 
            onClick={handleDelete}
          >
            <Delete fontSize="small" />
          </button>
        </div>
      </div>

      {/* Edit Dialog */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 animate-fadeIn">
            <TaskForm
              task={task}
              onSubmit={(updatedTask) => {
                onUpdate(updatedTask);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TaskBox; 