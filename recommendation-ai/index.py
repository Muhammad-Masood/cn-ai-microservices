from fastapi import FastAPI
from ai import recommendSimilarTasks
from pytypes import Todo

app: FastAPI = FastAPI(title='Recommendation System AI')


@app.get('/')
def main():
    return 'Todo Recommendation AI'

@app.post('/recommendtodos')
async def recommend_todos(todo: Todo):
    try:
        task = todo.title
        tasks: list[str] = recommendSimilarTasks(task)
        tasks = [t for t in tasks if t!=task]
        todos: list[Todo] = [Todo(title=task) for task in tasks]
        return todos
    except Exception as e:
        print(e)
        return {"error": str(e)}