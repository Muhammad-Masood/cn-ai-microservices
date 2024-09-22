from pydantic import BaseModel, Field
from typing import Optional
import uuid

class Todo(BaseModel):
    id: Optional[uuid.UUID] = Field(primary_key=True, default_factory=uuid.uuid4)
    title: str = Field(nullable=False) 
    status: bool = Field(default=False)