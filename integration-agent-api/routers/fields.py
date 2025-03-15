from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from models.models import Field
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
class FieldBase(BaseModel):
    name: str
    value: str = None

class FieldCreate(FieldBase):
    pass

class FieldResponse(FieldBase):
    id: int

    class Config:
        orm_mode = True

# Create a Field
@router.post("/fields/", response_model=FieldResponse)
def create_field(field: FieldCreate, db: Session = Depends(get_db)):
    db_field = Field(**field.dict())
    db.add(db_field)
    db.commit()
    db.refresh(db_field)
    return db_field

# Read all Fields
@router.get("/fields/", response_model=List[FieldResponse])
def read_fields(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    fields = db.query(Field).offset(skip).limit(limit).all()
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
    field = db.query(Field).filter(Field.id == field_id).first()
    if field is None:
        raise HTTPException(status_code=404, detail="Field not found")
    for key, value in updated_field.dict().items():
        setattr(field, key, value)
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