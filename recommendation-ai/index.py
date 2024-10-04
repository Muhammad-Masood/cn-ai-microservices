# index.py

from contextlib import asynccontextmanager
from typing import Union, Optional, Annotated
from pytypes import Todo
from fastapi import FastAPI, Depends
from typing import AsyncGenerator
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
import asyncio
import json
from ai import recommendSimilarTasks

async def consume_messages(topic, bootstrap_servers):
    # Create a consumer instance.
    consumer = AIOKafkaConsumer(
        topic,
        bootstrap_servers=bootstrap_servers,
        group_id="todo-recom-group",
        auto_offset_reset='earliest'
    )

    # Start the consumer.
    await consumer.start()
    try:
        # Continuously listen for messages.
        async for message in consumer:
            print(f"Received message: {message.value.decode()} on topic {message.topic}")
            # Here you can add code to process each message.
            # Example: parse the message, store it in a database, etc.
    finally:
        # Ensure to close the consumer when done.
        await consumer.stop()

# Kafka Producer as a dependency
async def get_kafka_producer():
    producer = AIOKafkaProducer(bootstrap_servers='broker:19092', client_id='todo-app')
    # producer = AIOKafkaProducer(bootstrap_servers='localhost:19092', client_id='todo-app')
    await producer.start()
    try:
        yield producer
    finally:
        await producer.stop()

@asynccontextmanager
async def lifespan(app: FastAPI)-> AsyncGenerator[None, None]:
    task = asyncio.create_task(consume_messages('todos-recom-topic', 'broker:19092'))
    # task = asyncio.create_task(consume_messages('todos-recom-topic', 'localhost:19092'))
    yield

app = FastAPI(lifespan=lifespan, title="Recommendation System AI")

@app.get('/')
def main():
    return 'Todo Recommendation AI'


@app.post("/recommendtodos/")
async def recommend_todos(todo: Todo, producer: Annotated[AIOKafkaProducer, Depends(get_kafka_producer)]):
        try:
            task = todo.title
            tasks: list[str] = recommendSimilarTasks(task)
            tasks = [t for t in tasks if t!=task]
            todos: list[Todo] = [Todo(title=task) for task in tasks]
            # todos_filtered = [{field: getattr(todo, field) for field in todo.model_dump()} for todo in todos]
            # print("todos_filtered -> ",todos_filtered)
            # tasks_serialized = [json.dumps(t).encode("utf-8") for t in tasks]
            todos_data_ser = json.dumps({"todos":tasks}).encode("utf-8")
            print(todos)
            await producer.send_and_wait("todos-recom-topic", todos_data_ser)
            return todos
            # return "todos"
        except Exception as e:
            print(e)
            return {"error": str(e)}
        