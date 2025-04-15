import pytest
from fastapi.testclient import TestClient
from tests.conftest import print_db_contents
from models.models import IntegrationType

def test_create_integration_agent(client, db_session):
    print("\nBefore creating agent:")
    print_db_contents(db_session)
    
    agent_data = {
        "name": "Test Agent",
        "code": "TEST001",
        "type": IntegrationType.Service.value,
        "enabled": True,
        "updates_available": False
    }
    
    response = client.post("/api/integration-agents/", json=agent_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Agent"
    assert data["code"] == "TEST001"
    assert data["type"] == IntegrationType.Service.value

def test_get_integration_agent(client, db_session):
    # First create an agent
    agent_data = {
        "name": "Test Agent",
        "code": "TEST001",
        "type": IntegrationType.Service.value,
        "enabled": True,
        "updates_available": False
    }
    create_response = client.post("/api/integration-agents/", json=agent_data)
    created_agent = create_response.json()
    
    # Then get it
    response = client.get(f"/api/integration-agents/{created_agent['id']}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Agent"

def test_get_all_integration_agents(client, db_session):
    # Create multiple agents
    for i in range(3):
        agent_data = {
            "name": f"Test Agent {i}",
            "code": f"TEST00{i}",
            "type": IntegrationType.Service.value,
            "enabled": True,
            "updates_available": False
        }
        client.post("/api/integration-agents/", json=agent_data)
    
    response = client.get("/api/integration-agents/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3

def test_update_integration_agent(client, db_session):
    # First create an agent
    agent_data = {
        "name": "Test Agent",
        "code": "TEST001",
        "type": IntegrationType.Service.value,
        "enabled": True,
        "updates_available": False
    }
    create_response = client.post("/api/integration-agents/", json=agent_data)
    created_agent = create_response.json()
    
    # Update it
    update_data = agent_data.copy()
    update_data["name"] = "Updated Agent"
    update_data["type"] = IntegrationType.Process.value
    response = client.put(
        f"/api/integration-agents/{created_agent['id']}",
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Agent"
    assert data["type"] == IntegrationType.Process.value

def test_delete_integration_agent(client, db_session):
    # First create an agent
    agent_data = {
        "name": "Test Agent",
        "code": "TEST001",
        "type": IntegrationType.Service.value,
        "enabled": True,
        "updates_available": False
    }
    create_response = client.post("/api/integration-agents/", json=agent_data)
    created_agent = create_response.json()
    
    # Delete it
    response = client.delete(f"/api/integration-agents/{created_agent['id']}")
    assert response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(f"/api/integration-agents/{created_agent['id']}")
    assert get_response.status_code == 404 