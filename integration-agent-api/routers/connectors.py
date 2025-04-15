from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from models.models import Connector, ConnectorType, DataType, ServiceType, DatabaseType, QueryType, ProcessTask
from database import SessionLocal, get_db

router = APIRouter()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
class ConnectorBase(BaseModel):
    process_task_id: int
    data_type: DataType
    connector_type: ConnectorType

    # EmailConnector fields (Optional)
    from_email: Optional[str] = None
    email: Optional[str] = None
    subject: Optional[str] = None

    # MessageQueueConnector fields (Optional)
    queue_path: Optional[str] = None

    # WebServiceConnector fields (Optional)
    service_type: Optional[ServiceType] = None
    end_point: Optional[str] = None
    response_tag: Optional[str] = None

    # DatabaseConnector fields (Optional)
    database_type: Optional[DatabaseType] = None
    connection_string: Optional[str] = None
    query_type: Optional[QueryType] = None
    query: Optional[str] = None

    class Config:
        use_enum_values = True
        # Add these if using Pydantic v2 style
        from_attributes = True
        populate_by_name = True

class ConnectorCreate(ConnectorBase):
    pass

class ConnectorResponse(ConnectorBase):
    id: int

    class Config:
        # Ensure Config is inherited or defined
        use_enum_values = True
        from_attributes = True
        populate_by_name = True
        orm_mode = True # Keep orm_mode for compatibility if needed, but from_attributes is preferred

# Create a Connector
@router.post("/connectors/", response_model=ConnectorResponse)
def create_connector(connector: ConnectorCreate, db: Session = Depends(get_db)):
    # Verify that process task exists
    task = db.query(ProcessTask).filter(ProcessTask.id == connector.process_task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Process task not found")

    # --- Add Validation based on connector_type ---
    # Example: If connector_type is Email, ensure email fields are provided
    if connector.connector_type == ConnectorType.Email:
        if not connector.from_email or not connector.email or not connector.subject:
            raise HTTPException(status_code=400, detail="Email connector requires from_email, email, and subject.")
    elif connector.connector_type == ConnectorType.WebService:
        if not connector.service_type or not connector.end_point:
             raise HTTPException(status_code=400, detail="WebService connector requires service_type and end_point.")
    # Add similar validation for other connector types...
    # --- End Validation ---

    db_connector = Connector(**connector.dict())
    db.add(db_connector)
    db.commit()
    db.refresh(db_connector)
    return db_connector

# Read all Connectors
@router.get("/connectors/", response_model=List[ConnectorResponse])
def read_connectors(
    skip: int = 0,
    limit: int = 100,
    process_task_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Connector)
    if process_task_id:
        query = query.filter(Connector.process_task_id == process_task_id)
    connectors = query.offset(skip).limit(limit).all()
    return connectors

# Read a single Connector by ID
@router.get("/connectors/{connector_id}", response_model=ConnectorResponse)
def read_connector(connector_id: int, db: Session = Depends(get_db)):
    connector = db.query(Connector).filter(Connector.id == connector_id).first()
    if connector is None:
        raise HTTPException(status_code=404, detail="Connector not found")
    return connector

# Update a Connector
@router.put("/connectors/{connector_id}", response_model=ConnectorResponse)
def update_connector(connector_id: int, updated_connector: ConnectorCreate, db: Session = Depends(get_db)):
    connector = db.query(Connector).filter(Connector.id == connector_id).first()
    if connector is None:
        raise HTTPException(status_code=404, detail="Connector not found")

    # Verify that process task exists
    task = db.query(ProcessTask).filter(ProcessTask.id == updated_connector.process_task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Process task not found")

    # Add validation similar to create_connector here...

    # Update attributes
    for key, value in updated_connector.dict().items():
         # Only update if the value is provided in the request
         if value is not None:
            setattr(connector, key, value)

    db.commit()
    db.refresh(connector)
    return connector

# Delete a Connector
@router.delete("/connectors/{connector_id}", response_model=ConnectorResponse)
def delete_connector(connector_id: int, db: Session = Depends(get_db)):
    connector = db.query(Connector).filter(Connector.id == connector_id).first()
    if connector is None:
        raise HTTPException(status_code=404, detail="Connector not found")

    db.delete(connector)
    db.commit()
    return connector

# Get connectors for a specific task
@router.get("/process-tasks/{task_id}/connectors", response_model=List[ConnectorResponse])
def get_connectors_for_task(task_id: int, db: Session = Depends(get_db)):
    # Verify task exists
    task = db.query(ProcessTask).filter(ProcessTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Process task not found")

    connectors = db.query(Connector).filter(Connector.process_task_id == task_id).all()
    return connectors

@router.put("/connectors/{connector_id}")
async def update_connector(connector_id: int, connector_data: dict, db: Session = Depends(get_db)):
    # Implementation here
    pass

@router.delete("/connectors/{connector_id}")
async def delete_connector(connector_id: int, db: Session = Depends(get_db)):
    # Implementation here
    pass 