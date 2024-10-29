import CreateBar from "@/components/CreateBar";
import RecommendedTodos from "@/components/RecommendedTodos";
import TodoList from "@/components/Todos";
import { getTodos } from "@/lib/server";
import { ConsumedDataTodo, Todo } from "@/lib/utils";
import { Kafka } from "kafkajs";
import { Server } from "socket.io";
import { io } from "socket.io-client";
export const dynamic = "force-dynamic";

export default async function Home() {
  const todos: Todo[] = await getTodos();
  let consumedTodos: string[] = [];
  // const data = await consumeTodoRecommendations();
  // console.log("consume data received -> ", data);
  // const response = await fetch("http://localhost:3000/api/consumer");
  // const data = await response.json();
  // const consumedTodos = data.consumedTodos;

  // websocket
  // const socket = io();
  // socket.on("consumed_todos", (data) => {
  //   console.log("received_data ->", data);
  // });
  // console.log("consumed_todos_page -> ", consumedTodos, data);

  return (
    <>
    <div className="">
      <p className="font-semibold text-2xl text-center pt-[2.5rem]">Smart Todo App</p>
      <div className="flex flex-col md:flex-row lg:flex-row items-center justify-evenly h-screen">
        <div className="w-full sm:w-[70%] md:w-[35%] h-[500px] shadow-lg rounded-lg border ">
          <div className="flex p-5 w-full h-full flex-col justify-between items-center">
            <div className="w-full h-[85%] overflow-y-scroll overflow-x-hidden">
              <TodoList todos={todos} />
            </div>
            <div className="py-3">
              <CreateBar />
            </div>
          </div>
        </div>
        <RecommendedTodos consumedTodos={consumedTodos} />
      </div>
    </div>
    </>
  );
}
