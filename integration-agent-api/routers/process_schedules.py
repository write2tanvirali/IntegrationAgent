from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from models.models import ProcessSchedule, Recurrence, IntegrationProcess
from database import get_db
from datetime import datetime

router = APIRouter()

# Pydantic models
class ProcessScheduleBase(BaseModel):
    integration_process_id: int
    recurrence_type: Recurrence
    start_date: str
    enabled: bool = True
    interval_minutes: int = 0
    day_of_week: int = 0
    day_of_month: int = 0
    month: int = 0
    hour: int = 0
    minute: int = 0
    
    class Config:
        use_enum_values = True

class ProcessScheduleCreate(ProcessScheduleBase):
    pass

class ProcessScheduleResponse(ProcessScheduleBase):
    id: int
    
    class Config:
        orm_mode = True
        from_attributes = True

# Create a Process Schedule
@router.post("/process-schedules/", response_model=ProcessScheduleResponse)
def create_process_schedule(schedule: ProcessScheduleCreate, db: Session = Depends(get_db)):
    # Verify that integration process exists
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == schedule.integration_process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Integration process not found")
    
    # Validate schedule data based on recurrence type
    if schedule.recurrence_type == Recurrence.Interval and schedule.interval_minutes <= 0:
        raise HTTPException(status_code=400, detail="Interval recurrence requires a positive interval_minutes value")
    
    # Additional validation for different recurrence types
    if schedule.recurrence_type == Recurrence.Weekly and not (0 <= schedule.day_of_week <= 6):
        raise HTTPException(status_code=400, detail="Weekly recurrence requires day_of_week between 0-6")
    
    if schedule.recurrence_type == Recurrence.Monthly and not (1 <= schedule.day_of_month <= 31):
        raise HTTPException(status_code=400, detail="Monthly recurrence requires day_of_month between 1-31")
    
    # Validate time components
    if not (0 <= schedule.hour <= 23):
        raise HTTPException(status_code=400, detail="Hour must be between 0-23")
    
    if not (0 <= schedule.minute <= 59):
        raise HTTPException(status_code=400, detail="Minute must be between 0-59")
    
    db_schedule = ProcessSchedule(**schedule.dict())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

# Read all Process Schedules
@router.get("/process-schedules/", response_model=List[ProcessScheduleResponse])
def read_process_schedules(
    skip: int = 0, 
    limit: int = 100, 
    process_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProcessSchedule)
    
    # Filter by process if specified
    if process_id:
        query = query.filter(ProcessSchedule.integration_process_id == process_id)
        
    schedules = query.offset(skip).limit(limit).all()
    return schedules

# Read a single Process Schedule by ID
@router.get("/process-schedules/{schedule_id}", response_model=ProcessScheduleResponse)
def read_process_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(ProcessSchedule).filter(ProcessSchedule.id == schedule_id).first()
    if schedule is None:
        raise HTTPException(status_code=404, detail="Process schedule not found")
    return schedule

# Update a Process Schedule
@router.put("/process-schedules/{schedule_id}", response_model=ProcessScheduleResponse)
def update_process_schedule(schedule_id: int, updated_schedule: ProcessScheduleCreate, db: Session = Depends(get_db)):
    # Verify schedule exists
    schedule = db.query(ProcessSchedule).filter(ProcessSchedule.id == schedule_id).first()
    if schedule is None:
        raise HTTPException(status_code=404, detail="Process schedule not found")
    
    # Verify that integration process exists
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == updated_schedule.integration_process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Integration process not found")
    
    # Validate schedule data based on recurrence type
    if updated_schedule.recurrence_type == Recurrence.Interval and updated_schedule.interval_minutes <= 0:
        raise HTTPException(status_code=400, detail="Interval recurrence requires a positive interval_minutes value")
    
    # Additional validation for different recurrence types
    if updated_schedule.recurrence_type == Recurrence.Weekly and not (0 <= updated_schedule.day_of_week <= 6):
        raise HTTPException(status_code=400, detail="Weekly recurrence requires day_of_week between 0-6")
    
    if updated_schedule.recurrence_type == Recurrence.Monthly and not (1 <= updated_schedule.day_of_month <= 31):
        raise HTTPException(status_code=400, detail="Monthly recurrence requires day_of_month between 1-31")
    
    # Validate time components
    if not (0 <= updated_schedule.hour <= 23):
        raise HTTPException(status_code=400, detail="Hour must be between 0-23")
    
    if not (0 <= updated_schedule.minute <= 59):
        raise HTTPException(status_code=400, detail="Minute must be between 0-59")
    
    # Update attributes
    for key, value in updated_schedule.dict().items():
        setattr(schedule, key, value)
    
    db.commit()
    db.refresh(schedule)
    return schedule

# Delete a Process Schedule
@router.delete("/process-schedules/{schedule_id}", response_model=ProcessScheduleResponse)
def delete_process_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(ProcessSchedule).filter(ProcessSchedule.id == schedule_id).first()
    if schedule is None:
        raise HTTPException(status_code=404, detail="Process schedule not found")
    
    db.delete(schedule)
    db.commit()
    return schedule

# Get schedule for a specific process
@router.get("/integration-processes/{process_id}/schedule", response_model=ProcessScheduleResponse)
def get_schedule_for_process(process_id: int, db: Session = Depends(get_db)):
    # Verify process exists
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == process_id).first()
    if process is None:
        raise HTTPException(status_code=404, detail="Integration process not found")
    
    schedule = db.query(ProcessSchedule).filter(ProcessSchedule.integration_process_id == process_id).first()
    if schedule is None:
        raise HTTPException(status_code=404, detail="Schedule not found for this process")
    
    return schedule

# Create schedule for a specific process
@router.post("/integration-processes/{process_id}/schedule", response_model=ProcessScheduleResponse)
def create_schedule_for_process(process_id: int, schedule: ProcessScheduleCreate, db: Session = Depends(get_db)):
    # Verify process exists
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == process_id).first()
    if process is None:
        raise HTTPException(status_code=404, detail="Integration process not found")
    
    # Ensure process_id in request matches URL parameter
    if schedule.integration_process_id != process_id:
        raise HTTPException(status_code=400, detail="Schedule process ID must match the process ID in the URL")
    
    # Check if process already has a schedule
    existing_schedule = db.query(ProcessSchedule).filter(ProcessSchedule.integration_process_id == process_id).first()
    if existing_schedule:
        raise HTTPException(status_code=400, detail="This process already has a schedule")
    
    # Validate schedule data based on recurrence type
    if schedule.recurrence_type == Recurrence.Interval and schedule.interval_minutes <= 0:
        raise HTTPException(status_code=400, detail="Interval recurrence requires a positive interval_minutes value")
    
    db_schedule = ProcessSchedule(**schedule.dict())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule 