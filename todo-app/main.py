from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database.connection import perform_migration, get_session
from database.models import Todo
from sqlmodel import Session, select, delete, update
from typing import Annotated


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating tables..")
    perform_migration()
    yield

app = FastAPI(lifespan=lifespan, title="Todo App")

@app.get('/')
def home():
    return {"message": "Todo App","about":"This is a Todo App which is built using python poetry, Fast API and Sql Model. Please check out the README for more details."}

origins = [
    "http://localhost:3000",
    "localhost:3000",
    "http://frontend:3000"
]

# Need CORSMiddleware to make cross-origin requests 
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post('/todo/post')
def create_todo(todo: Todo, session: Annotated[Session, Depends(get_session)]) -> Todo:
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo

@app.get('/todo/{todo_id}')
def get_todo(todo_id: str, session: Annotated[Session, Depends(get_session)]) -> Todo:
    todo = session.exec(select(Todo).where(Todo.id == todo_id)).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@app.patch('/todo/{todo_id}')
def update_todo(todo_id: str, todo: Todo, session: Annotated[Session, Depends(get_session)]):
    try:
        updated_todo = session.exec(select(Todo).where(Todo.id == todo_id)).one()
        updated_todo.title = todo.title
        updated_todo.status = todo.status
        session.add(updated_todo)
        session.commit()
        session.refresh(updated_todo)
        return {"message": "Todo updated successfully"}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.delete('/todo/{todo_id}')
def delete_todo(todo_id: str, session: Annotated[Session, Depends(get_session)]) -> dict[str,str]:
    try:
        session.exec(delete(Todo).where(Todo.id == todo_id))
        session.commit()
    except:
        session.rollback()
        return {"message": "Something went wrong. Please try again."}
    return {"message": "Todo deleted successfully"}
    

@app.get('/todos', response_model=list[Todo])
def get_todos(session: Annotated[Session, Depends(get_session)]) -> list[Todo]:
    todos = session.exec(select(Todo)).all()
    return todos