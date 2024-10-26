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

loop = asyncio.get_event_loop()
kafka_broker='broker:19092'

# Consume data from client
async def consume_messages(topic: str, bootstrap_servers):
    # Create a consumer instance.
    consumer = AIOKafkaConsumer(
        topic,
        bootstrap_servers=bootstrap_servers,
        group_id="todo-recom-group",
        auto_offset_reset='earliest',
        loop=loop
    )

    # Start the consumer.
    await consumer.start()
    try:
         async for message in consumer:
            todo_title = message.value.decode()
            print("consumed in ai service: ", todo_title)
            recom_tasks = await recommend_todos(Todo(title=todo_title, status=False))
            # await produce_recom_tasks_list(recom_tasks) 
    finally:
        await consumer.stop()

# Kafka Producer as a dependency
# async def get_kafka_producer():
    # producer = AIOKafkaProducer(bootstrap_servers='broker:19092')
    # await producer.start()
    # try:
    #     yield producer
    # finally:
    #     await producer.stop()

@asynccontextmanager
async def lifespan(app: FastAPI)-> AsyncGenerator[None, None]:
    print("Starting consumer...")
    asyncio.create_task(consume_messages('todo-topic', kafka_broker))
    yield

app = FastAPI(lifespan=lifespan, title="Recommendation System AI")

@app.get('/')
def main():
    return 'Todo Recommendation AI'

# Produce data to kafka
@app.post("/recommendtodos/")
async def recommend_todos(todo: Todo):
        try:
            task = todo.title
            tasks: list[str] = recommendSimilarTasks(task)
            tasks = [t for t in tasks if t!=task]
            await produce_recom_tasks_list(tasks)
            return tasks
        except Exception as e:
            print(e)
            return {"error": str(e)}

async def produce_recom_tasks_list(recom_tasks: list[str]):
    try:
        producer = AIOKafkaProducer(bootstrap_servers=kafka_broker)
        await producer.start()
        todos_data_ser = json.dumps({"todos":recom_tasks}).encode("utf-8")
        print(recom_tasks)
        await producer.send_and_wait("todos-recom-topic", todos_data_ser)
    finally:
        await producer.stop()