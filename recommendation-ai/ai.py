import os
from dotenv import load_dotenv
from pytypes import Todo
import json
from groq import Groq

# _:bool = load_dotenv()

client = Groq(
    # api_key=os.environ.get("GROQ_API_KEY"),
    api_key="******************************",
)

def recommendSimilarTasks(task: str) -> list[str]:
    chat_completion = client.chat.completions.create(
    messages=[
        {"role": "system", "content": "You are a helpful todo assistant that will analyze the given todo and you will recommend the user 5 similar todos. Provide the output in JSON, and the array variable name should be similar_todos, the arary should be like [suggesed_todo1,suggested_todo2,suggested_todo3,...]"},  
        {
            "role": "user",
            "content": task,
        }
    ],
    model="llama3-8b-8192",
    response_format={
        "type": "json_object"
    }
    )
    content = chat_completion.choices[0].message.content
    todos: list[Todo] = json.loads(content).get("similar_todos", [])
    return todos

# recommendSimilarTasks("make a todo app")
