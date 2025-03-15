from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from models.models import Connector, ConnectorType
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
class ConnectorBase(BaseModel):
    connector_type: ConnectorType

class ConnectorCreate(ConnectorBase):
    pass

class ConnectorResponse(ConnectorBase):
    id: int

    class Config:
        orm_mode = True

# Create a Connector
@router.post("/connectors/", response_model=ConnectorResponse)
def create_connector(connector: ConnectorCreate, db: Session = Depends(get_db)):
    db_connector = Connector(**connector.dict())
    db.add(db_connector)
    db.commit()
    db.refresh(db_connector)
    return db_connector

# Read all Connectors
@router.get("/connectors/", response_model=List[ConnectorResponse])
def read_connectors(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    connectors = db.query(Connector).offset(skip).limit(limit).all()
    return connectors

# Read a single Connector by ID
@router.get("/connectors/{connector_id}", response_model=ConnectorResponse)
def read_connector(connector_id: int, db: Session = Depends(get_db)):
    connector = db.query(Connector).filter(Connector.id == connector_id).first()
    if connector is None:
        raise HTTPException(status_code=404, detail="Connector not found")
    return connector

# Update a Connector
@router.put("/connectors/{connector_id}", response_model=ConnectorResponse)
def update_connector(connector_id: int, updated_connector: ConnectorCreate, db: Session = Depends(get_db)):
    connector = db.query(Connector).filter(Connector.id == connector_id).first()
    if connector is None:
        raise HTTPException(status_code=404, detail="Connector not found")
    for key, value in updated_connector.dict().items():
        setattr(connector, key, value)
    db.commit()
    db.refresh(connector)
    return connector

# Delete a Connector
@router.delete("/connectors/{connector_id}", response_model=ConnectorResponse)
def delete_connector(connector_id: int, db: Session = Depends(get_db)):
    connector = db.query(Connector).filter(Connector.id == connector_id).first()
    if connector is None:
        raise HTTPException(status_code=404, detail="Connector not found")
    db.delete(connector)
    db.commit()
    return connector 