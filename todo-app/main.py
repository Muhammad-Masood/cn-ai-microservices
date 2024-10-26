from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database.connection import perform_migration, get_session
from database.models import Todo
from sqlmodel import Session, select, delete, update
from typing import Annotated
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from typing import Annotated
import asyncio
import json
from events import SSEEvent,EventModel
from sse_starlette.sse import EventSourceResponse

loop = asyncio.get_event_loop()

# Kafka Broker
kafka_broker: str = 'broker:19092'

# Producer
async def get_kafka_producer():
    try:
        producer = AIOKafkaProducer(bootstrap_servers=kafka_broker)
        await producer.start()
        yield producer
    finally:
        await producer.stop()
    
async def get_kafka_consumer():
    try:
        consumer = AIOKafkaConsumer(
            'todos-recom-topic',
            bootstrap_servers=kafka_broker,
            group_id="todo-recom-group-2",
            auto_offset_reset='earliest',
            # loop=loop
        )
        # Start the consumer.
        await consumer.start()
        print("inside get_kafka_consumer: Consumer started!")
        yield consumer
    finally:
        await consumer.stop()


# Consume todo recommendations
# async def consume_todo_recom(topic: str, bootstrap_servers):
#     # Create a consumer instance.
#     consumer = AIOKafkaConsumer(
#         topic,
#         bootstrap_servers=bootstrap_servers,
#         group_id="todo-recom-group-2",
#         auto_offset_reset='earliest',
#         loop=loop
#     )
#     # Start the consumer.
#     await consumer.start()
#     print("Consumer started!")
#     try:
#          async for message in consumer:
#             todo_recommendations = message.value.decode()
#             print("consumed_todo_recom: ", todo_recommendations) 
#     finally:
#         await consumer.stop()

@asynccontextmanager
async def lifespan(app: FastAPI):
    
    print("Creating tables..")
    perform_migration()
    # asyncio.create_task(consume_todo_recom('todos-recom-topic', kafka_broker))
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

async def produce_todo_title(todo_title: str, producer: AIOKafkaProducer):
    todo_title_ser = (todo_title).encode("utf-8")
    await producer.send_and_wait("todo-topic", todo_title_ser)
    print("Produced todo title: ", todo_title)

@app.get('/todo/consume_recommendations')
# async def consume_recommendations(consumer: Annotated[AIOKafkaConsumer, Depends(get_kafka_consumer)]):
async def consume_recommendations():
        # data = await consume_data()
        # todo_recommendations = []
        # print("consumer_group_id: ", consumer._group_id)  
        # async for message in consumer:
        #     data = json.loads(message.value.decode())
        #     todo_recommendations.append(data)
        #     if(len(todo_recommendations) >= 10):
        #         break
        #     print("data: ",data)
        return {"todo_recommendations": "todo_recommendations"}

#             # Optionally break after consuming a specific number of messages
#             if len(todo_recommendations) >= 10:  # Adjust the number as needed
#                 break
            
#         return {"todo_recommendations": todo_recommendations}
    
#     except Exception as e:
#         print(f"Error consuming messages: {e}")
#         return {"error": "Failed to consume messages"}
    
#     finally:
#         await consumer.stop()

# Store Todo in database
def storeTodo(todo: Todo, session: Session):
    session.add(todo)
    session.commit()
    session.refresh(todo)

@app.post('/todo/create')
def create_todo(todo: Todo, session: Annotated[Session, Depends(get_session)]) -> Todo:
    storeTodo(todo, session)
    return todo

@app.post('/todo/create_and_produce')
async def create_and_produce(todo: Todo, session: Annotated[Session, Depends(get_session)], producer: Annotated[AIOKafkaProducer, Depends(get_kafka_producer)]):
    storeTodo(todo, session)
    await produce_todo_title(todo.title, producer)
    return 

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


# Events

@app.post('/emit')
def new_event(event: EventModel):
    SSEEvent.add(event)
    return {"message":f"Event added successfully. New count: {SSEEvent.count()}"}

@app.get('/stream_events')
def stream_events(req: Request):
    async def stream_generator():
        while True:
            isDisconnected = await req.is_disconnected()
            if isDisconnected:
                print("SSE Disconnected!")
                break
            sse_event = SSEEvent.get_event()
            if sse_event:
                yield "data {}".format(sse_event.model_dump_json())
            await asyncio.sleep(1)
    return EventSourceResponse(stream_generator())