from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.models import Base, User  # Import User model explicitly

DATABASE_URL = "sqlite:///./integration_agent.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)

# Initialize the database
init_db()
