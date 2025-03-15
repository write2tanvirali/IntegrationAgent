import React, { useState } from 'react';
import { Edit, Schedule, PlayArrow } from '@mui/icons-material';
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
        className="w-48 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-3 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold flex items-center">
              <PlayArrow className="mr-1" fontSize="small" />
              Trigger
            </h3>
            <button 
              className="text-white/80 hover:text-white rounded-full hover:bg-white/20 p-1 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              <Edit fontSize="small" />
            </button>
          </div>
          {schedule && (
            <div className="mt-2 text-xs text-white/90 bg-white/10 p-2 rounded flex items-center">
              <Schedule fontSize="small" className="mr-1" />
              <div>
                <span className="font-medium">{schedule.recurrence}</span>
                <div className="mt-0.5">{schedule.time}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Decorative element to indicate this is the start */}
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-indigo-600 rounded-l-md"></div>
        
        {/* Arrow indicator that shows on hover */}
        <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3L18 10L10 17M18 10H2" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
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