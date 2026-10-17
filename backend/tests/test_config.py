import pytest
from pydantic import ValidationError

from app.core.config import Settings

STRONG_SECRET = "x" * 48


def _production(**overrides: object) -> Settings:
    values: dict[str, object] = {
        "environment": "production",
        "secret_key": STRONG_SECRET,
        "debug": False,
        "cors_origins": "https://app.example.com",
    }
    values.update(overrides)
    return Settings(_env_file=None, **values)  # type: ignore[arg-type]


def test_production_accepts_safe_config() -> None:  # covers: PLAT-003
    settings = _production()
    assert settings.cors_origins == ["https://app.example.com"]


def test_production_guards_placeholder_secret() -> None:  # covers: PLAT-003, AC-000-6
    with pytest.raises(ValidationError, match="SECRET_KEY"):
        _production(secret_key="change-me-in-every-environment")


def test_production_guards_short_secret() -> None:  # covers: PLAT-003, AC-000-6
    with pytest.raises(ValidationError, match="SECRET_KEY"):
        _production(secret_key="short")


def test_production_guards_debug() -> None:  # covers: PLAT-003, AC-000-6
    with pytest.raises(ValidationError, match="DEBUG"):
        _production(debug=True)


def test_production_guards_wildcard_cors() -> None:  # covers: PLAT-003, SEC-015, AC-000-6
    with pytest.raises(ValidationError, match="CORS_ORIGINS"):
        _production(cors_origins="*")


def test_local_allows_defaults() -> None:  # covers: PLAT-003
    settings = Settings(_env_file=None, environment="local")
    assert settings.cors_origins == ["http://localhost:3000"]


def test_cors_origins_split_from_comma_string() -> None:
    settings = Settings(_env_file=None, cors_origins="http://a.test, http://b.test")
    assert settings.cors_origins == ["http://a.test", "http://b.test"]
