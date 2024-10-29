from sqlmodel import Field, SQLModel
from uuid import uuid4, UUID
from typing import Optional
from pydantic import BaseModel

class Todo(SQLModel, table=True):
    id: Optional[UUID] = Field(primary_key=True, default_factory=uuid4)
    title: str = Field(nullable=False)
    status: bool = Field(default=False)

class ConsumedTodo(BaseModel):
    todos: list[str]
