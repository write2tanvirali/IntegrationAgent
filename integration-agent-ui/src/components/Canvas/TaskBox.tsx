import React, { useState } from 'react';
import { MoreVertIcon, DeleteIcon, EditIcon, DragIndicatorIcon, CheckCircleIcon } from '../Icons';
import TaskForm from './TaskForm';
import { Task, TaskType } from '../../types';

interface TaskBoxProps {
  task: Task;
  onDragStart: () => void;
  onUpdate: (task: Task) => void;
  onDelete: () => void;
}

const TaskBox: React.FC<TaskBoxProps> = ({ task, onDragStart, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      case TaskType.Action: return 'bg-blue-50 border-blue-200';
      case TaskType.Input: return 'bg-green-50 border-green-200';
      case TaskType.Output: return 'bg-purple-50 border-purple-200';
      case TaskType.Logic: return 'bg-amber-50 border-amber-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeTextColor = () => {
    switch(task.type) {
      case TaskType.Action: return 'text-blue-700';
      case TaskType.Input: return 'text-green-700';
      case TaskType.Output: return 'text-purple-700';
      case TaskType.Logic: return 'text-amber-700';
      default: return 'text-gray-700';
    }
  };

  // Get icon based on task type
  const getTaskIcon = () => {
    switch(task.type) {
      case TaskType.Action: 
        return (
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case TaskType.Input:
        return (
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H16M16 12L9 5M16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case TaskType.Output:
        return (
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12H8M8 12L15 5M8 12L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case TaskType.Logic:
        return (
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3V21M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
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
        className="task-box group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Drag handle indicator */}
        <div className="absolute -top-3 -left-3 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DragIndicatorIcon size="sm" className="text-gray-500" />
        </div>
        
        {/* Connection points */}
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-indigo-100 border-2 border-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-indigo-100 border-2 border-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        
        <div className={`flex justify-between items-center ${getTypeColor()} py-1.5 px-2 rounded-t-lg border-b ${getTypeTextColor()}`}>
          <span className="text-[10px] font-medium flex items-center">
            {getTaskIcon()}
            {task.type}
          </span>
          <button 
            className="text-gray-500 hover:text-gray-700 rounded-full hover:bg-white p-0.5 transition-colors"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertIcon size="sm" />
          </button>
        </div>
        <div className="p-2">
          <h3 className="text-xs font-medium flex items-center">
            {task.name}
            {task.response && 
              <CheckCircleIcon size="sm" className="ml-1 text-green-500" />
            }
          </h3>
          {task.input && (
            <p className="text-[10px] text-gray-500 mt-0.5 truncate">
              Input: {task.input}
            </p>
          )}
        </div>
        
        {/* Task status indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        
        {/* Context Menu */}
        {showMenu && (
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-xl overflow-hidden z-20 border border-gray-100 backdrop-blur-sm bg-white/90">
            <div className="py-1">
              <button
                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                onClick={handleEdit}
              >
                <EditIcon size="sm" className="mr-1.5 text-blue-500" />
                Edit Task
              </button>
              <button
                className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center transition-colors"
                onClick={handleDelete}
              >
                <DeleteIcon size="sm" className="mr-1.5" />
                Delete Task
              </button>
            </div>
          </div>
        )}
        
        {/* Quick action buttons that appear on hover */}
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col space-y-1">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-0.5 shadow-md transition-colors" 
            onClick={handleEdit}
          >
            <EditIcon size="sm" />
          </button>
          <button 
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow-md transition-colors" 
            onClick={handleDelete}
          >
            <DeleteIcon size="sm" />
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