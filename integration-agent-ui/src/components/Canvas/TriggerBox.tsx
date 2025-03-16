import React, { useState } from 'react';
import { EditIcon, ScheduleIcon, PlayArrowIcon } from '../../components/Icons';
import { ProcessSchedule } from '../../types';
import TriggerForm from './TriggerForm';

interface TriggerBoxProps {
  position: { x: number; y: number };
  schedule?: ProcessSchedule;
  onUpdate?: (schedule: ProcessSchedule) => void;
}

const TriggerBox: React.FC<TriggerBoxProps> = ({ position, schedule, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
        }}
        className="trigger-box group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-2 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold flex items-center">
              <PlayArrowIcon size="sm" className="mr-1" />
              Trigger
            </h3>
            <button 
              className="text-white/80 hover:text-white rounded-full hover:bg-white/20 p-0.5 transition-colors"
              onClick={() => setIsEditing(true)}
              aria-label="Edit trigger"
            >
              <EditIcon size="sm" />
            </button>
          </div>
          {schedule && (
            <div className="mt-1.5 text-[10px] text-white/90 bg-white/10 p-1.5 rounded flex items-center">
              <ScheduleIcon size="sm" className="mr-1" />
              <div>
                <span className="font-medium">{schedule.recurrence}</span>
                <div className="mt-0.5">{schedule.time}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1.5 h-6 bg-indigo-700 rounded-l-md"></div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        
        {/* Connection point */}
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-indigo-100 border-2 border-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        
        {/* Arrow indicator that shows on hover */}
        <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-5 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {/* Pulse effect */}
        <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 opacity-75 animate-pulse"></div>
      </div>

      {/* Edit Dialog */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 animate-fadeIn">
            <TriggerForm
              schedule={schedule}
              onSubmit={(updatedSchedule: ProcessSchedule) => {
                onUpdate?.(updatedSchedule);
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

export default TriggerBox; 