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

export const calculateArrowPoints = (tasks: Task[], container: HTMLElement): ArrowPoint[] => {
  const arrows: ArrowPoint[] = [];
  
  for (let i = 0; i < tasks.length - 1; i++) {
    const start = tasks[i];
    const end = tasks[i + 1];
    
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

export const drawArrows = (arrows: ArrowPoint[], container: HTMLElement) => {
  // Implementation for drawing arrows using SVG paths
  // This is handled in the Canvas component's SVG rendering
}; 