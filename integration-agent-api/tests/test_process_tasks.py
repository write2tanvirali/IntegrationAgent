import pytest
from fastapi.testclient import TestClient
from tests.conftest import print_db_contents
from models.models import TaskType, InputSource, LogicType, ConnectorType, OptionType, DataType

def test_create_process_task(client, db_session, test_data):
    print("\nBefore creating process task:")
    print_db_contents(db_session)
    
    task_data = {
        "integration_process_id": test_data["process"].id,
        "task_name": "Test Task",
        "description": "Task for testing",
        "type": TaskType.Action.value,
        "enabled": True,
        "input_source": InputSource.Static.value,
        "input": "test input",
        "save_input": True,
        "connector_type": ConnectorType.WebService.value,
        "option_type": OptionType.Basic.value,
        "static_fields": [
            {
                "field_name": "Field1",
                "data_type": DataType.Single.value,
                "value": "test value"
            },
            {
                "field_name": "Field2",
                "data_type": DataType.Collection.value,
                "value": "[]"
            }
        ]
    }
    
    response = client.post("/api/process-tasks/", json=task_data)
    assert response.status_code == 200
    data = response.json()
    assert data["task_name"] == "Test Task"
    assert data["integration_process_id"] == test_data["process"].id
    assert data["type"] == TaskType.Action.value
    assert data["input_source"] == InputSource.Static.value
    assert data["input"] == "test input"
    assert data["save_input"] == True
    assert data["connector_type"] == ConnectorType.WebService.value
    assert data["option_type"] == OptionType.Basic.value
    assert "sequence_number" in data  # Should auto-assign a sequence number
    assert len(data["static_fields"]) == 2

def test_create_logic_task(client, test_data):
    task_data = {
        "integration_process_id": test_data["process"].id,
        "task_name": "Logic Task",
        "description": "Logic task for testing",
        "type": TaskType.Logic.value,
        "logic_type": LogicType.IfElse.value,
        "response": "logic response",
        "static_fields": []
    }
    
    response = client.post("/api/process-tasks/", json=task_data)
    assert response.status_code == 200
    data = response.json()
    assert data["task_name"] == "Logic Task"
    assert data["type"] == TaskType.Logic.value
    assert data["logic_type"] == LogicType.IfElse.value
    assert data["response"] == "logic response"

def test_create_process_task_invalid_process(client, db_session):
    task_data = {
        "integration_process_id": 999,  # Non-existent process ID
        "task_name": "Invalid Process Task",
        "type": TaskType.Action.value
    }
    
    response = client.post("/api/process-tasks/", json=task_data)
    assert response.status_code == 404
    assert "Integration process not found" in response.json()["detail"]

def test_get_process_task(client, db_session, test_data):
    # First create a task
    task_data = {
        "integration_process_id": test_data["process"].id,
        "task_name": "Task For Get",
        "type": TaskType.Action.value
    }
    create_response = client.post("/api/process-tasks/", json=task_data)
    created_task = create_response.json()
    
    # Then get it
    response = client.get(f"/api/process-tasks/{created_task['id']}")
    assert response.status_code == 200
    data = response.json()
    assert data["task_name"] == "Task For Get"
    assert data["type"] == TaskType.Action.value

def test_get_process_tasks_by_process(client, test_data):
    # Create multiple tasks for the same process
    for i in range(3):
        task_data = {
            "integration_process_id": test_data["process"].id,
            "task_name": f"Test Task {i}",
            "type": TaskType.Action.value,
            "sequence_number": i * 10
        }
        client.post("/api/process-tasks/", json=task_data)
    
    # Get all tasks for this process
    response = client.get(f"/api/process-tasks/?process_id={test_data['process'].id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3  # Could be more from other tests
    
    # Verify tasks are ordered by sequence number
    seq_numbers = [task["sequence_number"] for task in data]
    assert seq_numbers == sorted(seq_numbers)

def test_update_process_task(client, test_data):
    # First create a task
    task_data = {
        "integration_process_id": test_data["process"].id,
        "task_name": "Task To Update",
        "type": TaskType.Action.value
    }
    create_response = client.post("/api/process-tasks/", json=task_data)
    created_task = create_response.json()
    
    # Update it
    update_data = task_data.copy()
    update_data["task_name"] = "Updated Task Name"
    update_data["type"] = TaskType.Transformation.value
    response = client.put(
        f"/api/process-tasks/{created_task['id']}",
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["task_name"] == "Updated Task Name"
    assert data["type"] == TaskType.Transformation.value

def test_delete_process_task(client, test_data):
    # First create a task
    task_data = {
        "integration_process_id": test_data["process"].id,
        "task_name": "Task To Delete",
        "type": TaskType.Action.value
    }
    create_response = client.post("/api/process-tasks/", json=task_data)
    created_task = create_response.json()
    
    # Delete it
    response = client.delete(f"/api/process-tasks/{created_task['id']}")
    assert response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(f"/api/process-tasks/{created_task['id']}")
    assert get_response.status_code == 404

def test_reorder_process_tasks(client, test_data):
    # Create multiple tasks
    task_ids = []
    for i in range(3):
        task_data = {
            "integration_process_id": test_data["process"].id,
            "task_name": f"Reorder Task {i}",
            "type": TaskType.Action.value
        }
        response = client.post("/api/process-tasks/", json=task_data)
        task_ids.append(response.json()["id"])
    
    # Reorder tasks (reverse the order)
    reorder_response = client.post(
        "/api/process-tasks/reorder",
        json=list(reversed(task_ids))
    )
    assert reorder_response.status_code == 200
    reordered_tasks = reorder_response.json()
    
    # Verify the new order
    assert [task["id"] for task in reordered_tasks] == list(reversed(task_ids))
    
    # Verify sequence numbers are updated
    seq_numbers = [task["sequence_number"] for task in reordered_tasks]
    assert seq_numbers == sorted(seq_numbers) 