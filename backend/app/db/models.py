"""Import every ORM model here so Base.metadata is complete for Alembic autogenerate.

No models exist yet; FEAT-001 adds the first (users, sessions, roles).
"""

from app.db.base import Base

__all__ = ["Base"]
