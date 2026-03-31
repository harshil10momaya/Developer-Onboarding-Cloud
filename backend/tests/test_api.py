"""
Basic API tests for CI/CD pipeline.
Run: pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ==================== HEALTH ====================
def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Developer Onboarding Cloud" in data["app"]


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# ==================== AUTH ====================
def test_register_user():
    response = client.post("/api/auth/register", json={
        "email": "testuser@example.com",
        "password": "testpass123",
        "full_name": "Test User",
        "role": "developer",
        "dev_role": "backend",
    })
    # 201 if new, 400 if already exists
    assert response.status_code in [201, 400]


def test_login():
    # Register first
    client.post("/api/auth/register", json={
        "email": "logintest@example.com",
        "password": "testpass123",
        "full_name": "Login Test",
        "role": "developer",
        "dev_role": "backend",
    })
    # Login
    response = client.post("/api/auth/login", json={
        "email": "logintest@example.com",
        "password": "testpass123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid():
    response = client.post("/api/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "wrongpass",
    })
    assert response.status_code == 401


def test_me_unauthenticated():
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_authenticated():
    # Register + login
    client.post("/api/auth/register", json={
        "email": "metest@example.com",
        "password": "testpass123",
        "full_name": "Me Test",
        "role": "developer",
        "dev_role": "frontend",
    })
    login = client.post("/api/auth/login", json={
        "email": "metest@example.com",
        "password": "testpass123",
    })
    token = login.json()["access_token"]

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "metest@example.com"
    assert data["full_name"] == "Me Test"
    assert data["role"] == "developer"


# ==================== AUTHENTICATED ENDPOINTS ====================
@pytest.fixture
def auth_headers():
    """Get auth headers for a test user."""
    client.post("/api/auth/register", json={
        "email": "fixture@example.com",
        "password": "testpass123",
        "full_name": "Fixture User",
        "role": "developer",
        "dev_role": "backend",
    })
    login = client.post("/api/auth/login", json={
        "email": "fixture@example.com",
        "password": "testpass123",
    })
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_list_repositories(auth_headers):
    response = client.get("/api/repositories/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_repository(auth_headers):
    response = client.post("/api/repositories/", headers=auth_headers, json={
        "name": "Test Repo",
        "url": "https://github.com/test/repo",
        "description": "Test repository",
        "tech_stack": ["Python", "FastAPI"],
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Repo"
    assert data["is_analyzed"] == False


def test_dashboard_stats(auth_headers):
    response = client.get("/api/dashboard/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_repositories" in data
    assert "active_developers" in data
    assert "total_courses" in data


def test_list_modules(auth_headers):
    response = client.get("/api/modules", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_learning_paths(auth_headers):
    response = client.get("/api/learning-paths", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_courses(auth_headers):
    response = client.get("/api/courses", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_mentors(auth_headers):
    response = client.get("/api/mentors/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_discussions(auth_headers):
    response = client.get("/api/discussions/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_discussion(auth_headers):
    response = client.post("/api/discussions/", headers=auth_headers, json={
        "title": "Test Discussion",
        "body": "This is a test",
        "category": "General",
    })
    assert response.status_code == 201
    assert response.json()["title"] == "Test Discussion"


def test_list_notifications(auth_headers):
    response = client.get("/api/mentors/notifications", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_pipelines(auth_headers):
    response = client.get("/api/pipelines/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_code_analysis_list(auth_headers):
    response = client.get("/api/code-analysis/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
