// Define the basic types for the integration agent system

export interface IntegrationAgent {
  id: number;
  name: string;
  code?: string;
  type: string;
  enabled: boolean;
  updates_available?: boolean;
  tasks: Task[];
  schedule?: ProcessSchedule;
  processes?: IntegrationProcess[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id?: number;
  name: string;
  description?: string;
  type: string;
  sequence_number?: number;
  position?: { x: number; y: number };
  enabled?: boolean;
  input_source?: string;
  input?: string;
  save_input?: boolean;
  logic_type?: string;
  response?: string;
  connector_type?: string;
  option_type?: string;
  conditions?: string;
  connector_config?: ConnectorConfig;
}

export enum TaskType {
  INPUT = "Input",
  OUTPUT = "Output",
  LOGIC = "Logic"
}

export enum LogicType {
  UNIQUE_FILTER = "UniqueFilter",
  TRANSFORMATION = "Transformation",
  RECORD_FILTER = "RecordFilter"
}

export enum ConnectorType {
  WEB_SERVICE = "WebService",
  MESSAGE_QUEUE = "MessageQueue",
  DATABASE = "Database",
  EMAIL = "Email",
  FILE = "File"
}

export enum TriggerType {
  WEB_SERVICE = "WebService",
  WEB_HOOK = "WebHook",
  MESSAGE_QUEUE = "MessageQueue",
  SCHEDULER = "Scheduler"
}

export enum InputSource {
  FILE = "File",
  TEXT = "Text"
}

export interface ProcessSchedule {
  id?: number;
  agentId?: number;
  enabled: boolean;
  recurrence: Recurrence;
  startDate?: string;
  endDate?: string;
  time?: string;
  daysOfWeek?: string[];
  daysOfMonth?: number[];
  months?: string[];
  updatedAt?: string;
}

export enum Recurrence {
  ONCE = 'Once',
  INTERVAL = 'Interval',
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly'
}

export interface IntegrationProcess {
  id: number;
  agentId: number;
  name: string;
  description?: string;
  auto_start?: boolean;
  trigger_type?: string;
  status?: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

// Define Connector Configuration Interfaces
export interface EmailConnectorConfig {
  fromEmail: string;
  email: string; // Assuming this is the 'To' email
  subject: string;
}

export interface MessageQueueConnectorConfig {
  queuePath: string;
}

export enum ServiceType {
  REST = 'REST',
  SOAP = 'SOAP',
}

export interface WebServiceConnectorConfig {
  serviceType: ServiceType;
  endPoint: string;
  responseTag?: string; // Optional based on description
}

export enum QueryType {
  SELECT = 'SELECT',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface DatabaseConnectorConfig {
  databaseType: string; // e.g., SQL Server, PostgreSQL
  connectionString: string;
  queryType: QueryType;
  query: string;
}

// Union type for all possible connector configs
export type ConnectorConfig =
  | EmailConnectorConfig
  | MessageQueueConnectorConfig
  | WebServiceConnectorConfig
  | DatabaseConnectorConfig; 