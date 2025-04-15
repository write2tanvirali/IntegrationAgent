from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum, Table
from sqlalchemy.orm import relationship
from database import Base
import enum
from fastapi.security import OAuth2PasswordBearer
from typing import List

class IntegrationType(enum.Enum):
    Service = "Service"
    Process = "Process"

class TriggerType(enum.Enum):
    WebService = "WebService"
    WebHook = "WebHook"
    MessageQueue = "MessageQueue"
    Scheduler = "Scheduler"

class Recurrence(enum.Enum):
    Once = "Once"
    Interval = "Interval"
    Daily = "Daily"
    Weekly = "Weekly"
    Monthly = "Monthly"
    Yearly = "Yearly"

class TaskType(enum.Enum):
    Input = "Input"
    Output = "Output"
    Logic = "Logic"

class ConnectorType(enum.Enum):
    WebService = "WebService"
    MessageQueue = "MessageQueue"
    Database = "Database"
    Email = "Email"
    File = "File"

class LogicType(enum.Enum):
    UniqueFilter = "UniqueFilter"
    Transformation = "Transformation"
    RecordFilter = "RecordFilter"

# New enums based on C# model
class DataType(enum.Enum):
    Single = "Single"
    List = "List"

class InputSource(str, enum.Enum):
    File = "File"
    Text = "Text"

class QueryType(enum.Enum):
    SelectQuery = "SelectQuery"
    NonQuery = "NonQuery"
    StoreProcedure = "StoreProcedure"

class OptionType(str, enum.Enum):
    NONE = "None"
    DateTimeIncremental = "DateTimeIncremental"
    UniqueIDIncremental = "UniqueIDIncremental"

class ServiceType(enum.Enum):
    SOAP = "SOAP"
    REST = "REST"

class DatabaseType(enum.Enum):
    OracleConnector = "OracleConnector"
    SqlConnector = "SqlConnector"

class ConditionType(enum.Enum):
    Equal = "Equal"
    NotEqual = "NotEqual"
    GreaterThan = "GreaterThan"
    LessThan = "LessThan"
    GreaterThanEqual = "GreaterThanEqual"
    LessThanEqual = "LessThanEqual"

class ProcessStatus(str, enum.Enum):
    Running = "Running"
    Stopped = "Stopped"
    Paused = "Paused"
    Error = "Error"

class IntegrationAgent(Base):
    __tablename__ = 'integration_agents'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    type = Column(Enum(IntegrationType), nullable=False)
    enabled = Column(Boolean, default=True)
    updates_available = Column(Boolean, default=False)
    # Remove process relationship as it's now reversed

class IntegrationProcess(Base):
    __tablename__ = 'integration_processes'

    id = Column(Integer, primary_key=True)
    integration_agent_id = Column(Integer, ForeignKey('integration_agents.id'))
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    auto_start = Column(Boolean, default=False)
    trigger_type = Column(Enum(TriggerType), nullable=False)
    status = Column(Enum(ProcessStatus), default=ProcessStatus.Stopped)
    
    # Relationships
    integration_agent = relationship('IntegrationAgent')
    scheduler = relationship('ProcessSchedule', back_populates='process', uselist=False)
    tasks = relationship("ProcessTask", back_populates="integration_process")

class ProcessSchedule(Base):
    __tablename__ = 'process_schedules'

    id = Column(Integer, primary_key=True)
    integration_process_id = Column(Integer, ForeignKey('integration_processes.id'))
    recurrence_type = Column(Enum(Recurrence), nullable=False)
    start_date = Column(String, nullable=False)
    enabled = Column(Boolean, default=True)
    interval_minutes = Column(Integer, default=0)
    day_of_week = Column(Integer, default=0)
    day_of_month = Column(Integer, default=0)
    month = Column(Integer, default=0)
    hour = Column(Integer, default=0)
    minute = Column(Integer, default=0)
    
    # Relationships
    process = relationship('IntegrationProcess', back_populates='scheduler')

class ProcessTask(Base):
    __tablename__ = "process_tasks"

    id = Column(Integer, primary_key=True, index=True)
    integration_process_id = Column(Integer, ForeignKey("integration_processes.id"), nullable=False)
    task_name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    type = Column(Enum(TaskType), nullable=False)
    sequence_number = Column(Integer, default=10)
    enabled = Column(Boolean, default=True)
    
    # Task Common Fields
    input_source = Column(Enum(InputSource), nullable=True)
    input = Column(String, nullable=True)
    save_input = Column(Boolean, default=False)
    
    # LogicTask Fields
    logic_type = Column(Enum(LogicType), nullable=True)
    response = Column(String, nullable=True)
    
    # ActionTask Fields
    connector_type = Column(Enum(ConnectorType), nullable=True)
    option_type = Column(Enum(OptionType), default=OptionType.NONE)
    
    # Relationships
    integration_process = relationship("IntegrationProcess", back_populates="tasks")
    static_fields = relationship("Field", back_populates="process_task", cascade="all, delete-orphan")
    transformations = relationship("Transformation", back_populates="process_task", cascade="all, delete-orphan")
    connectors = relationship("Connector", back_populates="process_task", cascade="all, delete-orphan")

# Association table for task and fields
task_fields = Table('task_fields', Base.metadata,
    Column('task_id', Integer, ForeignKey('process_tasks.id')),
    Column('field_id', Integer, ForeignKey('fields.id'))
)

class Connector(Base):
    __tablename__ = 'connectors'

    id = Column(Integer, primary_key=True)
    process_task_id = Column(Integer, ForeignKey('process_tasks.id'), nullable=False)
    data_type = Column(Enum(DataType), nullable=False)
    connector_type = Column(Enum(ConnectorType), nullable=False)
    
    # EmailConnector fields
    from_email = Column(String, nullable=True)
    email = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    
    # MessageQueueConnector fields
    queue_path = Column(String, nullable=True)
    
    # WebServiceConnector fields
    service_type = Column(Enum(ServiceType), nullable=True)
    end_point = Column(String, nullable=True)
    response_tag = Column(String, nullable=True)
    
    # DatabaseConnector fields
    database_type = Column(Enum(DatabaseType), nullable=True)
    connection_string = Column(String, nullable=True)
    query_type = Column(Enum(QueryType), nullable=True)
    query = Column(String, nullable=True)
    
    # Relationships
    process_task = relationship("ProcessTask", back_populates="connectors")

class Field(Base):
    __tablename__ = "fields"
    
    id = Column(Integer, primary_key=True, index=True)
    process_task_id = Column(Integer, ForeignKey("process_tasks.id"), nullable=False)
    field_name = Column(String, nullable=False)
    data_type = Column(Enum(DataType), nullable=False)
    value = Column(String, nullable=True)
    
    process_task = relationship("ProcessTask", back_populates="static_fields")

class Transformation(Base):
    __tablename__ = 'transformations'

    id = Column(Integer, primary_key=True)
    condition_type = Column(Enum(ConditionType), nullable=False)
    c_field_id = Column(Integer, ForeignKey('fields.id'))
    c_field = relationship('Field', foreign_keys=[c_field_id])
    v_field_id = Column(Integer, ForeignKey('fields.id'))
    v_field = relationship('Field', foreign_keys=[v_field_id])
    
    # Add relationship to ProcessTask
    process_task_id = Column(Integer, ForeignKey("process_tasks.id"), nullable=False)
    process_task = relationship("ProcessTask", back_populates="transformations")

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login") 