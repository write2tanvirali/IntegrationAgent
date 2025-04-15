from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from models.models import IntegrationProcess, TriggerType, ProcessStatus
from database import get_db
import enum

router = APIRouter()

# Define ProcessStatus locally if needed
class ProcessStatus(str, enum.Enum):
    Running = "Running"
    Stopped = "Stopped"
    Paused = "Paused"
    Error = "Error"

# Pydantic models
class IntegrationProcessBase(BaseModel):
    integration_agent_id: int
    name: Optional[str] = None
    description: Optional[str] = None
    auto_start: bool = False
    trigger_type: TriggerType
    status: ProcessStatus = ProcessStatus.Stopped

    class Config:
        use_enum_values = True

class IntegrationProcessCreate(IntegrationProcessBase):
    pass

class IntegrationProcessResponse(IntegrationProcessBase):
    id: int
    
    class Config:
        orm_mode = True
        from_attributes = True  # Updated from orm_mode for Pydantic v2

# Create an Integration Process
@router.post("/integration-processes/", response_model=IntegrationProcessResponse)
async def create_integration_process(process: IntegrationProcessCreate, db: Session = Depends(get_db)):
    try:
        # Verify that integration agent exists
        from models.models import IntegrationAgent
        agent = db.query(IntegrationAgent).filter(IntegrationAgent.id == process.integration_agent_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Integration agent not found")
        
        # Print the process data for debugging
        print(f"Process data: {process.dict()}")
        
        db_process = IntegrationProcess(**process.dict())
        db.add(db_process)
        db.commit()
        db.refresh(db_process)
        return db_process
    except Exception as e:
        # Log the error
        print(f"Error creating process: {str(e)}")
        # Re-raise the exception
        raise

# Read all Integration Processes
@router.get("/integration-processes/", response_model=List[IntegrationProcessResponse])
def read_integration_processes(
    skip: int = 0, 
    limit: int = 10, 
    agent_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(IntegrationProcess)
    
    # Filter by agent if specified
    if agent_id:
        query = query.filter(IntegrationProcess.integration_agent_id == agent_id)
        
    processes = query.offset(skip).limit(limit).all()
    return processes

# Read a single Integration Process by ID
@router.get("/integration-processes/{process_id}", response_model=IntegrationProcessResponse)
def read_integration_process(process_id: int, db: Session = Depends(get_db)):
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == process_id).first()
    if process is None:
        raise HTTPException(status_code=404, detail="Integration process not found")
    return process

# Update an Integration Process
@router.put("/integration-processes/{process_id}", response_model=IntegrationProcessResponse)
def update_integration_process(
    process_id: int, 
    updated_process: IntegrationProcessCreate, 
    db: Session = Depends(get_db)
):
    # Verify process exists
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == process_id).first()
    if process is None:
        raise HTTPException(status_code=404, detail="Integration process not found")
    
    # Verify that integration agent exists
    from models.models import IntegrationAgent
    agent = db.query(IntegrationAgent).filter(
        IntegrationAgent.id == updated_process.integration_agent_id
    ).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Integration agent not found")
    
    # Update attributes
    for key, value in updated_process.dict().items():
        setattr(process, key, value)
    
    db.commit()
    db.refresh(process)
    return process

# Delete an Integration Process
@router.delete("/integration-processes/{process_id}", response_model=IntegrationProcessResponse)
def delete_integration_process(process_id: int, db: Session = Depends(get_db)):
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == process_id).first()
    if process is None:
        raise HTTPException(status_code=404, detail="Integration process not found")
    
    # Check for associated tasks, schedules, etc.
    # You might want to implement cascade delete in the database schema
    
    db.delete(process)
    db.commit()
    return process

# Start an Integration Process
@router.post("/integration-processes/{process_id}/start", response_model=IntegrationProcessResponse)
def start_process(process_id: int, db: Session = Depends(get_db)):
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == process_id).first()
    if process is None:
        raise HTTPException(status_code=404, detail="Integration process not found")
    
    # Update status to Running
    process.status = ProcessStatus.Running
    db.commit()
    db.refresh(process)
    return process

# Stop an Integration Process
@router.post("/integration-processes/{process_id}/stop", response_model=IntegrationProcessResponse)
def stop_process(process_id: int, db: Session = Depends(get_db)):
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == process_id).first()
    if process is None:
        raise HTTPException(status_code=404, detail="Integration process not found")
    
    # Update status to Stopped
    process.status = ProcessStatus.Stopped
    db.commit()
    db.refresh(process)
    return process

# Get Process Tasks
@router.get("/integration-processes/{process_id}/tasks")
def get_process_tasks(process_id: int, db: Session = Depends(get_db)):
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == process_id).first()
    if process is None:
        raise HTTPException(status_code=404, detail="Integration process not found")
    
    from models.models import ProcessTask
    tasks = db.query(ProcessTask).filter(ProcessTask.integration_process_id == process_id).all()
    return tasks

# Get Process Schedule
@router.get("/integration-processes/{process_id}/schedule")
def get_process_schedule(process_id: int, db: Session = Depends(get_db)):
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == process_id).first()
    if process is None:
        raise HTTPException(status_code=404, detail="Integration process not found")
    
    from models.models import ProcessSchedule
    schedules = db.query(ProcessSchedule).filter(ProcessSchedule.integration_process_id == process_id).all()
    return schedules 