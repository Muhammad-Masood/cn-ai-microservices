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