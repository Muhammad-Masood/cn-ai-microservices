"use server";

import axios from "axios";
import { Todo } from "./utils";
import { Kafka } from "kafkajs";

export const getTodos = async (): Promise<Todo[]> => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL_DOCKER}/todos`
    );
    console.log("todos_data ", res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const deleteTodo = async (id: string): Promise<String> => {
  try {
    console.log(id);
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_BASE_URL_DOCKER}/todo/${id}`
    );
    return res.data.message;
  } catch (error) {
    console.log(error);
    return String(error);
  }
};

export const updateTodo = async (updatedTodo: Todo): Promise<String> => {
  try {
    console.log(updatedTodo);
    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL_DOCKER}/todo/${updatedTodo.id}`,
      updatedTodo
    );
    return res.data.message;
  } catch (error) {
    console.log(error);
    return String(error);
  }
};

////////////// KAFKA ///////////////

const kafka = new Kafka({
  clientId: "todo-app",
  // brokers: [`${process.env.BROKER_NAME}:9092`],
  brokers: [`broker:19092`],
});

const consumer = kafka.consumer({ groupId: "todo-recom-group" });

const runConsumer = async () => {
  consumer.connect();
  await consumer.subscribe({ topic: "todos-recom-topic", fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        topic,
        offset: message.offset,
        value: message.value!.toString(),
      });
      // console.log(message.value.)
    },
  });
};

runConsumer().catch((error) => console.error(error));
