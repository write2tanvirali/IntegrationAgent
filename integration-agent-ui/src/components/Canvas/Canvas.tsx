import React, { useState, useRef } from 'react';
import { Add } from '@mui/icons-material';
import TriggerBox from './TriggerBox';
import TaskBox from './TaskBox';
import { Task, ProcessSchedule } from '../../types';

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
  
  // Position trigger at the top-left of the canvas
  const triggerPosition = { x: 50, y: 80 };
  
  // Calculate positions for tasks in a workflow
  const getInitialTaskPosition = (index: number) => {
    return { 
      x: triggerPosition.x + 250 * (index + 1), 
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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onTaskUpdate(draggedTaskId, {
      ...taskToUpdate,
      position: { x, y }
    });

    setDraggedTaskId(null);
  };

  const handleAddTask = () => {
    const newTaskId = Math.max(0, ...tasks.map(t => t.id)) + 1;
    const position = getInitialTaskPosition(tasks.length);
    
    const newTask: Task = {
      id: newTaskId,
      name: `Task ${newTaskId}`,
      type: 'Action' as any,
      position
    };
    
    onTaskAdd(newTask);
  };

  return (
    <div 
      ref={canvasRef}
      className="w-full h-[calc(100vh-250px)] relative bg-white border border-gray-300 overflow-auto p-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDragEnd}
    >
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
      >
        {/* Arrow from trigger to first task */}
        {tasks.length > 0 && (
          <path
            d={`M ${triggerPosition.x + 200} ${triggerPosition.y + 40} 
                C ${triggerPosition.x + 250} ${triggerPosition.y + 40}, 
                ${tasks[0].position.x - 50} ${tasks[0].position.y + 40}, 
                ${tasks[0].position.x} ${tasks[0].position.y + 40}`}
            fill="none"
            stroke="#666"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        )}
        
        {/* Arrows between tasks */}
        {tasks.map((task, index) => {
          if (index === tasks.length - 1) return null;
          const nextTask = tasks[index + 1];
          
          return (
            <path
              key={`arrow-${task.id}-${nextTask.id}`}
              d={`M ${task.position.x + 200} ${task.position.y + 40} 
                  C ${task.position.x + 250} ${task.position.y + 40}, 
                  ${nextTask.position.x - 50} ${nextTask.position.y + 40}, 
                  ${nextTask.position.x} ${nextTask.position.y + 40}`}
              fill="none"
              stroke="#666"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
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
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>
      </svg>
      
      {/* Simple Add Task button that matches screenshot */}
      <button
        className="absolute bottom-10 right-10 bg-blue-500 text-white rounded p-2 flex items-center"
        onClick={handleAddTask}
      >
        <Add className="mr-1" />
        Add Task
      </button>
      
      {/* Empty state - more simplified */}
      {tasks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
          <p>Add tasks to build your workflow</p>
        </div>
      )}
    </div>
  );
};

export default Canvas; 

