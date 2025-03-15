from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from models.models import ProcessTask, TaskType, LogicType
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
class ProcessTaskBase(BaseModel):
    task_name: str
    type: TaskType
    static_fields: str = None
    input_source: str = None
    input: str = None
    save_input: bool = False
    logic_type: LogicType = None
    response: str = None
    conditions: str = None

class ProcessTaskCreate(ProcessTaskBase):
    pass

class ProcessTaskResponse(ProcessTaskBase):
    id: int

    class Config:
        orm_mode = True

# Create a ProcessTask
@router.post("/process_tasks/", response_model=ProcessTaskResponse)
def create_process_task(task: ProcessTaskCreate, db: Session = Depends(get_db)):
    db_task = ProcessTask(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# Read all ProcessTasks
@router.get("/process_tasks/", response_model=List[ProcessTaskResponse])
def read_process_tasks(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    tasks = db.query(ProcessTask).offset(skip).limit(limit).all()
    return tasks

# Read a single ProcessTask by ID
@router.get("/process_tasks/{task_id}", response_model=ProcessTaskResponse)
def read_process_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(ProcessTask).filter(ProcessTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="ProcessTask not found")
    return task

# Update a ProcessTask
@router.put("/process_tasks/{task_id}", response_model=ProcessTaskResponse)
def update_process_task(task_id: int, updated_task: ProcessTaskCreate, db: Session = Depends(get_db)):
    task = db.query(ProcessTask).filter(ProcessTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="ProcessTask not found")
    for key, value in updated_task.dict().items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task

# Delete a ProcessTask
@router.delete("/process_tasks/{task_id}", response_model=ProcessTaskResponse)
def delete_process_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(ProcessTask).filter(ProcessTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="ProcessTask not found")
    db.delete(task)
    db.commit()
    return task 