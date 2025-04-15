from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import integration_agents, integration_processes, process_schedules, process_tasks, connectors, fields, transformations, auth
from db_init import init_db

app = FastAPI()

# Initialize database tables
init_db()

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

# Update CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(integration_agents.router, prefix="/api", tags=["integration-agents"])
app.include_router(integration_processes.router, prefix="/api")
app.include_router(process_schedules.router, prefix="/api")
app.include_router(process_tasks.router, prefix="/api")
app.include_router(connectors.router, prefix="/api", tags=["connectors"])
app.include_router(fields.router, prefix="/api")
app.include_router(transformations.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Integration Agent API"}

# Run the application with: uvicorn main:app --reload
# Access the Swagger UI at: http://localhost:8000/docs 