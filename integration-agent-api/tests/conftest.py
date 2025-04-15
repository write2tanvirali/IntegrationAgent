import pytest
import asyncio
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from models.models import (
    Base, Connector, ProcessTask, IntegrationProcess, 
    IntegrationAgent, IntegrationType, TriggerType, TaskType
)
from database import get_db
from main import app
import os

# Create test database with a file instead of memory
TEST_DB_PATH = "test.db"
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_PATH}"

# Use a test-specific database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_sql_app.db"

def print_db_contents(session):
    """Utility function to print database contents"""
    inspector = inspect(session.bind)
    for table_name in inspector.get_table_names():
        print(f"\nTable: {table_name}")
        result = session.execute(text(f"SELECT * FROM {table_name}"))
        for row in result:
            print(row)

@pytest.fixture(scope="session")
def engine():
    """Create the test database engine"""
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)
    
    test_engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    
    # Create all tables
    Base.metadata.create_all(bind=test_engine)
    
    yield test_engine
    
    # Cleanup
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)

@pytest.fixture(scope="function")
def db_session(engine):
    """Creates a new database session for each test"""
    connection = engine.connect()
    transaction = connection.begin()
    session_factory = sessionmaker(bind=connection)
    session = session_factory()

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    """Test client with database session"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass  # Session cleanup is handled by db_session fixture

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_data(db_session):
    """Create test data for each test"""
    # Create test integration agent
    agent = IntegrationAgent(
        name="Test Agent",
        code="TEST001",
        type=IntegrationType.Service,
        enabled=True,
        updates_available=False
    )
    db_session.add(agent)
    db_session.flush()

    # Create test integration process
    process = IntegrationProcess(
        integration_agent_id=agent.id,
        auto_start=True,
        trigger_type=TriggerType.WebService
    )
    db_session.add(process)
    db_session.flush()

    # Create test process task
    task = ProcessTask(
        integration_process_id=process.id,
        task_name="Test Task",
        type=TaskType.Action
    )
    db_session.add(task)
    db_session.commit()

    return {
        "agent": agent,
        "process": process,
        "task": task
    }

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
def setup_database(engine):
    """Create all tables before running any tests"""
    # Import all models to ensure they're registered with Base
    from models.models import (
        IntegrationAgent, IntegrationProcess, ProcessSchedule,
        ProcessTask, Connector, Field, Transformation, User
    )
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine) 