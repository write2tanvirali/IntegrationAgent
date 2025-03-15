export interface Point {
  x: number;
  y: number;
}

export interface Task {
  id: number;
  name: string;
  type: TaskType;
  position: Point;
  static_fields?: string;
  input_source?: string;
  input?: string;
  save_input?: boolean;
  logic_type?: LogicType;
  response?: string;
  conditions?: string;
  connector_id?: number;
}

export enum TaskType {
  Action = "Action",
  Input = "Input",
  Output = "Output",
  Logic = "Logic"
}

export enum LogicType {
  UniqueFilter = "UniqueFilter",
  Conditional = "Conditional",
  RecordFilter = "RecordFilter"
}

export enum Recurrence {
  Once = "Once",
  Interval = "Interval",
  Daily = "Daily",
  Weekly = "Weekly",
  Monthly = "Monthly",
  Yearly = "Yearly"
}

export interface ProcessSchedule {
  id?: number;
  recurrence: Recurrence;
  time: string;
  days?: string;
  interval?: number;
}

export interface IntegrationAgent {
  id: number;
  name: string;
  code: string;
  type: string;
  enabled: boolean;
  updates_available: boolean;
  tasks: Task[];
  schedule?: ProcessSchedule;
}

export enum IntegrationType {
  Service = "Service",
  Process = "Process"
} 