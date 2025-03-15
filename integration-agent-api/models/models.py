from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum
from fastapi.security import OAuth2PasswordBearer

Base = declarative_base()

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
    Action = "Action"
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
    Conditional = "Conditional"
    RecordFilter = "RecordFilter"

class IntegrationAgent(Base):
    __tablename__ = 'integration_agents'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    type = Column(Enum(IntegrationType), nullable=False)
    enabled = Column(Boolean, default=True)
    updates_available = Column(Boolean, default=False)
    process_id = Column(Integer, ForeignKey('integration_processes.id'))
    process = relationship('IntegrationProcess', back_populates='agent')

class IntegrationProcess(Base):
    __tablename__ = 'integration_processes'

    id = Column(Integer, primary_key=True)
    auto_start = Column(Boolean, default=False)
    trigger_type = Column(Enum(TriggerType), nullable=False)
    scheduler_id = Column(Integer, ForeignKey('process_schedules.id'))
    scheduler = relationship('ProcessSchedule', back_populates='process')
    tasks = relationship('ProcessTask', back_populates='process')
    agent = relationship('IntegrationAgent', back_populates='process')

class ProcessSchedule(Base):
    __tablename__ = 'process_schedules'

    id = Column(Integer, primary_key=True)
    recurrence = Column(Enum(Recurrence), nullable=False)
    time = Column(String, nullable=False)
    days = Column(String, nullable=True)
    interval = Column(Integer, nullable=True)
    process = relationship('IntegrationProcess', back_populates='scheduler')

class ProcessTask(Base):
    __tablename__ = 'process_tasks'

    id = Column(Integer, primary_key=True)
    task_name = Column(String, nullable=False)
    type = Column(Enum(TaskType), nullable=False)
    static_fields = Column(String, nullable=True)
    input_source = Column(String, nullable=True)
    input = Column(String, nullable=True)
    save_input = Column(Boolean, default=False)
    logic_type = Column(Enum(LogicType), nullable=True)
    response = Column(String, nullable=True)
    conditions = Column(String, nullable=True)
    connector_id = Column(Integer, ForeignKey('connectors.id'))
    connector = relationship('Connector', back_populates='tasks')
    process_id = Column(Integer, ForeignKey('integration_processes.id'))
    process = relationship('IntegrationProcess', back_populates='tasks')

class Connector(Base):
    __tablename__ = 'connectors'

    id = Column(Integer, primary_key=True)
    connector_type = Column(Enum(ConnectorType), nullable=False)
    tasks = relationship('ProcessTask', back_populates='connector')

class Field(Base):
    __tablename__ = 'fields'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    value = Column(String, nullable=True)

class Transformation(Base):
    __tablename__ = 'transformations'

    id = Column(Integer, primary_key=True)
    condition = Column(String, nullable=False)
    c_field_id = Column(Integer, ForeignKey('fields.id'))
    c_field = relationship('Field', foreign_keys=[c_field_id])
    v_field_id = Column(Integer, ForeignKey('fields.id'))
    v_field = relationship('Field', foreign_keys=[v_field_id])

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login") 