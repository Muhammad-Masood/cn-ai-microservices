from fastapi import testclient
from index import app
from pytypes import Todo

client = testclient.TestClient(app=app)

def test_home():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == "Todo Recommendation AI"

def test_recommendTodos():
    test_todo: Todo = Todo(title="Go to GYM")
    response = client.post('/recommendtodos', data=test_todo.model_dump_json())
    todos: list[Todo] = response.json()
    print(todos)
    assert response.status_code == 200
    assert len(todos) == 5
    assert all(todo['title'] != test_todo.title for todo in todos)