import { Task } from '../../../types';

interface Point {
  x: number;
  y: number;
}

interface ArrowPoint {
  start: Point;
  control1: Point;
  control2: Point;
  end: Point;
}

/**
 * Generates a path string for an SVG cubic bezier curve between two tasks
 */
export const generatePath = (x1: number, y1: number, x2: number, y2: number): string => {
  // Calculate control points for the curve
  const dx = Math.abs(x2 - x1) * 0.5;
  
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
};

/**
 * Generates a path string for an SVG curve between two tasks
 */
export const generateTaskPath = (start: Task, end: Task): string => {
  if (!start.position || !end.position) {
    console.warn('Task position is undefined');
    return '';
  }
  
  const startPoint = {
    x: start.position.x + 200,
    y: start.position.y + 40
  };
  
  const endPoint = {
    x: end.position.x,
    y: end.position.y + 40
  };
  
  return generatePath(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
};

/**
 * Gets the initial position for a task based on its index
 */
export const getInitialTaskPosition = (index: number): Point => {
  return {
    x: 300 + (index * 250),
    y: 150
  };
};

/**
 * Checks if a task needs to be repositioned
 */
export const needsRepositioning = (task: Task): boolean => {
  return !task.position || (task.position.x === 0 && task.position.y === 0);
};

/**
 * Gets the next available position for a task
 */
export const getNextTaskPosition = (tasks: Task[]): Point => {
  if (tasks.length === 0) {
    return getInitialTaskPosition(0);
  }

  const lastTask = tasks[tasks.length - 1];
  if (!lastTask.position) {
    return getInitialTaskPosition(tasks.length);
  }

  return {
    x: lastTask.position.x + 250,
    y: lastTask.position.y
  };
};

/**
 * Calculates arrow points for connecting tasks
 */
export const calculateArrowPoints = (tasks: Task[], container: HTMLElement): ArrowPoint[] => {
  const arrows: ArrowPoint[] = [];
  
  for (let i = 0; i < tasks.length - 1; i++) {
    const start = tasks[i];
    const end = tasks[i + 1];
    
    if (!start.position || !end.position) {
      console.warn('Task position is undefined');
      continue;
    }
    
    const startPoint = {
      x: start.position.x + 200,
      y: start.position.y + 40
    };
    
    const endPoint = {
      x: end.position.x,
      y: end.position.y + 40
    };
    
    const control1 = {
      x: startPoint.x + 50,
      y: startPoint.y
    };
    
    const control2 = {
      x: endPoint.x - 50,
      y: endPoint.y
    };
    
    arrows.push({
      start: startPoint,
      control1,
      control2,
      end: endPoint
    });
  }
  
  return arrows;
};

/**
 * Draws arrows between tasks (implementation handled in Canvas component)
 */
export const drawArrows = (arrows: ArrowPoint[], container: HTMLElement) => {
  // Implementation for drawing arrows using SVG paths
  // This is handled in the Canvas component's SVG rendering
}; 