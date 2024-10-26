"use client";

import { ConsumedDataTodo } from "@/lib/utils";
import { useEffect, useState } from "react";

const RecommendedTodos = ({ consumedTodos }: { consumedTodos: string[] }) => {
  useEffect(() => {
    const sse = new EventSource(process.env.NEXT_PUBLIC_API_BASE_URL_CLIENT!+'/stream_events',{
      withCredentials: true
    });
    sse.onmessage = (event) => {
      console.log(event.data());
    }
  }, []);

  return (
    <div className="w-full sm:w-[70%] md:w-[35%] h-[500px] shadow-lg rounded-lg border">
      <p className="text-center pt-[2.5rem]">Recommendations for you</p>
      <div className="space-y-2 py-[2.5rem] px-[3rem]">
        {consumedTodos.map((todo: string, index: number) => (
          <p key={index}>{todo}</p>
        ))}
      </div>
    </div>
  );
};

export default RecommendedTodos;
