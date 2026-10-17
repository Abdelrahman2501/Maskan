"""Application settings, loaded from environment variables (PLAT-003)."""

from functools import lru_cache
from typing import Annotated, Literal

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

SECRET_KEY_PLACEHOLDER = "change-me-in-every-environment"  # noqa: S105 - sentinel, not a secret
MIN_SECRET_KEY_LENGTH = 32

Environment = Literal["local", "test", "staging", "production"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Root .env when run from backend/, or a backend-local .env.
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: Environment = "local"
    debug: bool = False
    secret_key: SecretStr = SecretStr(SECRET_KEY_PLACEHOLDER)
    database_url: str = "postgresql+psycopg://maskan:maskan@localhost:5433/maskan"
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:3000"]
    )
    log_level: str = "INFO"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def is_deployed(self) -> bool:
        return self.environment in ("staging", "production")

    @model_validator(mode="after")
    def _guard_deployed_environments(self) -> "Settings":
        if not self.is_deployed:
            return self
        problems: list[str] = []
        secret = self.secret_key.get_secret_value()
        if secret == SECRET_KEY_PLACEHOLDER or len(secret) < MIN_SECRET_KEY_LENGTH:
            problems.append(f"SECRET_KEY must be set to a random value of at least "
                            f"{MIN_SECRET_KEY_LENGTH} characters")
        if self.debug:
            problems.append("DEBUG must be false")
        if "*" in self.cors_origins:
            problems.append("CORS_ORIGINS must not contain '*'")
        if problems:
            raise ValueError(f"Unsafe {self.environment} configuration: " + "; ".join(problems))
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
