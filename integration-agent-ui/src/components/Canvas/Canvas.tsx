import React, { useState, useRef, useEffect } from 'react';
import { AddIcon } from '../Icons';
import TriggerBox from './TriggerBox';
import TaskBox from './TaskBox';
import { Task, ProcessSchedule, TaskType } from '../../types';

// Logo component for the top-left corner
const Logo = () => (
  <div className="absolute top-3 left-3 flex items-center z-20">
    <svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 0L120 60L60 120L0 60L60 0Z" fill="url(#paint0_linear)" />
      <path d="M30 60L60 30L90 60L60 90L30 60Z" fill="white" />
      <defs>
        <linearGradient id="paint0_linear" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00ffb3" />
          <stop offset="0.25" stopColor="#00ffb3" />
          <stop offset="0.5" stopColor="#00bfff" />
          <stop offset="0.75" stopColor="#cc00ff" />
          <stop offset="1" stopColor="#ff9500" />
        </linearGradient>
      </defs>
    </svg>
    <span className="ml-2 text-sm font-semibold text-gray-700">Workflow</span>
  </div>
);

interface CanvasProps {
  agentId: number;
  tasks: Task[];
  schedule?: ProcessSchedule;
  onTaskAdd: (task: Task) => void;
  onTaskUpdate: (taskId: number, task: Task) => void;
  onTaskDelete: (taskId: number) => void;
  onScheduleUpdate?: (schedule: ProcessSchedule) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  agentId, 
  tasks, 
  schedule, 
  onTaskAdd, 
  onTaskUpdate, 
  onTaskDelete,
  onScheduleUpdate 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // Position trigger at the left side of the canvas
  const triggerPosition = { x: 50, y: 150 };
  
  // Update canvas size on mount and resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight
        });
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);
  
  // Organize tasks in a workflow layout
  useEffect(() => {
    if (tasks.length === 0) return;
    
    // Check if any tasks need positioning
    const needsPositioning = tasks.some(task => 
      task.position.x === 0 && task.position.y === 0
    );
    
    if (needsPositioning) {
      const updatedTasks = [...tasks];
      let changed = false;
      
      updatedTasks.forEach((task, index) => {
        if (task.position.x === 0 && task.position.y === 0) {
          const position = getInitialTaskPosition(index);
          updatedTasks[index] = { ...task, position };
          changed = true;
        }
      });
      
      if (changed) {
        // Update tasks with proper positions
        updatedTasks.forEach(task => {
          onTaskUpdate(task.id, task);
        });
      }
    }
  }, [tasks]);
  
  // Calculate positions for tasks in a workflow
  const getInitialTaskPosition = (index: number) => {
    // Position tasks in a horizontal line with proper spacing
    return { 
      x: triggerPosition.x + 300 * (index + 1), 
      y: triggerPosition.y 
    };
  };

  const handleDragStart = (taskId: number) => {
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (!draggedTaskId || !canvasRef.current) return;
    
    const taskToUpdate = tasks.find(t => t.id === draggedTaskId);
    if (!taskToUpdate) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left);
    const y = Math.max(0, e.clientY - rect.top);

    // Snap to grid (20px)
    const snappedX = Math.round(x / 20) * 20;
    const snappedY = Math.round(y / 20) * 20;

    onTaskUpdate(draggedTaskId, {
      ...taskToUpdate,
      position: { x: snappedX, y: snappedY }
    });

    setDraggedTaskId(null);
  };

  const handleAddTask = () => {
    const newTaskId = Math.max(0, ...tasks.map(t => t.id)) + 1;
    const position = getInitialTaskPosition(tasks.length);
    
    const newTask: Task = {
      id: newTaskId,
      name: `Task ${newTaskId}`,
      type: TaskType.Action,
      position
    };
    
    onTaskAdd(newTask);
  };

  // Generate a curved path between two points
  const generatePath = (startX: number, startY: number, endX: number, endY: number) => {
    const distance = endX - startX;
    const controlPointDistance = Math.min(80, distance / 3);
    
    return `M ${startX} ${startY} 
            C ${startX + controlPointDistance} ${startY}, 
              ${endX - controlPointDistance} ${endY}, 
              ${endX} ${endY}`;
  };

  return (
    <div className="relative">
      <div 
        ref={canvasRef}
        className="workflow-canvas"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDragEnd}
        tabIndex={0}
        role="region"
        aria-label="Workflow Canvas"
      >
        {/* Logo in the top-left corner */}
        <Logo />
        
        {/* Trigger box */}
        <TriggerBox 
          position={triggerPosition} 
          schedule={schedule}
          onUpdate={onScheduleUpdate}
        />
        
        {/* Task boxes */}
        {tasks.map((task) => (
          <TaskBox
            key={task.id}
            task={task}
            onDragStart={() => handleDragStart(task.id)}
            onUpdate={(updatedTask) => onTaskUpdate(task.id, updatedTask)}
            onDelete={() => onTaskDelete(task.id)}
          />
        ))}
        
        {/* SVG layer for arrows */}
        <svg 
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ minWidth: '100%', minHeight: '100%' }}
        >
          {/* Arrow from trigger to first task */}
          {tasks.length > 0 && (
            <g>
              <path
                d={generatePath(
                  triggerPosition.x + 192, // Width of trigger box
                  triggerPosition.y + 40,  // Middle of trigger box
                  tasks[0].position.x,     // Start of task box
                  tasks[0].position.y + 40  // Middle of task box
                )}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="0"
                markerEnd="url(#arrowhead)"
                className="transition-all duration-300"
              />
              {/* Flow indicator dot */}
              <circle 
                cx={triggerPosition.x + 192 + 40} 
                cy={triggerPosition.y + 40} 
                r="4" 
                fill="#6366f1" 
                className="animate-pulse"
              />
            </g>
          )}
          
          {/* Arrows between tasks */}
          {tasks.map((task, index) => {
            if (index === tasks.length - 1) return null;
            const nextTask = tasks[index + 1];
            
            return (
              <g key={`arrow-${task.id}-${nextTask.id}`}>
                <path
                  d={generatePath(
                    task.position.x + 192,    // Width of task box
                    task.position.y + 40,     // Middle of task box
                    nextTask.position.x,      // Start of next task box
                    nextTask.position.y + 40   // Middle of next task box
                  )}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeDasharray="0"
                  markerEnd="url(#arrowhead)"
                  className="transition-all duration-300"
                />
                {/* Flow indicator dot */}
                <circle 
                  cx={task.position.x + 192 + 40} 
                  cy={task.position.y + 40} 
                  r="4" 
                  fill="#6366f1" 
                  className="animate-pulse" 
                  style={{ animationDelay: `${index * 0.2}s` }}
                />
              </g>
            );
          })}
          
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
            </marker>
          </defs>
        </svg>
        
        {/* Add Task button */}
        <button
          className="absolute bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 flex items-center shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleAddTask}
          aria-label="Add new task"
        >
          <AddIcon />
        </button>
        
        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 pointer-events-none">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 text-indigo-300">
              <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-lg font-medium mb-2">Your workflow is empty</p>
            <p className="text-sm max-w-md text-center">Click the "+" button to add tasks and build your integration workflow</p>
          </div>
        )}
        
        {/* Workflow direction indicator */}
        <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-md text-xs text-gray-600 flex items-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs">Workflow Direction</span>
        </div>
      </div>
    </div>
  );
};

export default Canvas; 

