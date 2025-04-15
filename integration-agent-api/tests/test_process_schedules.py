import pytest
from fastapi.testclient import TestClient
from tests.conftest import print_db_contents
from models.models import Recurrence
from datetime import datetime, timezone

def test_create_process_schedule(client, db_session, test_data):
    print("\nBefore creating schedule:")
    print_db_contents(db_session)
    
    schedule_data = {
        "process_id": test_data["process"].id,
        "recurrence_type": Recurrence.Daily.value,
        "start_date": datetime.now(timezone.utc).isoformat(),
        "enabled": True,
        "hour": 10,
        "minute": 30
    }
    
    response = client.post("/api/process-schedules/", json=schedule_data)
    assert response.status_code == 200
    data = response.json()
    assert data["process_id"] == test_data["process"].id
    assert data["recurrence_type"] == Recurrence.Daily.value
    assert data["hour"] == 10
    assert data["minute"] == 30

def test_create_invalid_schedule(client, test_data):
    # Test creating a daily schedule without required hour/minute
    schedule_data = {
        "process_id": test_data["process"].id,
        "recurrence_type": Recurrence.Daily.value,
        "start_date": datetime.now(timezone.utc).isoformat(),
        "enabled": True
    }
    
    response = client.post("/api/process-schedules/", json=schedule_data)
    assert response.status_code == 400
    assert "requires hour and minute values" in response.json()["detail"]

def test_create_weekly_schedule(client, test_data):
    schedule_data = {
        "process_id": test_data["process"].id,
        "recurrence_type": Recurrence.Weekly.value,
        "start_date": datetime.now(timezone.utc).isoformat(),
        "enabled": True,
        "day_of_week": 1,  # Tuesday
        "hour": 15,
        "minute": 0
    }
    
    response = client.post("/api/process-schedules/", json=schedule_data)
    assert response.status_code == 200
    data = response.json()
    assert data["day_of_week"] == 1
    assert data["hour"] == 15
    assert data["minute"] == 0

def test_create_monthly_schedule(client, test_data):
    schedule_data = {
        "process_id": test_data["process"].id,
        "recurrence_type": Recurrence.Monthly.value,
        "start_date": datetime.now(timezone.utc).isoformat(),
        "enabled": True,
        "day_of_month": 15,
        "hour": 12,
        "minute": 0
    }
    
    response = client.post("/api/process-schedules/", json=schedule_data)
    assert response.status_code == 200
    data = response.json()
    assert data["day_of_month"] == 15
    assert data["hour"] == 12
    assert data["minute"] == 0

def test_create_yearly_schedule(client, test_data):
    schedule_data = {
        "process_id": test_data["process"].id,
        "recurrence_type": Recurrence.Yearly.value,
        "start_date": datetime.now(timezone.utc).isoformat(),
        "enabled": True,
        "month": 6,
        "day_of_month": 15,
        "hour": 9,
        "minute": 0
    }
    
    response = client.post("/api/process-schedules/", json=schedule_data)
    assert response.status_code == 200
    data = response.json()
    assert data["month"] == 6
    assert data["day_of_month"] == 15
    assert data["hour"] == 9
    assert data["minute"] == 0

def test_get_process_schedule(client, db_session, test_data):
    # First create a schedule
    schedule_data = {
        "process_id": test_data["process"].id,
        "recurrence_type": Recurrence.Daily.value,
        "start_date": datetime.now(timezone.utc).isoformat(),
        "enabled": True,
        "hour": 10,
        "minute": 30
    }
    create_response = client.post("/api/process-schedules/", json=schedule_data)
    created_schedule = create_response.json()
    
    # Then get it
    response = client.get(f"/api/process-schedules/{created_schedule['id']}")
    assert response.status_code == 200
    data = response.json()
    assert data["hour"] == 10
    assert data["minute"] == 30

def test_get_all_process_schedules(client, test_data):
    # Create multiple schedules
    for hour in range(3):
        schedule_data = {
            "process_id": test_data["process"].id,
            "recurrence_type": Recurrence.Daily.value,
            "start_date": datetime.now(timezone.utc).isoformat(),
            "enabled": True,
            "hour": hour,
            "minute": 0
        }
        client.post("/api/process-schedules/", json=schedule_data)
    
    response = client.get("/api/process-schedules/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3

def test_update_process_schedule(client, test_data):
    # First create a schedule
    schedule_data = {
        "process_id": test_data["process"].id,
        "recurrence_type": Recurrence.Daily.value,
        "start_date": datetime.now(timezone.utc).isoformat(),
        "enabled": True,
        "hour": 10,
        "minute": 30
    }
    create_response = client.post("/api/process-schedules/", json=schedule_data)
    created_schedule = create_response.json()
    
    # Update it
    update_data = schedule_data.copy()
    update_data["hour"] = 14
    update_data["minute"] = 45
    response = client.put(
        f"/api/process-schedules/{created_schedule['id']}",
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["hour"] == 14
    assert data["minute"] == 45

def test_delete_process_schedule(client, test_data):
    # First create a schedule
    schedule_data = {
        "process_id": test_data["process"].id,
        "recurrence_type": Recurrence.Daily.value,
        "start_date": datetime.now(timezone.utc).isoformat(),
        "enabled": True,
        "hour": 10,
        "minute": 30
    }
    create_response = client.post("/api/process-schedules/", json=schedule_data)
    created_schedule = create_response.json()
    
    # Delete it
    response = client.delete(f"/api/process-schedules/{created_schedule['id']}")
    assert response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(f"/api/process-schedules/{created_schedule['id']}")
    assert get_response.status_code == 404 