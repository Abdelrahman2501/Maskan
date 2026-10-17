from fastapi import APIRouter
from fastapi.testclient import TestClient
from pydantic import BaseModel

from app.main import create_app


def test_not_found_envelope(client: TestClient) -> None:  # covers: PLAT-004, AC-000-3
    response = client.get("/api/v1/does-not-exist")

    assert response.status_code == 404
    error = response.json()["error"]
    assert error["code"] == "NOT_FOUND"
    assert error["request_id"] == response.headers["X-Request-ID"]


def test_validation_envelope() -> None:  # covers: PLAT-004, AC-000-4
    class Payload(BaseModel):
        email: str

    router = APIRouter()

    @router.post("/echo")
    def echo(payload: Payload) -> Payload:
        return payload

    app = create_app()
    app.include_router(router)
    with TestClient(app) as client:
        response = client.post("/echo", json={})

    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "VALIDATION_ERROR"
    assert error["details"] == [{"field": "email", "message": "Field required"}]


def test_unhandled_error_is_generic() -> None:  # covers: PLAT-004, SEC-014
    router = APIRouter()

    @router.get("/boom")
    def boom() -> None:
        raise RuntimeError("secret internal detail")

    app = create_app()
    app.include_router(router)
    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get("/boom")

    assert response.status_code == 500
    assert response.json()["error"]["code"] == "INTERNAL_ERROR"
    assert "secret internal detail" not in response.text
    assert response.json()["error"]["request_id"]


def test_request_id_generated(client: TestClient) -> None:  # covers: PLAT-005, AC-000-5
    response = client.get("/api/v1/health")
    assert len(response.headers["X-Request-ID"]) == 32


def test_request_id_echoed_when_valid(client: TestClient) -> None:  # covers: PLAT-005
    response = client.get("/api/v1/health", headers={"X-Request-ID": "abc-12345678"})
    assert response.headers["X-Request-ID"] == "abc-12345678"


def test_request_id_replaced_when_invalid(client: TestClient) -> None:  # covers: PLAT-005
    response = client.get("/api/v1/health", headers={"X-Request-ID": "<script>"})
    assert response.headers["X-Request-ID"] != "<script>"


def test_security_headers(client: TestClient) -> None:  # covers: SEC-019
    response = client.get("/api/v1/health")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
