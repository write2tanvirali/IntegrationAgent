import pytest
from fastapi.testclient import TestClient
from tests.conftest import print_db_contents
from models.models import Connector, DataType, ConnectorType, ServiceType

def test_create_connector(client, db_session, test_data):
    print("\nBefore creating connector:")
    print_db_contents(db_session)
    
    connector_data = {
        "data_type": DataType.Single.value,
        "connector_type": ConnectorType.WebService.value,
        "service_type": ServiceType.REST.value,
        "end_point": "http://test.api/endpoint",
        "response_tag": "data",
        "process_task_id": test_data["task"].id
    }
    
    response = client.post("/api/connectors/", json=connector_data)
    assert response.status_code == 200
    data = response.json()
    assert data["data_type"] == DataType.Single.value
    assert data["connector_type"] == ConnectorType.WebService.value
    assert data["end_point"] == "http://test.api/endpoint"

    # Print final database state
    print("\nAfter creating connector:")
    print_db_contents(db_session)

def test_create_email_connector(client, db_session, test_data):
    response = client.post(
        "/api/connectors/",
        json={
            "data_type": DataType.Single.value,
            "connector_type": ConnectorType.Email.value,
            "from_email": "test@example.com",
            "email": "recipient@example.com",
            "subject": "Test Email",
            "process_task_id": test_data["task"].id
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["from_email"] == "test@example.com"
    assert data["email"] == "recipient@example.com"

def test_get_connector(client, db_session, test_data):
    # First create a connector
    connector_data = {
        "data_type": DataType.Single.value,
        "connector_type": ConnectorType.WebService.value,
        "service_type": ServiceType.REST.value,
        "end_point": "http://test.api/endpoint",
        "response_tag": "data",
        "process_task_id": test_data["task"].id
    }
    create_response = client.post("/api/connectors/", json=connector_data)
    created_connector = create_response.json()
    
    # Then get it
    response = client.get(f"/api/connectors/{created_connector['id']}")
    assert response.status_code == 200
    data = response.json()
    assert data["data_type"] == DataType.Single.value
    assert data["end_point"] == "http://test.api/endpoint"

def test_get_all_connectors(client, db_session, test_data):
    # Create multiple connectors
    for i in range(3):
        connector_data = {
            "data_type": DataType.Single.value,
            "connector_type": ConnectorType.WebService.value,
            "service_type": ServiceType.REST.value,
            "end_point": f"http://test.api/endpoint{i}",
            "response_tag": "data",
            "process_task_id": test_data["task"].id
        }
        client.post("/api/connectors/", json=connector_data)
    
    response = client.get("/api/connectors/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3

def test_update_connector(client, db_session, test_data):
    # First create a connector
    connector_data = {
        "data_type": DataType.Single.value,
        "connector_type": ConnectorType.WebService.value,
        "service_type": ServiceType.REST.value,
        "end_point": "http://test.api/endpoint",
        "response_tag": "data",
        "process_task_id": test_data["task"].id
    }
    create_response = client.post("/api/connectors/", json=connector_data)
    created_connector = create_response.json()
    
    # Update it
    update_data = connector_data.copy()
    update_data["end_point"] = "http://updated.api/endpoint"
    response = client.put(f"/api/connectors/{created_connector['id']}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["end_point"] == "http://updated.api/endpoint"

def test_delete_connector(client, db_session, test_data):
    # First create a connector
    connector_data = {
        "data_type": DataType.Single.value,
        "connector_type": ConnectorType.WebService.value,
        "service_type": ServiceType.REST.value,
        "end_point": "http://test.api/endpoint",
        "response_tag": "data",
        "process_task_id": test_data["task"].id
    }
    create_response = client.post("/api/connectors/", json=connector_data)
    created_connector = create_response.json()
    
    # Delete it
    response = client.delete(f"/api/connectors/{created_connector['id']}")
    assert response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(f"/api/connectors/{created_connector['id']}")
    assert get_response.status_code == 404 