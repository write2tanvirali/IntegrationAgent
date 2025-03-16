import React from 'react';

interface IconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
};

export const SaveIcon: React.FC<IconProps> = ({ className = '', size = 'md', color = 'currentColor' }) => (
  <svg 
    className={`${sizeMap[size]} ${className}`} 
    fill="none" 
    stroke={color} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" 
    />
  </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className = '', size = 'md', color = 'currentColor' }) => (
  <svg 
    className={`${sizeMap[size]} ${className}`} 
    fill="none" 
    stroke={color} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
    />
  </svg>
);

export const ArrowBackIcon: React.FC<IconProps> = ({ className = '', size = 'md', color = 'currentColor' }) => (
  <svg 
    className={`${sizeMap[size]} ${className}`} 
    fill="none" 
    stroke={color} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M10 19l-7-7m0 0l7-7m-7 7h18" 
    />
  </svg>
);

export const AddIcon: React.FC<IconProps> = ({ className = '', size = 'md', color = 'currentColor' }) => (
  <svg 
    className={`${sizeMap[size]} ${className}`} 
    fill="none" 
    stroke={color} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 4v16m8-8H4" 
    />
  </svg>
);

export const DeleteIcon: React.FC<IconProps> = ({ className = '', size = 'md', color = 'currentColor' }) => (
  <svg 
    className={`${sizeMap[size]} ${className}`} 
    fill="none" 
    stroke={color} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
    />
  </svg>
);

export const MoreVertIcon: React.FC<IconProps> = ({ className = '', size = 'md', color = 'currentColor' }) => (
  <svg 
    className={`${sizeMap[size]} ${className}`} 
    fill="none" 
    stroke={color} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" 
    />
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className = '', size = 'md', color = 'currentColor' }) => (
  <svg 
    className={`${sizeMap[size]} ${className}`} 
    fill="none" 
    stroke={color} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </svg>
);

export const ScheduleIcon: React.FC<IconProps> = ({ className = '', size = 'md', color = 'currentColor' }) => (
  <svg 
    className={`${sizeMap[size]} ${className}`} 
    fill="none" 
    stroke={color} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </svg>
);

export const PlayArrowIcon: React.FC<IconProps> = ({ className = '', size = 'md', color = 'currentColor' }) => (
  <svg 
    className={`${sizeMap[size]} ${className}`} 
    fill="none" 
    stroke={color} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </svg>
);

export const DragIndicatorIcon: React.FC<IconProps> = ({ className = '', size = 'md', color = 'currentColor' }) => (
  <svg 
    className={`${sizeMap[size]} ${className}`} 
    fill="none" 
    stroke={color} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4 8h16M4 16h16" 
    />
  </svg>
); 