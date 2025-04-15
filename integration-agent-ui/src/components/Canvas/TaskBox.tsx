import React, { useState } from 'react';
import { MoreVertIcon, DeleteIcon, EditIcon, DragIndicatorIcon } from '../Icons';
import { Task, TaskType } from '../../types';

interface TaskBoxProps {
  task: Task;
  onDragStart: () => void;
  onUpdate: (task: Task) => void;
  onDelete: () => void;
}

const TaskBox: React.FC<TaskBoxProps> = ({ task, onDragStart, onUpdate, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    onDragStart();
  };

  const getTypeColor = () => {
    switch(task.type) {
      case TaskType.INPUT:
        return 'bg-blue-50 border-blue-200';
      case TaskType.INPUT:
        return 'bg-green-50 border-green-200';
      case TaskType.LOGIC:
        return 'bg-purple-50 border-purple-200';
      case TaskType.LOGIC:
        return 'bg-amber-50 border-amber-200';
      case TaskType.OUTPUT:
        return 'bg-pink-50 border-pink-200';
      case TaskType.INPUT:
        return 'bg-cyan-50 border-cyan-200';
      default: 
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeTextColor = () => {
    switch(task.type) {
      case TaskType.INPUT:
        return 'text-blue-700';
      case TaskType.INPUT:
        return 'text-green-700';
      case TaskType.LOGIC:
        return 'text-purple-700';
      case TaskType.LOGIC:
        return 'text-amber-700';
      case TaskType.OUTPUT:
        return 'text-pink-700';
      case TaskType.INPUT:
        return 'text-cyan-700';
      default: 
        return 'text-gray-700';
    }
  };

  const getTaskIcon = () => {
    switch(task.type) {
      case TaskType.INPUT:
        return (
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 8L10 12L6 16M14 8L18 12L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case TaskType.INPUT:
        return (
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7C4 4.79086 7.58172 3 12 3C16.4183 3 20 4.79086 20 7M4 7V17C4 19.2091 7.58172 21 12 21C16.4183 21 20 19.2091 20 17V7M4 7V12C4 14.2091 7.58172 16 12 16C16.4183 16 20 14.2091 20 12" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case TaskType.LOGIC:
        return (
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21H5M19 21V15M19 21L15 17M5 21V15M5 21L9 17M19 3H5M19 3V9M19 3L15 7M5 3V9M5 3L9 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case TaskType.LOGIC:
        return (
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6H20M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case TaskType.OUTPUT:
        return (
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 17H9M12 3V7M18.5 7.5L16 10M5.5 7.5L8 10M19 13V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V13C5 9.13401 8.13401 6 12 6C15.866 6 19 9.13401 19 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case TaskType.INPUT:
        return (
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9M13 2L20 9M13 2V9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const handleEdit = () => {
    setIsMenuOpen(false);
    onUpdate(task);
  };

  if (!task.position) {
    return null;
  }

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        style={{
          position: 'absolute',
          left: task.position.x,
          top: task.position.y,
        }}
        className="task-box group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsMenuOpen(false);
        }}
      >
        {/* Task content */}
        <div className={`relative p-3 border rounded-lg shadow-sm transition-all duration-200 ${getTypeColor()}`}>
          {/* Drag handle */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
            <DragIndicatorIcon className="text-gray-400" />
          </div>
          
          {/* Task type badge */}
          <div className={`text-[10px] font-medium mb-1 flex items-center ${getTypeTextColor()}`}>
            {task.type}
          </div>
          
          {/* Task info */}
          <div className="pr-6">
            <h3 className="text-xs font-medium flex items-center">
              {task.name}
            </h3>
            {task.input && (
              <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                Input: {task.input}
              </p>
            )}
          </div>
          
          {/* Menu button */}
          <button
            className={`absolute right-1 top-1 p-1 rounded-md transition-colors ${
              isMenuOpen ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MoreVertIcon size="sm" className="text-gray-500" />
          </button>
          
          {/* Menu dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 top-8 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
              <button
                className="flex items-center px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                onClick={handleEdit}
              >
                <svg className="w-3 h-3 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.2322 5.23223L18.7677 8.76777M16.7322 3.73223C17.7085 2.75592 19.2914 2.75592 20.2677 3.73223C21.244 4.70854 21.244 6.29146 20.2677 7.26777L6.5 21.0355H3V17.4644L16.7322 3.73223Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Edit</span>
              </button>
              <button
                className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 flex items-center text-red-600"
                onClick={() => {
                  onDelete();
                  setIsMenuOpen(false);
                }}
              >
                <DeleteIcon size="sm" className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TaskBox; 