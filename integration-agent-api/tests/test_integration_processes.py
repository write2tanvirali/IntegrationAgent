import pytest
from fastapi.testclient import TestClient
from tests.conftest import print_db_contents
from models.models import TriggerType, ProcessStatus

def test_create_integration_process(client, db_session, test_data):
    print("\nBefore creating integration process:")
    print_db_contents(db_session)
    
    process_data = {
        "integration_agent_id": test_data["agent"].id,
        "name": "Test Integration Process",
        "description": "Test description",
        "auto_start": True,
        "trigger_type": TriggerType.WebService.value,
        "status": ProcessStatus.Stopped.value
    }
    
    response = client.post("/api/integration-processes/", json=process_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Integration Process"
    assert data["integration_agent_id"] == test_data["agent"].id
    assert data["trigger_type"] == TriggerType.WebService.value
    assert data["status"] == ProcessStatus.Stopped.value

def test_create_integration_process_invalid_agent(client, db_session):
    process_data = {
        "integration_agent_id": 999,  # Non-existent agent ID
        "name": "Invalid Agent Process",
        "auto_start": True,
        "trigger_type": TriggerType.WebService.value
    }
    
    response = client.post("/api/integration-processes/", json=process_data)
    assert response.status_code == 404
    assert "Integration agent not found" in response.json()["detail"]

def test_get_integration_process(client, db_session, test_data):
    # First create a process
    process_data = {
        "integration_agent_id": test_data["agent"].id,
        "name": "Test Process For Get",
        "auto_start": True,
        "trigger_type": TriggerType.WebService.value
    }
    create_response = client.post("/api/integration-processes/", json=process_data)
    created_process = create_response.json()
    
    # Then get it
    response = client.get(f"/api/integration-processes/{created_process['id']}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Process For Get"
    assert data["trigger_type"] == TriggerType.WebService.value

def test_get_all_integration_processes(client, test_data):
    # Create multiple processes
    for i in range(3):
        process_data = {
            "integration_agent_id": test_data["agent"].id,
            "name": f"Test Process {i}",
            "auto_start": True,
            "trigger_type": TriggerType.WebService.value
        }
        client.post("/api/integration-processes/", json=process_data)
    
    response = client.get("/api/integration-processes/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3  # Could be more from other tests

    # Test filtering by agent_id
    response = client.get(f"/api/integration-processes/?agent_id={test_data['agent'].id}")
    assert response.status_code == 200
    data = response.json()
    for process in data:
        assert process["integration_agent_id"] == test_data["agent"].id

def test_update_integration_process(client, test_data):
    # First create a process
    process_data = {
        "integration_agent_id": test_data["agent"].id,
        "name": "Process To Update",
        "auto_start": True,
        "trigger_type": TriggerType.WebService.value
    }
    create_response = client.post("/api/integration-processes/", json=process_data)
    created_process = create_response.json()
    
    # Update it
    update_data = process_data.copy()
    update_data["name"] = "Updated Process Name"
    update_data["trigger_type"] = TriggerType.Scheduled.value
    response = client.put(
        f"/api/integration-processes/{created_process['id']}",
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Process Name"
    assert data["trigger_type"] == TriggerType.Scheduled.value

def test_delete_integration_process(client, test_data):
    # First create a process
    process_data = {
        "integration_agent_id": test_data["agent"].id,
        "name": "Process To Delete",
        "auto_start": True,
        "trigger_type": TriggerType.WebService.value
    }
    create_response = client.post("/api/integration-processes/", json=process_data)
    created_process = create_response.json()
    
    # Delete it
    response = client.delete(f"/api/integration-processes/{created_process['id']}")
    assert response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(f"/api/integration-processes/{created_process['id']}")
    assert get_response.status_code == 404

def test_start_stop_integration_process(client, test_data):
    # First create a process
    process_data = {
        "integration_agent_id": test_data["agent"].id,
        "name": "Process For Start/Stop",
        "auto_start": False,
        "trigger_type": TriggerType.WebService.value,
        "status": ProcessStatus.Stopped.value
    }
    create_response = client.post("/api/integration-processes/", json=process_data)
    created_process = create_response.json()
    
    # Start it
    response = client.post(f"/api/integration-processes/{created_process['id']}/start")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == ProcessStatus.Running.value
    
    # Stop it
    response = client.post(f"/api/integration-processes/{created_process['id']}/stop")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == ProcessStatus.Stopped.value 