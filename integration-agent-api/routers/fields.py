from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field as PydanticField
from models.models import Field, DataType, ProcessTask
from database import get_db

router = APIRouter()

# Pydantic models
class FieldBase(BaseModel):
    key: str = PydanticField(..., alias="field_name")
    value: Optional[str] = None
    data_type: DataType = DataType.Single  # Default to Single if not provided
    process_task_id: int
    
    class Config:
        use_enum_values = True
        populate_by_name = True
        allow_population_by_field_name = True

class FieldCreate(FieldBase):
    pass

class FieldResponse(BaseModel):
    id: int
    field_name: str = PydanticField(..., alias="key")
    value: Optional[str] = None
    data_type: DataType
    process_task_id: int
    
    class Config:
        orm_mode = True
        from_attributes = True
        populate_by_name = True
        allow_population_by_field_name = True

# Create a Field
@router.post("/fields/", response_model=FieldResponse)
def create_field(field: FieldCreate, db: Session = Depends(get_db)):
    # Verify that process task exists
    task = db.query(ProcessTask).filter(ProcessTask.id == field.process_task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Process task not found")
    
    # Map from client model to database model
    db_field = Field(
        process_task_id=field.process_task_id,
        field_name=field.key,
        data_type=field.data_type,
        value=field.value
    )
    
    db.add(db_field)
    db.commit()
    db.refresh(db_field)
    return db_field

# Read all Fields
@router.get("/fields/", response_model=List[FieldResponse])
def read_fields(
    skip: int = 0, 
    limit: int = 100, 
    process_task_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Field)
    
    # Filter by process task if specified
    if process_task_id:
        query = query.filter(Field.process_task_id == process_task_id)
        
    fields = query.offset(skip).limit(limit).all()
    return fields

# Read a single Field by ID
@router.get("/fields/{field_id}", response_model=FieldResponse)
def read_field(field_id: int, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == field_id).first()
    if field is None:
        raise HTTPException(status_code=404, detail="Field not found")
    return field

# Update a Field
@router.put("/fields/{field_id}", response_model=FieldResponse)
def update_field(field_id: int, updated_field: FieldCreate, db: Session = Depends(get_db)):
    # Verify field exists
    field = db.query(Field).filter(Field.id == field_id).first()
    if field is None:
        raise HTTPException(status_code=404, detail="Field not found")
    
    # Verify that process task exists
    task = db.query(ProcessTask).filter(ProcessTask.id == updated_field.process_task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Process task not found")
    
    # Update field attributes
    field.process_task_id = updated_field.process_task_id
    field.field_name = updated_field.key
    field.data_type = updated_field.data_type
    field.value = updated_field.value
    
    db.commit()
    db.refresh(field)
    return field

# Delete a Field
@router.delete("/fields/{field_id}", response_model=FieldResponse)
def delete_field(field_id: int, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == field_id).first()
    if field is None:
        raise HTTPException(status_code=404, detail="Field not found")
    
    db.delete(field)
    db.commit()
    return field

# Get fields for a specific task
@router.get("/process-tasks/{task_id}/fields", response_model=List[FieldResponse])
def get_fields_for_task(task_id: int, db: Session = Depends(get_db)):
    # Verify task exists
    task = db.query(ProcessTask).filter(ProcessTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Process task not found")
    
    fields = db.query(Field).filter(Field.process_task_id == task_id).all()
    return fields

# Bulk create fields for a task
@router.post("/process-tasks/{task_id}/fields", response_model=List[FieldResponse])
def create_fields_for_task(task_id: int, fields: List[FieldCreate], db: Session = Depends(get_db)):
    # Verify task exists
    task = db.query(ProcessTask).filter(ProcessTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Process task not found")
    
    db_fields = []
    for field_data in fields:
        # Ensure task_id in request matches URL parameter
        if field_data.process_task_id != task_id:
            raise HTTPException(status_code=400, detail="Field task ID must match the task ID in the URL")
        
        # Map from client model to database model
        db_field = Field(
            process_task_id=field_data.process_task_id,
            field_name=field_data.key,
            data_type=field_data.data_type,
            value=field_data.value
        )
        
        db.add(db_field)
        db_fields.append(db_field)
    
    db.commit()
    
    # Refresh all fields
    for field in db_fields:
        db.refresh(field)
    
    return db_fields 