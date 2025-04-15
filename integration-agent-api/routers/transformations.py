from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from models.models import Transformation, ConditionType, Field, ProcessTask
from database import get_db

router = APIRouter()

# Pydantic models
class TransformationBase(BaseModel):
    condition_type: ConditionType
    c_field_id: int
    v_field_id: int
    process_task_id: int
    
    class Config:
        use_enum_values = True

class TransformationCreate(TransformationBase):
    pass

class TransformationResponse(TransformationBase):
    id: int
    
    class Config:
        orm_mode = True

# Create a Transformation
@router.post("/transformations/", response_model=TransformationResponse)
def create_transformation(transformation: TransformationCreate, db: Session = Depends(get_db)):
    # Verify that process task exists
    task = db.query(ProcessTask).filter(ProcessTask.id == transformation.process_task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Process task not found")
    
    # Verify that fields exist
    c_field = db.query(Field).filter(Field.id == transformation.c_field_id).first()
    if not c_field:
        raise HTTPException(status_code=404, detail="Condition field not found")
    
    v_field = db.query(Field).filter(Field.id == transformation.v_field_id).first()
    if not v_field:
        raise HTTPException(status_code=404, detail="Value field not found")
    
    db_transformation = Transformation(**transformation.dict())
    db.add(db_transformation)
    db.commit()
    db.refresh(db_transformation)
    return db_transformation

# Read all Transformations
@router.get("/transformations/", response_model=List[TransformationResponse])
def read_transformations(
    skip: int = 0, 
    limit: int = 100, 
    process_task_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transformation)
    
    # Filter by process task if specified
    if process_task_id:
        query = query.filter(Transformation.process_task_id == process_task_id)
        
    transformations = query.offset(skip).limit(limit).all()
    return transformations

# Read a single Transformation by ID
@router.get("/transformations/{transformation_id}", response_model=TransformationResponse)
def read_transformation(transformation_id: int, db: Session = Depends(get_db)):
    transformation = db.query(Transformation).filter(Transformation.id == transformation_id).first()
    if transformation is None:
        raise HTTPException(status_code=404, detail="Transformation not found")
    return transformation

# Update a Transformation
@router.put("/transformations/{transformation_id}", response_model=TransformationResponse)
def update_transformation(transformation_id: int, updated_transformation: TransformationCreate, db: Session = Depends(get_db)):
    # Verify transformation exists
    transformation = db.query(Transformation).filter(Transformation.id == transformation_id).first()
    if transformation is None:
        raise HTTPException(status_code=404, detail="Transformation not found")
    
    # Verify that process task exists
    task = db.query(ProcessTask).filter(ProcessTask.id == updated_transformation.process_task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Process task not found")
    
    # Verify that fields exist
    c_field = db.query(Field).filter(Field.id == updated_transformation.c_field_id).first()
    if not c_field:
        raise HTTPException(status_code=404, detail="Condition field not found")
    
    v_field = db.query(Field).filter(Field.id == updated_transformation.v_field_id).first()
    if not v_field:
        raise HTTPException(status_code=404, detail="Value field not found")
    
    # Update attributes
    for key, value in updated_transformation.dict().items():
        setattr(transformation, key, value)
    
    db.commit()
    db.refresh(transformation)
    return transformation

# Delete a Transformation
@router.delete("/transformations/{transformation_id}", response_model=TransformationResponse)
def delete_transformation(transformation_id: int, db: Session = Depends(get_db)):
    transformation = db.query(Transformation).filter(Transformation.id == transformation_id).first()
    if transformation is None:
        raise HTTPException(status_code=404, detail="Transformation not found")
    
    db.delete(transformation)
    db.commit()
    return transformation

# Get transformations for a specific task
@router.get("/process-tasks/{task_id}/transformations", response_model=List[TransformationResponse])
def get_transformations_for_task(task_id: int, db: Session = Depends(get_db)):
    # Verify task exists
    task = db.query(ProcessTask).filter(ProcessTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Process task not found")
    
    transformations = db.query(Transformation).filter(Transformation.process_task_id == task_id).all()
    return transformations

# Bulk create transformations for a task
@router.post("/process-tasks/{task_id}/transformations", response_model=List[TransformationResponse])
def create_transformations_for_task(task_id: int, transformations: List[TransformationCreate], db: Session = Depends(get_db)):
    # Verify task exists
    task = db.query(ProcessTask).filter(ProcessTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Process task not found")
    
    db_transformations = []
    for transformation_data in transformations:
        # Ensure task_id in request matches URL parameter
        if transformation_data.process_task_id != task_id:
            raise HTTPException(status_code=400, detail="Transformation task ID must match the task ID in the URL")
        
        # Verify that fields exist
        c_field = db.query(Field).filter(Field.id == transformation_data.c_field_id).first()
        if not c_field:
            raise HTTPException(status_code=404, detail=f"Condition field with ID {transformation_data.c_field_id} not found")
        
        v_field = db.query(Field).filter(Field.id == transformation_data.v_field_id).first()
        if not v_field:
            raise HTTPException(status_code=404, detail=f"Value field with ID {transformation_data.v_field_id} not found")
        
        db_transformation = Transformation(**transformation_data.dict())
        db.add(db_transformation)
        db_transformations.append(db_transformation)
    
    db.commit()
    
    # Refresh all transformations
    for transformation in db_transformations:
        db.refresh(transformation)
    
    return db_transformations 