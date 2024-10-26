from collections import deque
from pydantic import BaseModel

class EventModel(BaseModel):
    type: str
    message: str

class SSEEvent:
    Events = deque()

    @staticmethod
    def add(event: EventModel):
        SSEEvent.Events.append(event)
    
    @staticmethod
    def get_event():
        if(len(SSEEvent.Events)>0):
            return SSEEvent.Events.popleft()
        return None
    
    @staticmethod
    def count():
        return len(SSEEvent.Events)