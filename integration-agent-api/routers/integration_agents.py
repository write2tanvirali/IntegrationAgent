from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from models.models import IntegrationAgent, IntegrationType
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
class IntegrationAgentBase(BaseModel):
    name: str
    code: str
    type: IntegrationType
    enabled: bool = True
    updates_available: bool = False

class IntegrationAgentCreate(IntegrationAgentBase):
    pass

class IntegrationAgentResponse(IntegrationAgentBase):
    id: int

    class Config:
        orm_mode = True

# Create an IntegrationAgent
@router.post("/integration_agents/", response_model=IntegrationAgentResponse)
def create_integration_agent(agent: IntegrationAgentCreate, db: Session = Depends(get_db)):
    db_agent = IntegrationAgent(**agent.dict())
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

# Read all IntegrationAgents
@router.get("/integration_agents/", response_model=List[IntegrationAgentResponse])
def read_integration_agents(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    agents = db.query(IntegrationAgent).offset(skip).limit(limit).all()
    return agents

# Read a single IntegrationAgent by ID
@router.get("/integration_agents/{agent_id}", response_model=IntegrationAgentResponse)
def read_integration_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(IntegrationAgent).filter(IntegrationAgent.id == agent_id).first()
    if agent is None:
        raise HTTPException(status_code=404, detail="IntegrationAgent not found")
    return agent

# Update an IntegrationAgent
@router.put("/integration_agents/{agent_id}", response_model=IntegrationAgentResponse)
def update_integration_agent(agent_id: int, updated_agent: IntegrationAgentCreate, db: Session = Depends(get_db)):
    agent = db.query(IntegrationAgent).filter(IntegrationAgent.id == agent_id).first()
    if agent is None:
        raise HTTPException(status_code=404, detail="IntegrationAgent not found")
    for key, value in updated_agent.dict().items():
        setattr(agent, key, value)
    db.commit()
    db.refresh(agent)
    return agent

# Delete an IntegrationAgent
@router.delete("/integration_agents/{agent_id}", response_model=IntegrationAgentResponse)
def delete_integration_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(IntegrationAgent).filter(IntegrationAgent.id == agent_id).first()
    if agent is None:
        raise HTTPException(status_code=404, detail="IntegrationAgent not found")
    db.delete(agent)
    db.commit()
    return agent 