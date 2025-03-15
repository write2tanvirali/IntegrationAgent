from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from models.models import Transformation
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
class TransformationBase(BaseModel):
    condition: str
    c_field_id: int
    v_field_id: int

class TransformationCreate(TransformationBase):
    pass

class TransformationResponse(TransformationBase):
    id: int

    class Config:
        orm_mode = True

# Create a Transformation
@router.post("/transformations/", response_model=TransformationResponse)
def create_transformation(transformation: TransformationCreate, db: Session = Depends(get_db)):
    db_transformation = Transformation(**transformation.dict())
    db.add(db_transformation)
    db.commit()
    db.refresh(db_transformation)
    return db_transformation

# Read all Transformations
@router.get("/transformations/", response_model=List[TransformationResponse])
def read_transformations(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    transformations = db.query(Transformation).offset(skip).limit(limit).all()
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
    transformation = db.query(Transformation).filter(Transformation.id == transformation_id).first()
    if transformation is None:
        raise HTTPException(status_code=404, detail="Transformation not found")
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