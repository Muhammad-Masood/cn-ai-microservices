"use server";

import axios from "axios";
import { ConsumedDataTodo, Todo } from "./utils";
import { Kafka, Producer } from "kafkajs";
import { Server } from "socket.io";
import { createServer } from "http";

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

// const kafka = new Kafka({
//   clientId: "todo-app",
//   // brokers: [`${process.env.BROKER_NAME}:9092`],
//   brokers: [`broker:19092`],
// });

// const consumer = kafka.consumer({ groupId: "todo-recom-group-client" });

// produce data to kafka
// export const produceTodoRecomData = async (todo: string) => {
//   const producer = kafka.producer();
//   await producer.connect();
//   try {
//     await producer.send({
//       topic: "todo-topic",
//       messages: [{ value: Buffer.from(todo, "utf-8") }],
//     });
//     console.log("Todo produced successfully for recommendations.");
//   } catch (error) {
//     console.log(error);
//   } finally {
//     await producer.disconnect();
//   }
// };

// consume data from kafka

// export const consumeTodoRecommendations = async () => {
//   try {
//     await consumer.connect();
//     await consumer.subscribe({
//       topic: "todos-recom-topic",
//       fromBeginning: true,
//     });
//     // let consumedTodos: string[] = [];
//     let consumedData;
//     await consumer.run({
//       eachMessage: async ({ message }) => {
//         const data = JSON.parse(message.value!.toString());
//         // const todos = data.todos;
//         console.log("consumed_todos -> ", data);
//         // consumedTodos = todos;
//         consumedData = data;
//       },
//     });
//     await consumer.disconnect();
//     return consumedData;
//   } catch (error) {
//     console.log(error);
//   }
// };

// subscribe to kafka consumer

// const subscribeConsumer = async () => {
//   await consumer.connect();
//   await consumer.subscribe({
//     topic: "todos-recom-topic",
//     fromBeginning: true,
//   });
// };

// // Web Socket

// const io = new Server();
// const consumeData = async () => {
//   io.on("connection", async (socket) => {
//     console.log("server socket id -> ", socket.id);
//     socket.on("stop", () => socket.disconnect());
//     try {
//       await subscribeConsumer();
//       await consumer.run({
//         eachMessage: async ({ message }) => {
//           const data: ConsumedDataTodo = JSON.parse(message.value!.toString());
//           const todos = data.todos;
//           console.log("consumed_todos -> ", todos);
//           io.emit("consumed_todos", todos);
//         },
//       });
//     } catch (error) {
//       console.error("Error in message consumption:", error);
//     }
//   });
// };

// consumeData().catch((error) => console.log("Error starting consumer and socket:",error));
