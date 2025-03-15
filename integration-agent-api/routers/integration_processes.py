from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from models.models import IntegrationProcess, TriggerType
from database import SessionLocal

router = APIRouter()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
class IntegrationProcessBase(BaseModel):
    auto_start: bool = False
    trigger_type: TriggerType

class IntegrationProcessCreate(IntegrationProcessBase):
    pass

class IntegrationProcessResponse(IntegrationProcessBase):
    id: int

    class Config:
        orm_mode = True

# Create an IntegrationProcess
@router.post("/integration_processes/", response_model=IntegrationProcessResponse)
def create_integration_process(process: IntegrationProcessCreate, db: Session = Depends(get_db)):
    db_process = IntegrationProcess(**process.dict())
    db.add(db_process)
    db.commit()
    db.refresh(db_process)
    return db_process

# Read all IntegrationProcesses
@router.get("/integration_processes/", response_model=List[IntegrationProcessResponse])
def read_integration_processes(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    processes = db.query(IntegrationProcess).offset(skip).limit(limit).all()
    return processes

# Read a single IntegrationProcess by ID
@router.get("/integration_processes/{process_id}", response_model=IntegrationProcessResponse)
def read_integration_process(process_id: int, db: Session = Depends(get_db)):
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == process_id).first()
    if process is None:
        raise HTTPException(status_code=404, detail="IntegrationProcess not found")
    return process

# Update an IntegrationProcess
@router.put("/integration_processes/{process_id}", response_model=IntegrationProcessResponse)
def update_integration_process(process_id: int, updated_process: IntegrationProcessCreate, db: Session = Depends(get_db)):
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == process_id).first()
    if process is None:
        raise HTTPException(status_code=404, detail="IntegrationProcess not found")
    for key, value in updated_process.dict().items():
        setattr(process, key, value)
    db.commit()
    db.refresh(process)
    return process

# Delete an IntegrationProcess
@router.delete("/integration_processes/{process_id}", response_model=IntegrationProcessResponse)
def delete_integration_process(process_id: int, db: Session = Depends(get_db)):
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == process_id).first()
    if process is None:
        raise HTTPException(status_code=404, detail="IntegrationProcess not found")
    db.delete(process)
    db.commit()
    return process 