from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from models.models import ProcessSchedule, Recurrence
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
class ProcessScheduleBase(BaseModel):
    recurrence: Recurrence
    time: str
    days: str = None
    interval: int = None

class ProcessScheduleCreate(ProcessScheduleBase):
    pass

class ProcessScheduleResponse(ProcessScheduleBase):
    id: int

    class Config:
        orm_mode = True

# Create a ProcessSchedule
@router.post("/process_schedules/", response_model=ProcessScheduleResponse)
def create_process_schedule(schedule: ProcessScheduleCreate, db: Session = Depends(get_db)):
    db_schedule = ProcessSchedule(**schedule.dict())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

# Read all ProcessSchedules
@router.get("/process_schedules/", response_model=List[ProcessScheduleResponse])
def read_process_schedules(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    schedules = db.query(ProcessSchedule).offset(skip).limit(limit).all()
    return schedules

# Read a single ProcessSchedule by ID
@router.get("/process_schedules/{schedule_id}", response_model=ProcessScheduleResponse)
def read_process_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(ProcessSchedule).filter(ProcessSchedule.id == schedule_id).first()
    if schedule is None:
        raise HTTPException(status_code=404, detail="ProcessSchedule not found")
    return schedule

# Update a ProcessSchedule
@router.put("/process_schedules/{schedule_id}", response_model=ProcessScheduleResponse)
def update_process_schedule(schedule_id: int, updated_schedule: ProcessScheduleCreate, db: Session = Depends(get_db)):
    schedule = db.query(ProcessSchedule).filter(ProcessSchedule.id == schedule_id).first()
    if schedule is None:
        raise HTTPException(status_code=404, detail="ProcessSchedule not found")
    for key, value in updated_schedule.dict().items():
        setattr(schedule, key, value)
    db.commit()
    db.refresh(schedule)
    return schedule

# Delete a ProcessSchedule
@router.delete("/process_schedules/{schedule_id}", response_model=ProcessScheduleResponse)
def delete_process_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(ProcessSchedule).filter(ProcessSchedule.id == schedule_id).first()
    if schedule is None:
        raise HTTPException(status_code=404, detail="ProcessSchedule not found")
    db.delete(schedule)
    db.commit()
    return schedule 