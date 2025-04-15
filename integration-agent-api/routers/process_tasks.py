from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field as PydanticField
from models.models import ProcessTask, TaskType, LogicType, InputSource, ConnectorType, OptionType, Field, IntegrationProcess, DataType
import models.models as models
from database import get_db

router = APIRouter()

# Pydantic models for Field
class FieldBase(BaseModel):
    key: str
    data_type: DataType
    value: Optional[str] = None
    
    class Config:
        use_enum_values = True
        populate_by_name = True
        allow_population_by_field_name = True

class FieldCreate(FieldBase):
    pass

class FieldResponse(BaseModel):
    id: int
    key: str = PydanticField(alias="field_name")  # Map field_name to key
    data_type: DataType
    value: Optional[str] = None
    
    class Config:
        orm_mode = True
        from_attributes = True
        populate_by_name = True
        allow_population_by_field_name = True

# Pydantic models for ProcessTask
class ProcessTaskBase(BaseModel):
    integration_process_id: int
    task_name: str
    description: Optional[str] = None
    type: TaskType
    sequence_number: Optional[int] = None
    enabled: bool = True
    
    # Task Common Fields
    input_source: Optional[InputSource] = None
    input: Optional[str] = None
    save_input: bool = False
    
    # LogicTask Fields
    logic_type: Optional[LogicType] = None
    response: Optional[str] = None
    
    # ActionTask Fields
    connector_type: Optional[ConnectorType] = None
    option_type: Optional[OptionType] = OptionType.NONE 
    
    class Config:
        use_enum_values = True

class ProcessTaskCreate(ProcessTaskBase):
    static_fields: Optional[List[FieldCreate]] = None

class ProcessTaskResponse(ProcessTaskBase):
    id: int
    static_fields: List[FieldResponse] = []
    
    class Config:
        orm_mode = True
        from_attributes = True
        populate_by_name = True
        allow_population_by_field_name = True
        
        # Use the Field class that we've already imported
        json_encoders = {
            Field: lambda f: {
                "id": f.id,
                "key": f.field_name,
                "data_type": f.data_type.value,
                "value": f.value
            }
        }

# Create a ProcessTask with fields
@router.post("/process-tasks/", response_model=ProcessTaskResponse)
def create_process_task(task: ProcessTaskCreate, db: Session = Depends(get_db)):
    # Verify that integration process exists
    process = db.query(IntegrationProcess).filter(IntegrationProcess.id == task.integration_process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Integration process not found")
    
    # Extract static_fields from request
    static_fields = task.static_fields
    task_dict = task.dict(exclude={"static_fields"})
    
    # Create the task
    db_task = ProcessTask(**task_dict)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Create static fields if provided
    if static_fields:
        for field_data in static_fields:
            # Map from client model to database model
            db_field = Field(
                process_task_id=db_task.id,
                field_name=field_data.key,  # Use key as field_name
                data_type=field_data.data_type,
                value=field_data.value
            )
            
            db.add(db_field)
        
        db.commit()
    
    return db_task

# Read all ProcessTasks
@router.get("/process-tasks/", response_model=List[ProcessTaskResponse])
def read_process_tasks(
    skip: int = 0, 
    limit: int = 100, 
    process_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProcessTask)
    
    # Filter by process if specified
    if process_id:
        query = query.filter(ProcessTask.integration_process_id == process_id)
        
    # Order by sequence number
    query = query.order_by(ProcessTask.sequence_number)
    
    tasks = query.offset(skip).limit(limit).all()
    return tasks

# Read a single ProcessTask by ID
@router.get("/process-tasks/{task_id}", response_model=ProcessTaskResponse)
def read_process_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(ProcessTask).filter(ProcessTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Process task not found")
    return task

# Update a ProcessTask
@router.put("/process-tasks/{task_id}", response_model=ProcessTaskResponse)
def update_process_task(task_id: int, updated_task: ProcessTaskCreate, db: Session = Depends(get_db)):
    # Verify task exists
    task = db.query(ProcessTask).filter(ProcessTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Process task not found")
    
    # Verify that integration process exists
    process = db.query(IntegrationProcess).filter(
        IntegrationProcess.id == updated_task.integration_process_id
    ).first()
    if not process:
        raise HTTPException(status_code=404, detail="Integration process not found")
    
    # Extract static fields from request
    static_fields = updated_task.static_fields
    task_dict = updated_task.dict(exclude={"static_fields"})
    
    # Update task attributes
    for key, value in task_dict.items():
        setattr(task, key, value)
    
    # Handle fields update - delete existing fields and add new ones
    db.query(Field).filter(Field.process_task_id == task_id).delete()
    
    if static_fields:
        for field_data in static_fields:
            db_field = Field(
                process_task_id=task_id,
                field_name=field_data.key,  # Use key as field_name
                data_type=field_data.data_type,
                value=field_data.value
            )
            db.add(db_field)
    
    db.commit()
    db.refresh(task)
    return task

# Delete a ProcessTask
@router.delete("/process-tasks/{task_id}", response_model=ProcessTaskResponse)
def delete_process_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(ProcessTask).filter(ProcessTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Process task not found")
    
    # Check for associated connectors, fields, transformations
    # You might want to implement cascade delete in the database schema
    
    db.delete(task)
    db.commit()
    return task

# Reorder ProcessTasks
@router.post("/process-tasks/reorder")
def reorder_process_tasks(task_ids: List[int], db: Session = Depends(get_db)):
    """
    Reorder process tasks by assigning new sequence numbers.
    The order of task_ids in the list determines the new sequence.
    """
    # Verify all tasks exist
    tasks = db.query(ProcessTask).filter(ProcessTask.id.in_(task_ids)).all()
    if len(tasks) != len(task_ids):
        raise HTTPException(status_code=404, detail="One or more tasks not found")
    
    # Create a mapping of task id to task
    task_map = {task.id: task for task in tasks}
    
    # Update sequence numbers
    for i, task_id in enumerate(task_ids):
        task_map[task_id].sequence_number = (i + 1) * 10
    
    db.commit()
    
    # Return updated tasks
    tasks = db.query(ProcessTask).filter(ProcessTask.id.in_(task_ids)).order_by(ProcessTask.sequence_number).all()
    return tasks

# Get task connectors
@router.get("/process-tasks/{task_id}/connectors")
def get_task_connectors(task_id: int, db: Session = Depends(get_db)):
    task = db.query(ProcessTask).filter(ProcessTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Process task not found")
    
    # Return connectors associated with this task
    from models.models import Connector
    connectors = db.query(Connector).filter(Connector.process_task_id == task_id).all()
    return connectors

# Get task fields
@router.get("/process-tasks/{task_id}/fields")
def get_task_fields(task_id: int, db: Session = Depends(get_db)):
    task = db.query(ProcessTask).filter(ProcessTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Process task not found")
    
    # Return fields associated with this task
    from models.models import Field
    fields = db.query(Field).filter(Field.process_task_id == task_id).all()
    return fields

# Get task transformations
@router.get("/process-tasks/{task_id}/transformations")
def get_task_transformations(task_id: int, db: Session = Depends(get_db)):
    task = db.query(ProcessTask).filter(ProcessTask.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Process task not found")
    
    # Return transformations associated with this task
    from models.models import Transformation
    transformations = db.query(Transformation).filter(Transformation.process_task_id == task_id).all()
    return transformations 