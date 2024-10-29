import { type ClassValue, clsx } from "clsx";
import { Kafka } from "kafkajs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types

export type Todo = {
  id: string;
  title: string;
  status: boolean;
};

export type ConsumedDataTodo = {
  todos: string[];
};

export type EventModel = {
  type: string;
  message: ConsumedDataTodo;
};
